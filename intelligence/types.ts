export type Rating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TaskEvent {
  id: string;
  userId: string;
  type: string;
  difficulty: number;
  plannedStart: string;
  timezone: string;
  localHour: number;
  localWeekday: number;
  cognitiveLoad?: number;
  plannedMinutes?: number;
  actualStart?: string;
  actualMinutes?: number;
  energyAtStart?: number;
  moodAtStart?: number;
  outcome?: 'SUCCESS' | 'FAIL' | null;
  createdAt: string;
}

export interface CheckInEvent {
  id: string;
  userId: string;
  kind: 'ENERGY' | 'MOOD';
  value: Rating;
  predictedValue?: Rating;
  timestamp: string;
  timezone?: string;
  note?: string;
  createdAt: string;
}
