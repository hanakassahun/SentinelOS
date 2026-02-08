import express from 'express';
import insightsRouter from './api/routes/insights';
import logsRouter from './api/routes/logs';

const app = express();
app.use(express.json());

app.use('/api/insights', insightsRouter);
app.use('/api/logs', logsRouter);

app.get('/', (_req, res) => res.send('sentinelOS server running'));

export default app;