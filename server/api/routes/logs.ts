import { Router } from 'express';
import { createLog, listLogs } from '../controllers/logsController';

const router = Router();

const asyncHandler = (handler: (...args: any[]) => Promise<any>) =>
  (req: any, res: any, next: any) => Promise.resolve(handler(req, res, next)).catch(next);

router.post('/', asyncHandler(createLog));
router.get('/', asyncHandler(listLogs));

export default router;
