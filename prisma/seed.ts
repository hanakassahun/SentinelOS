// Example seed data generator (TypeScript)
import { v4 as uuid } from 'uuid';

export const seed = () => {
  return [{
    id: uuid(),
    user_id: uuid(),
    task_type: 'deep_work',
    planned_time: new Date().toISOString(),
    executed_time: new Date().toISOString(),
    energy_level: 4,
    mood_level: 4,
    difficulty: 3,
    outcome: 'success',
    created_at: new Date().toISOString(),
  }];
};
