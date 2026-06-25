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
    if (error.code === 'P2010') {
      console.error('Analytics service test failed because the database schema is not initialized.');
      console.error('Please run Prisma migrations or seed the database before retrying.');
    } else {
      console.error('Analytics service test failed:', error);
    }
    process.exit(1);
  }
})();
