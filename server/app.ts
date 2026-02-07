import express from 'express';
import insightsRouter from './api/routes/insights';

const app = express();
app.use(express.json());

app.use('/api/insights', insightsRouter);

app.get('/', (_req, res) => res.send('sentinelOS server running'));

export default app;