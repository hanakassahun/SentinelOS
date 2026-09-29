export type EnergyLevel = 1|2|3|4|5;

export interface TaskEvent {
  plannedTime?: string | null;
  executedTime?: string | null;
  outcome?: string | null;
}

export interface BehavioralEvent {
  id: string;
  userId: string;
  taskType: string;
  plannedTime?: string;
  executedTime?: string;
  energyLevel?: EnergyLevel;
  moodLevel?: EnergyLevel;
  difficulty?: number;
  outcome?: 'success'|'fail';
  createdAt: string;
}
