import { Request, Response, NextFunction } from 'express';

export function validateGetInsightsQuery(req: Request, res: Response, next: NextFunction) {
  const { startDate, endDate } = req.query;

  const isValidDate = (v: unknown) => {
    if (v === undefined) return true;
    const d = new Date(String(v));
    return !isNaN(d.getTime());
  };

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return res.status(400).json({ error: 'startDate and endDate must be valid ISO dates' });
  }

  next();
}

export default { validateGetInsightsQuery };
