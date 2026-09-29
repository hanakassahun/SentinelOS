import app from '../app';
import { assertProductionAuthenticationReady } from '../config/productionGuard';
import { startInsightWorker } from '../queues/insightQueue';

assertProductionAuthenticationReady();

const port = process.env.PORT || 3333;
void startInsightWorker().finally(() => {
	app.listen(port, () => console.log('Server listening on', port));
});
