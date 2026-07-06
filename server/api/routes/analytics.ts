/**
 * Analytics Routes
 * 
 * Exposes analytics endpoints with async error handling.
 * All errors are caught by the asyncHandler wrapper and forwarded
 * to the centralized error middleware in app.ts
 */

import { Router } from 'express';
import {
  getComprehensiveAnalysis,
  getDecisionMetrics,
  getBehaviorMetrics,
  getHealthScore,
  validateAnalyticsParams,
} from '../controllers/analyticsController';

const router = Router();

// Async error handler wrapper
const asyncHandler = (handler: (...args: any[]) => Promise<any>) =>
  (req: any, res: any, next: any) => Promise.resolve(handler(req, res, next)).catch(next);

// Validation middleware
router.use(asyncHandler(validateAnalyticsParams));

/**
 * GET /api/analytics/:userId
 * Comprehensive analysis with all metrics
 */
router.get('/:userId', asyncHandler(getComprehensiveAnalysis));

/**
 * GET /api/analytics/:userId/decisions
 * Decision-specific metrics and risk analysis
 */
router.get('/:userId/decisions', asyncHandler(getDecisionMetrics));

/**
 * GET /api/analytics/:userId/behavior
 * Behavioral metrics and success patterns
 */
router.get('/:userId/behavior', asyncHandler(getBehaviorMetrics));

/**
 * GET /api/analytics/:userId/health
 * Quick health score and key metrics (optimized for dashboards)
 */
router.get('/:userId/health', asyncHandler(getHealthScore));

export default router;
