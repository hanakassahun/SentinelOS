import { getLogs } from '../services/insightsService';
import { generateInsights } from '../intelligence/insight-generator/generateInsights';

(async function(){
  const logs = await getLogs();
  const report = generateInsights(logs as any);
  console.log(JSON.stringify(report, null, 2));
})();
