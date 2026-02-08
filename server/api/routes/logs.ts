import { Router } from 'express';
import { createLog, listLogs } from '../controllers/logsController';

const router = Router();

router.post('/', createLog);
router.get('/', listLogs);

export default router;
