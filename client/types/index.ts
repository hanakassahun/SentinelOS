export enum BehaviorType {
  ENERGY = 'ENERGY',
  MOOD = 'MOOD',
}

export type Rating = 1|2|3|4|5|6|7|8|9|10;

export type SemanticRange = 'drained' | 'stable' | 'energized' | 'peak';

export interface Tag {
  id?: string;
  name: string;
  category?: 'Location' | 'State' | 'Activity';
}

export interface LogEntry {
  id: string;
  userId: string;
  behaviorType: BehaviorType;
  value: Rating;
  expectedValue?: Rating;
  timestamp: string; // ISO timestamp for the logged moment
  timezone?: string; // optional IANA timezone identifier
  tags?: string[]; // array of tag ids or names (normalized in DB)
  note?: string;
  createdAt: string;
}

// Backwards-compatible event shape (deprecated for new logs)
export interface BehavioralEvent {
  id: string;
  userId: string;
  taskType?: string;
  plannedTime?: string;
  executedTime?: string;
  energyLevel?: Rating;
  moodLevel?: Rating;
  difficulty?: number;
  outcome?: 'success' | 'fail';
  tags?: string[];
  note?: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  text: string;
  createdAt: string;
}
