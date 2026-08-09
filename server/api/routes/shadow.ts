import { Router } from 'express';
import { getShadowSchedule, saveShadowSnapshot } from '../controllers/shadowController';

const router = Router();

router.get('/', getShadowSchedule);
router.post('/snapshot', saveShadowSnapshot);

export default router;
