export type Rating = 1|2|3|4|5|6|7|8|9|10;

export interface Tag {
  id: string;
  name: string;
  category?: 'Location' | 'State' | 'Activity';
}

export interface CheckInEntry {
  id: string;
  userId: string;
  kind: 'ENERGY' | 'MOOD';
  value: Rating;
  predictedValue?: Rating;
  timestamp: string; // ISO timestamp
  timezone?: string;
  tags?: string[]; // tag ids
  note?: string;
  createdAt: string;
}

export interface TaskEntry {
  id: string;
  userId: string;
  type: string;
  difficulty: 1|2|3|4|5;
  plannedStart: string;
  timezone: string;
  localHour: number;
  localWeekday: number;
  outcome?: 'SUCCESS' | 'FAIL' | null;
}

export interface Insight {
  id: string;
  type: string;
  dedupeKey: string;
  message: string;
  sampleSize: number;
  status: 'NEW' | 'SEEN' | 'DISMISSED' | 'ACTED_ON';
  evidence: unknown;
  createdAt: string;
}
