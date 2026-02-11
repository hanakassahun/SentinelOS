import { getLogs } from '../services/insightsService';
import { generateInsightsFromLogs } from '../../internal/intelligence/insightGenerator';

(async function(){
  const logs = await getLogs();
  const report = generateInsightsFromLogs(logs);
  console.log(JSON.stringify(report, null, 2));
})();
