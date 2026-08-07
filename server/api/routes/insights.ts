import { Router } from 'express';
import { getInsights, listPersistedInsights, deleteInsight, refreshInsights, getInsightsSimple, triggerInsightQueue } from '../controllers/insightsController';
import { validateGetInsightsQuery } from '../validators/insightsValidator';

const router = Router();

router.get('/', validateGetInsightsQuery, getInsights);
router.get('/history', listPersistedInsights);
router.delete('/:id', deleteInsight);
router.post('/refresh', refreshInsights);
router.post('/queue', triggerInsightQueue);
router.get('/simple', validateGetInsightsQuery, getInsightsSimple);

export default router;
