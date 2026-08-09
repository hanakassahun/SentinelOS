import assert from 'node:assert/strict';
import { normalizeAnalyticsPayload } from '../services/payloadContract';

const normalized = normalizeAnalyticsPayload({
  energyLevel: 4,
  cognitiveLoad: 2,
  consecutiveHours: 3,
});

assert.equal(normalized.energy_level, 4);
assert.equal(normalized.cognitive_load, 2);
assert.equal(normalized.consecutive_hours, 3);

const fromSnake = normalizeAnalyticsPayload({
  energy_level: 5,
  cognitive_load: 3,
  consecutive_hours: 6,
});

assert.deepEqual(fromSnake, {
  energy_level: 5,
  cognitive_load: 3,
  consecutive_hours: 6,
});

console.log('payload-contract-ok');
