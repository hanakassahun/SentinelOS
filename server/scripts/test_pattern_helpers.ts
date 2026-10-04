import { calculateAverage, detectTrend } from '../../intelligence/analytics/analyticsUtils';
import { correlateEnergy } from '../../intelligence/pattern-engine/energyCorrelation';

const up = [1,2,3,4,5,6,7,8,9,10];
const down = [10,9,8,7,6,5,4,3,2,1];
const stable = [5,5,5,5,5,5,5,5,5,5];
console.log('avg up', calculateAverage(up));
console.log('trend up', detectTrend(up));
console.log('trend down', detectTrend(down));
console.log('trend stable', detectTrend(stable));
console.log('corr planted energy/outcome pattern', correlateEnergy(up.map((value, index) => ({
	id: String(index),
	userId: 'seed',
	type: 'deep work',
	difficulty: 3,
	plannedStart: new Date().toISOString(),
	timezone: 'UTC',
	localHour: 9,
	localWeekday: 1,
	energyAtStart: value,
	outcome: index < 5 ? 'FAIL' : 'SUCCESS',
	createdAt: new Date().toISOString(),
}))));
