import { Router } from 'express';
import { getInsights, listPersistedInsights, deleteInsight, refreshInsights, getInsightsSimple } from '../controllers/insightsController';

const router = Router();

router.get('/', getInsights);
router.get('/history', listPersistedInsights);
router.delete('/:id', deleteInsight);
router.post('/refresh', refreshInsights);
router.get('/simple', getInsightsSimple);

export default router;
