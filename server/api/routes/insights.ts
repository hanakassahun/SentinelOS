import { Router } from 'express';
import { getInsights } from '../controllers/insightsController';

const router = Router();

router.get('/', getInsights);

export default router;
