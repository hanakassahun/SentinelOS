import { useCallback, useEffect, useState } from 'react';
import {
  getComprehensiveAnalysis,
  getDecisionMetrics,
  getBehaviorMetrics,
  getHealthScore,
} from '../services/analyticsService';
import type {
  AnalyticsResponse,
  ComprehensiveAnalyticsData,
  DecisionMetricsData,
  BehaviorMetricsData,
  HealthScoreData,
} from '../types';

export interface AnalyticsState {
  loading: boolean;
  error: string | null;
  comprehensive?: ComprehensiveAnalyticsData;
  decisions?: DecisionMetricsData;
  behavior?: BehaviorMetricsData;
  health?: HealthScoreData;
  refresh: () => Promise<void>;
}

export function useAnalyticsData(userId: string): AnalyticsState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comprehensive, setComprehensive] = useState<ComprehensiveAnalyticsData | undefined>(undefined);
  const [decisions, setDecisions] = useState<DecisionMetricsData | undefined>(undefined);
  const [behavior, setBehavior] = useState<BehaviorMetricsData | undefined>(undefined);
  const [health, setHealth] = useState<HealthScoreData | undefined>(undefined);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [overview, decisionsResult, behaviorResult, healthResult] = await Promise.all([
        getComprehensiveAnalysis(userId),
        getDecisionMetrics(userId),
        getBehaviorMetrics(userId),
        getHealthScore(userId),
      ]);

      setComprehensive(overview.data);
      setDecisions(decisionsResult.data);
      setBehavior(behaviorResult.data);
      setHealth(healthResult.data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setError('No userId provided');
      setLoading(false);
      return;
    }

    void refresh();
  }, [refresh, userId]);

  return {
    loading,
    error,
    comprehensive,
    decisions,
    behavior,
    health,
    refresh,
  };
}
