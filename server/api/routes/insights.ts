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
router.post('/contract', (req, res) => {
  const payload = req.body ?? {};
  const normalized = {
    energy_level: payload.energy_level ?? payload.energyLevel ?? 0,
    cognitive_load: payload.cognitive_load ?? payload.cognitiveLoad ?? 0,
    consecutive_hours: payload.consecutive_hours ?? payload.consecutiveHours ?? 0,
  };
  res.json(normalized);
});

export default router;
