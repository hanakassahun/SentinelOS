export interface AnalyticsPayloadLike {
  energyLevel?: number;
  cognitiveLoad?: number;
  consecutiveHours?: number;
  energy_level?: number;
  cognitive_load?: number;
  consecutive_hours?: number;
}

export interface NormalizedAnalyticsPayload {
  energy_level: number;
  cognitive_load: number;
  consecutive_hours: number;
}

export function normalizeAnalyticsPayload(payload: AnalyticsPayloadLike): NormalizedAnalyticsPayload {
  const normalized: NormalizedAnalyticsPayload = {
    energy_level: Number(payload.energy_level ?? payload.energyLevel ?? 0),
    cognitive_load: Number(payload.cognitive_load ?? payload.cognitiveLoad ?? 0),
    consecutive_hours: Number(payload.consecutive_hours ?? payload.consecutiveHours ?? 0),
  };

  return normalized;
}
