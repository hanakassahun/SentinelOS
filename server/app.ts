import express, { NextFunction, Request, Response } from 'express';
import insightsRouter from './api/routes/insights';
import logsRouter from './api/routes/logs';
import decisionRouter from './api/routes/decision';

const app = express();
app.use(express.json());

app.use('/api/insights', insightsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/decision', decisionRouter);

app.get('/', (_req, res) => res.send('sentinelOS server running'));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode =
    typeof err === 'object' && err !== null && 'statusCode' in err && typeof (err as { statusCode?: unknown }).statusCode === 'number'
      ? (err as { statusCode: number }).statusCode
      : 500;

  console.error('Unhandled API error:', err);

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : 'Request failed',
    ...(process.env.NODE_ENV !== 'production' && err instanceof Error ? { details: err.message } : {}),
  });
});

export default app;