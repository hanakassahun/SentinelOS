import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const { getReport, refreshReport, enqueue } = vi.hoisted(() => ({
  getReport: vi.fn(),
  refreshReport: vi.fn(),
  enqueue: vi.fn(),
}));

vi.mock('../../services/prismaClient', () => ({
  default: {
    insight: { findMany: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock('../../queues/insightQueue', () => ({
  enqueueInsightGeneration: enqueue,
}));

vi.mock('../../services/insightService', () => ({
  getBehavioralInsightReport: getReport,
  refreshInsights: refreshReport,
}));

import { getInsights, triggerInsightQueue } from '../../api/controllers/insightsController';

describe('getInsights with insufficient source data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getReport.mockResolvedValue({
      userId: 'default',
      analysis: { totalEvents: 0 },
      insights: [],
      timeBlocks: [],
      events: [],
    });
    refreshReport.mockResolvedValue({
      userId: 'default',
      analysis: { totalEvents: 0 },
      insights: [],
      timeBlocks: [],
      events: [],
    });
    enqueue.mockResolvedValue({ queued: false, completed: true });
  });

  it('uses the canonical report and returns the current event analysis', async () => {
    const response = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await getInsights({ query: { force: 'true' } } as unknown as Request, response);

    expect(response.json).toHaveBeenCalledWith({
      insights: [],
      analysis: { totalEvents: 0 },
      timeBlocks: [],
    });
    expect(refreshReport).toHaveBeenCalledWith('default');
    expect(getReport).not.toHaveBeenCalled();
  });

  it('uses the read-only behavioral report when force is omitted', async () => {
    const response = { json: vi.fn() } as unknown as Response;

    await getInsights({ query: {} } as unknown as Request, response);

    expect(getReport).toHaveBeenCalledWith('default');
    expect(refreshReport).not.toHaveBeenCalled();
  });

  it('returns service unavailable when Redis-mode enqueue fails', async () => {
    enqueue.mockRejectedValue(new Error('Redis unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await triggerInsightQueue(
      { body: { userId: 'user-1' } } as unknown as Request,
      response,
    );

    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith({ error: 'Insight queue unavailable' });
  });
});