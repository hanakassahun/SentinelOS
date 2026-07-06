import type {
  AnalyticsResponse,
  ComprehensiveAnalyticsData,
  DecisionMetricsData,
  BehaviorMetricsData,
  HealthScoreData,
} from '../types';

const ANALYTICS_BASE_PATH = '/api/analytics';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Analytics fetch failed: ${response.status} ${response.statusText} ${body}`);
  }
  return response.json() as Promise<T>;
}

export async function getComprehensiveAnalysis(userId: string) {
  return fetchJson<AnalyticsResponse<ComprehensiveAnalyticsData>>(`${ANALYTICS_BASE_PATH}/${encodeURIComponent(userId)}`);
}

export async function getDecisionMetrics(userId: string) {
  return fetchJson<AnalyticsResponse<DecisionMetricsData>>(`${ANALYTICS_BASE_PATH}/${encodeURIComponent(userId)}/decisions`);
}

export async function getBehaviorMetrics(userId: string) {
  return fetchJson<AnalyticsResponse<BehaviorMetricsData>>(`${ANALYTICS_BASE_PATH}/${encodeURIComponent(userId)}/behavior`);
}

export async function getHealthScore(userId: string) {
  return fetchJson<AnalyticsResponse<HealthScoreData>>(`${ANALYTICS_BASE_PATH}/${encodeURIComponent(userId)}/health`);
}
