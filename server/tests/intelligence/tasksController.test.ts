import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

const { userUpsert, taskCreate, taskUpdate, refreshInsights } = vi.hoisted(() => ({
  userUpsert: vi.fn(),
  taskCreate: vi.fn(),
  taskUpdate: vi.fn(),
  refreshInsights: vi.fn(),
}));

vi.mock('../../services/prismaClient', () => ({
  default: {
    user: { upsert: userUpsert },
    task: { create: taskCreate, update: taskUpdate },
  },
}));

vi.mock('../../services/insightService', () => ({ refreshInsights }));

import { completeTask, createTask } from '../../api/controllers/tasksController';

function responseMock() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
}

describe('task lifecycle API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userUpsert.mockResolvedValue({ id: 'user-1' });
    taskCreate.mockResolvedValue({ id: 'task-1', tags: [] });
    taskUpdate.mockResolvedValue({ id: 'task-1', userId: 'user-1', outcome: 'SUCCESS' });
    refreshInsights.mockResolvedValue({ insights: [] });
  });

  it('normalizes type and derives local hour and ISO weekday on the server', async () => {
    const response = responseMock();
    const next = vi.fn() as unknown as NextFunction;
    await createTask({ body: {
      userId: 'user-1', type: '  Deep Work  ', difficulty: 4,
      plannedStart: '2025-01-06T01:30:00.000Z', timezone: 'America/Los_Angeles',
      localHour: 8, localWeekday: 5,
    } } as unknown as Request, response, next);

    expect(taskCreate.mock.calls[0][0].data).toMatchObject({
      type: 'deep work',
      localHour: 17,
      localWeekday: 7,
      timezone: 'America/Los_Angeles',
    });
    expect(taskCreate.mock.calls[0][0].data).not.toHaveProperty('localHour', 8);
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('rejects invalid difficulty and timezone input', async () => {
    const response = responseMock();
    await createTask({ body: {
      userId: 'user-1', type: 'work', difficulty: 6,
      plannedStart: '2025-01-06T01:30:00.000Z', timezone: 'Not/AZone',
    } } as unknown as Request, response, vi.fn() as unknown as NextFunction);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(taskCreate).not.toHaveBeenCalled();
  });

  it('refreshes insights after a task outcome is recorded', async () => {
    const response = responseMock();
    await completeTask({ params: { id: 'task-1' }, body: { actualMinutes: 50, outcome: 'SUCCESS' } } as unknown as Request, response, vi.fn() as unknown as NextFunction);

    expect(taskUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'task-1' },
      data: expect.objectContaining({ outcome: 'SUCCESS', actualMinutes: 50 }),
    }));
    expect(refreshInsights).toHaveBeenCalledWith('user-1');
  });
});