import express, { Request, Response } from 'express';
import { evaluateDecisionRisk } from '../../services/decisionRiskService';

const router = express.Router();

router.post('/evaluate', async (req: Request, res: Response) => {
	try {
		const { action, context } = req.body;
		if (!action || !context) return res.status(400).json({ error: 'Missing action or context.' });
		const result = await evaluateDecisionRisk(action, context);
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: 'Failed to evaluate decision risk.' });
	}
});

export default router;