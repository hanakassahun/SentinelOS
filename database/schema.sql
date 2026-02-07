-- Core table: behavioral_events
CREATE TABLE IF NOT EXISTS behavioral_events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  task_type TEXT,
  planned_time TIMESTAMP,
  executed_time TIMESTAMP,
  energy_level INTEGER,
  mood_level INTEGER,
  difficulty INTEGER,
  outcome TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
