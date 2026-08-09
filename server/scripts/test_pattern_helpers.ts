import { calculateAverage, detectTrend } from '../intelligence/analytics/analyticsUtils';
import { correlateEnergy } from '../intelligence/pattern-engine/energyCorrelation';

const up = [1,2,3,4,5,6,7,8,9,10];
const down = [10,9,8,7,6,5,4,3,2,1];
const stable = [5,5,5,5,5,5,5,5,5,5];
console.log('avg up', calculateAverage(up));
console.log('trend up', detectTrend(up));
console.log('trend down', detectTrend(down));
console.log('trend stable', detectTrend(stable));
console.log('corr up-down', correlateEnergy(up.map(v=>({energyLevel:v,outcome:'success'} as any)).map(e=>e.energyLevel), down.map(v=>({energyLevel:v,outcome:'fail'} as any)).map(e=>e.energyLevel)));
console.log('corr up-up', correlateEnergy(up.map(v=>({energyLevel:v,outcome:'success'} as any)).map(e=>e.energyLevel), up.map(v=>({energyLevel:v,outcome:'success'} as any)).map(e=>e.energyLevel)));
