import { getBehaviorAnalytics } from '../services/analyticsService';

(async function () {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const analytics = await getBehaviorAnalytics({ behaviorType: 'ENERGY', since });

    console.log('=== Behavior Analytics ===');
    console.log('Total events:', analytics.totalEvents);
    console.log('Successes:', analytics.totalSuccesses);
    console.log('Failures:', analytics.totalFailures);
    console.log('Overall success rate:', analytics.overallSuccessRate);
    console.log('Top time block:', analytics.topTimeBlock);
    console.log('Time block stats:', analytics.timeBlockStats);
    console.log('Failure clusters:', analytics.failureClusters);
    process.exit(0);
  } catch (error: any) {
    console.error('Analytics service test failed:', error);
    if (error.code === 'P2010') {
      console.error('Detected Prisma error code P2010: schema/table access issue.');
    }
    process.exit(1);
  }
})();
