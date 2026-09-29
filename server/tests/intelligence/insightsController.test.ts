import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const { findMany, create } = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
}));

vi.mock('../../services/prismaClient', () => ({
  default: {
    log: { findMany },
    insight: { create },
  },
}));

vi.mock('../../queues/insightQueue', () => ({
  insightQueue: { add: vi.fn() },
}));

import { getInsights } from '../../api/controllers/insightsController';

describe('getInsights with insufficient source data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([]);
  });

  it('returns an empty analysis without persisting a placeholder insight', async () => {
    const response = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await getInsights({ query: { force: 'true' } } as unknown as Request, response);

    expect(response.json).toHaveBeenCalledWith({
      insights: [],
      analysis: { totalLogs: 0 },
    });
    expect(create).not.toHaveBeenCalled();
  });
});