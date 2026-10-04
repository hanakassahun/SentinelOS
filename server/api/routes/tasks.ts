import { Router } from 'express';
import { completeTask, createTask, listTasks } from '../controllers/tasksController';

const router = Router();

router.get('/', listTasks);
router.post('/', createTask);
router.patch('/:id', completeTask);

export default router;