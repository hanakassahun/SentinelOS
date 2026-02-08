import { Router } from 'express';
import { getInsights, listPersistedInsights, deleteInsight, refreshInsights } from '../controllers/insightsController';

const router = Router();

router.get('/', getInsights);
router.get('/history', listPersistedInsights);
router.delete('/:id', deleteInsight);
router.post('/refresh', refreshInsights);

export default router;
