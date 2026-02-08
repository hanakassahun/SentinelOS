export enum BehaviorType {
  ENERGY = 'ENERGY',
  MOOD = 'MOOD',
}

export type Rating = 1|2|3|4|5|6|7|8|9|10;

export interface Tag {
  id: string;
  name: string;
  category?: 'Location' | 'State' | 'Activity';
}

export interface LogEntry {
  id: string;
  userId: string;
  behaviorType: BehaviorType;
  value: Rating;
  expectedValue?: Rating;
  timestamp: string; // ISO timestamp
  timezone?: string;
  tags?: string[]; // tag ids
  note?: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  text: string;
  createdAt: string;
}
