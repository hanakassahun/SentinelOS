import { getLogs } from '../services/insightsService';

(async function(){
  try{
    const logs = await getLogs();
    console.log('fetched', logs.length, 'logs');
    console.log(logs.slice(0,3));
  }catch(e){
    console.error(e);
  }
})();
