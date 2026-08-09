import { buildShadowScheduleFromBehavior } from '../services/shadowSchedule';

const sample = [
  { createdAt: new Date().toISOString(), outcome: 'success', energyLevel: 7, moodLevel: 6 },
  { createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), outcome: 'fail', energyLevel: 2, moodLevel: 3 },
  { createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), outcome: 'fail', energyLevel: 1, moodLevel: 2 },
  { createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), outcome: 'success', energyLevel: 5, moodLevel: 5 },
  { createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), outcome: 'fail', energyLevel: 3, moodLevel: 2 },
];

const points = buildShadowScheduleFromBehavior(sample as any);
console.log(JSON.stringify(points, null, 2));
console.log('shadow-schedule-ok');
