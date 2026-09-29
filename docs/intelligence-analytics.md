# Intelligence Analytics Engine

## Overview

The Intelligence Analytics Engine is a modular, production-grade analytics system that transforms raw behavioral and decision data into actionable insights. It provides comprehensive analysis of user decision patterns, behavioral success rates, time-of-day performance variations, and risk trends.

## Architecture

The analytics engine is organized into four layers:

### 1. Data Aggregation Layer (`dataAggregator.ts`)
Handles data normalization, filtering, and statistical computation.

**Key Functions:**
- `generateTimeWindows()`: Create time windows for historical analysis
- `filterByDateRange()`: Filter events by date range
- `computeMetrics()`: Statistical analysis (mean, median, stddev, quartiles)
- `groupBy()`: Group items by categorical key
- `pearsonCorrelation()`: Compute correlation between datasets
- `detectOutliers()`: Identify anomalous values using IQR method
- `exponentialMovingAverage()`: Smooth trends using EMA

### 2. Domain Analysis Layer

#### Decision Analyzer (`decisionAnalyzer.ts`)
Analyzes user decision patterns and risk trends.

**Key Functions:**
- `analyzeDecisionPatterns()`: Comprehensive decision metrics including:
  - Average and median risk scores
  - Risk distribution (low/medium/high)
  - Risk trends (recent vs historical)
  - Highest risk periods
  - Decision momentum
  - Tag-based risk mapping
- `detectRiskAlerts()`: Identify critical risk patterns
- `computeDecisionQualityScore()`: Overall decision quality (0-100)

**Example:**
```typescript
const decisions = [
  { id: 1, riskScore: 45, riskLevel: 'medium', tags: ['urgent'], createdAt: new Date() },
  // ...
];
const analysis = analyzeDecisionPatterns(normalizeDecisions(decisions));
console.log(`Decision quality: ${computeDecisionQualityScore(analysis)}/100`);
```

#### Behavioral Analyzer (`behavioralAnalyzer.ts`)
Analyzes task success rates, time-of-day patterns, and behavioral correlations.

**Key Functions:**
- `analyzeBehavior()`: Comprehensive behavioral metrics including:
  - Overall success/failure rates
  - Task type performance breakdown
  - Time-of-day performance analysis
  - Energy/mood correlations with outcomes
  - Consistency scoring
  - Planning accuracy
- `analyzeTaskTypes()`: Success rates per task category
- `analyzeByTimeOfDay()`: Performance by time block
- `generateBehavioralInsights()`: Actionable behavioral insights

**Example:**
```typescript
const analysis = analyzeBehavior(events);
console.log(`Success rate: ${analysis.overallSuccessRate}%`);
console.log(`Best time: ${analysis.bestPerformingTimeBlock?.label}`);
```

### 3. Synthesis Layer (`analyticsOrchestrator.ts`)
Coordinates all analyzers and generates comprehensive recommendations.

**Key Functions:**
- `runComprehensiveAnalytics()`: Main entry point that orchestrates all analysis
- `synthesizeRecommendations()`: Combines findings into prioritized recommendations
- `computeHealthScore()`: Overall system health (0-100)
- `generateExecutiveSummary()`: Human-readable summary

**Returns: `ComprehensiveAnalytics`**
```typescript
{
  timestamp: Date;
  userId: string;
  decisionAnalysis: DecisionAnalysis;
  decisionQualityScore: number;
  riskAlerts: RiskAlert[];
  behavioralAnalysis: BehavioralAnalysis;
  behavioralInsights: BehavioralInsight[];
  synthesizedRecommendations: Recommendation[];
  overallHealthScore: number;
}
```

### 4. Utilities Layer (`analyticsUtils.ts`)
Common statistical and formatting utilities.

**Key Functions:**
- `calculateSuccessRate()`, `calculateFailureRate()`, `calculatePercentageChange()`
- `calculateAverage()`, `calculateMedian()`, `calculateStdDev()`
- `scoreToRating()`, `scoreToColor()`: Formatting utilities
- `simpleMovingAverage()`, `detectTrend()`: Trend analysis
- `isAnomaly()`, `calculateZScore()`: Anomaly detection

## Usage

### Basic Usage

```typescript
import { runComprehensiveAnalytics, generateExecutiveSummary } from './analytics';

// 1. Gather data from database
const decisions = await prisma.decision.findMany({ where: { userId } });
const events = await prisma.behavioralEvent.findMany({ where: { userId } });

// 2. Run comprehensive analysis
const analytics = runComprehensiveAnalytics({
  userId,
  decisions,
  behavioralEvents: events,
});

// 3. Generate summary or use results
console.log(generateExecutiveSummary(analytics));

// 4. Extract specific insights
analytics.riskAlerts.forEach(alert => {
  console.log(`[${alert.severity}] ${alert.message}`);
  console.log(`→ ${alert.recommendation}`);
});
```

### Focused Analysis

```typescript
import { analyzeDecisionPatterns, analyzeBehavior } from './analytics';

// Decision-only analysis
const decisions = normalizeDecisions(rawDecisions);
const decisionAnalysis = analyzeDecisionPatterns(decisions);

// Behavioral-only analysis
const events = normalizeBehavioralEvents(rawEvents);
const behaviorAnalysis = analyzeBehavior(events);
```

### Time-Series Analysis

```typescript
import { generateTimeWindows, filterByDateRange, simpleMovingAverage, detectTrend } from './analytics';

// Create 30-day windows
const windows = generateTimeWindows(new Date(), 30);

// Compute metrics per window
const windowMetrics = windows.map(window => ({
  window: window.label,
  events: filterByDateRange(events, window.start, window.end),
}));

// Detect trend
const successRates = windowMetrics.map(w => (w.events.filter(e => e.outcome === 'success').length / w.events.length) * 100);
const smoothed = simpleMovingAverage(successRates, 3);
const trend = detectTrend(successRates);
console.log(`Trend direction: ${trend > 0 ? 'improving' : 'declining'}`);
```

## Key Metrics

### Decision Metrics
- **Risk Score**: 0-100, higher = more risky
- **Risk Level**: low (0-33), medium (34-66), high (67-100)
- **Decision Quality Score**: 0-100, accounts for risk and trend
- **Risk Trend**: % change in risk score (recent vs historical)
- **Decision Momentum**: improving | stable | declining

### Behavioral Metrics
- **Success Rate**: % of tasks completed successfully
- **Task-Type Performance**: Success rate per task category
- **Time-Block Analysis**: Performance by hour ranges
- **Consistency Score**: 0-100, lower variance = higher consistency
- **Planning Accuracy**: % of planned tasks executed within 24 hours
- **Energy Correlation**: Pearson correlation between energy and success (-1 to 1)

### Overall Health Score
Combines:
- Decision quality (40%)
- Success rate (35%)
- Consistency (15%)
- Risk alert penalties (10%)
- Wellness bonuses

## Performance Characteristics

- **Data Processing**: Handles 1000+ events efficiently with O(n) or O(n log n) algorithms
- **Memory**: Optimized for typical behavioral datasets (< 100MB)
- **Computation**: Full analysis typically completes in 100-500ms depending on dataset size
- **Scalability**: Linear scaling with data size; suitable for 10k+ events

## Customization

### Adding Custom Metrics

```typescript
export function myCustomAnalysis(events: BehavioralEvent[]): CustomMetric {
  // Implement analysis
  return {
    // ...
  };
}
```

### Adjusting Thresholds

Key thresholds are defined in analyzer functions. Common ones:

| Threshold | Location | Purpose |
|-----------|----------|---------|
| `25%` | `decisionAnalyzer.ts` | Sudden drop detection |
| `50%` | `behavioralAnalyzer.ts` | Risk threshold |
| `0.6` | `behavioralAnalyzer.ts` | Strong correlation |
| `70` | `decisionAnalyzer.ts` | High risk alert |
| `75%` | `behavioralAnalyzer.ts` | Exceptional success |

### Filtering and Normalization

Data normalization happens at the entry point of each analyzer:
- `normalizeDecisions()`: Validates and standardizes decision data
- `normalizeBehavioralEvents()`: Validates and standardizes event data

These can be enhanced to apply domain-specific rules.

## Best Practices

1. **Call Orchestrator**: Use `runComprehensiveAnalytics()` for holistic analysis
2. **Regular Analysis**: Run analysis daily or weekly for trend detection
3. **Data Quality**: Ensure data quality; outliers can skew results
4. **Context**: Combine metrics with domain knowledge for best insights
5. **Monitoring**: Track health score changes over time
6. **Caching**: Cache results if running frequently on same dataset

## Testing

```typescript
import { analyzeDecisionPatterns, analyzeBehavior } from './analytics';

// Mock data
const mockDecisions = [
  { id: 1, riskScore: 50, riskLevel: 'medium', tags: [], createdAt: new Date() },
];
const mockEvents = [
  { id: '1', userId: 'user1', taskType: 'coding', outcome: 'success', energyLevel: 8 },
];

// Run analysis
const decisionAnalysis = analyzeDecisionPatterns(normalizeDecisions(mockDecisions));
const behavioralAnalysis = analyzeBehavior(normalizeBehavioralEvents(mockEvents));

// Assert results
expect(decisionAnalysis.totalDecisions).toBe(1);
expect(behavioralAnalysis.overallSuccessRate).toBe(100);
```

## Future Enhancements

- [ ] Machine learning for anomaly detection
- [ ] Predictive models for future performance
- [ ] Cohort analysis and benchmarking
- [ ] Natural language explanation generation
- [ ] Real-time streaming analysis
- [ ] Custom metric framework
- [ ] Visualization support
- [ ] Export to multiple formats (JSON, CSV, PDF)

## References

- Decision Science: Kahneman & Tversky's Prospect Theory
- Statistical Methods: Pearson Correlation, Z-Scores, Moving Averages
- Performance Analysis: Quartiles, IQR outlier detection, consistency scoring
