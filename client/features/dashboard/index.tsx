"use client";
import React, { useEffect, useMemo, useState } from 'react';
import TopNav from '../../components/TopNav';
import Card from '../../components/Card';
import RiskScore from '../../components/RiskScore';
import Timeline from '../../components/Timeline';
import Loader from '../../components/Loader';
import RecommendationBanner from '../../components/RecommendationBanner';
import InsightsCharts from '../../components/InsightsCharts';
import Heatmap from '../../components/Heatmap';
import ShadowScheduleViewer from '../../components/ShadowScheduleViewer';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { DEFAULT_USER_ID } from '../../config';
import styles from './Dashboard.module.css';

const initialShadowSchedulePoints = [
  { hour: 9, label: '09:00', riskScore: 24, evidence: 'high friction' },
  { hour: 14, label: '14:00', riskScore: 52, evidence: 'slipping into low-energy blocks' },
  { hour: 15, label: '15:00', riskScore: 63, evidence: 'frequent late-task drift' },
  { hour: 17, label: '17:00', riskScore: 71, evidence: 'weak finish rates' },
  { hour: 20, label: '20:00', riskScore: 58, evidence: 'reduced focus' },
];

const badgeClass = (level: 'low' | 'medium' | 'high' | undefined) => {
  if (level === 'high') return styles.badgeHigh;
  if (level === 'medium') return styles.badgeMedium;
  if (level === 'low') return styles.badgeLow;
  return styles.badgeLow;
};

const badgeLabel = (level: 'low' | 'medium' | 'high' | undefined) => {
  if (level === 'high') return 'HIGH RISK';
  if (level === 'medium') return 'MEDIUM RISK';
  if (level === 'low') return 'LOW RISK';
  return 'UNKNOWN';
};

export default function Dashboard() {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);
  
  const { loading: analyticsLoading, error, comprehensive, decisions, behavior, health, refresh } = useAnalyticsData(DEFAULT_USER_ID);

  React.useEffect(() => {
    fetch('/api/decision')
      .then((res) => res.json())
      .then(setRecentDecisions);
  }, []);

  const topRiskDecisions = useMemo(() => {
    return [...recentDecisions]
      .sort((a, b) => (b?.riskScore ?? 0) - (a?.riskScore ?? 0))
      .slice(0, 3);
  }, [recentDecisions]);

  const timeBlocks = useMemo(() => {
    const blocks = behavior?.behavioralAnalysis?.timeBlockAnalysis ?? comprehensive?.behavioralAnalysis?.timeBlockAnalysis ?? [];
    return blocks.slice(0, 3);
  }, [behavior, comprehensive]);

  const actionables = comprehensive?.synthesizedRecommendations ?? [];
  const [shadowSchedulePoints, setShadowSchedulePoints] = useState(initialShadowSchedulePoints);

  const terminalLog = [
    {
      label: 'system status',
      value: error ? 'degraded' : analyticsLoading ? 'fetching' : 'nominal',
    },
    {
      label: 'data snapshot',
      value: comprehensive?.timestamp ? new Date(comprehensive.timestamp).toLocaleString() : 'waiting for analytics',
    },
    {
      label: 'decision load',
      value: `${decisions?.decisionAnalysis.totalDecisions ?? 0} processed`,
    },
    {
      label: 'risk signals',
      value: `${comprehensive?.riskAlerts.length ?? 0} active`,
    },
    {
      label: 'energy windows',
      value: `${timeBlocks.length} tracked`,
    },
  ];

  const [insightMatrix, setInsightMatrix] = useState<number[][]>([]);
  const [insightLabels, setInsightLabels] = useState<string[]>([]);
  const [insightYLabels, setInsightYLabels] = useState<string[]>([]);
  
  useEffect(() => {
    // fetch live shadow schedule points from server
    (async () => {
      try {
        const res = await fetch(`/api/shadow?userId=${DEFAULT_USER_ID}`);
        if (res.ok) {
          const payload = await res.json();
          if (payload && payload.points) setShadowSchedulePoints(payload.points);
        }
      } catch (err) {
        // ignore
      }
    })();

    const buildHeatmap = () => {
      const days = 7;
      const hours = 24;
      const matrix = Array.from({ length: days }, () => Array.from({ length: hours }, () => 0));
      const labels = Array.from({ length: hours }, (_, i) => `${i}:00`);
      const yLabels = ['6d', '5d', '4d', '3d', '2d', '1d', 'today'];
      recentDecisions.slice(0, 35).forEach((decision) => {
        const timestamp = new Date(decision.createdAt || Date.now());
        const diffDays = Math.floor((Date.now() - timestamp.getTime()) / (24 * 3600 * 1000));
        const row = Math.min(days - 1, Math.max(0, days - 1 - diffDays));
        const hour = timestamp.getHours();
        matrix[row][hour] += 1;
      });
      setInsightMatrix(matrix);
      setInsightLabels(labels);
      setInsightYLabels(yLabels);
    };
    buildHeatmap();
  }, [recentDecisions]);

  const persistSnapshot = async () => {
    try {
      await fetch('/api/shadow/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: DEFAULT_USER_ID, points: shadowSchedulePoints }),
      });
      // Optionally refresh insights after persisting
      await refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, tags }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecentDecisions((current) => [data, ...current].slice(0, 10));
        await refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNav />
      <main className={styles.dashboard}>
        <section>
          <div className={styles.hero}>
            <div className={styles.heroIntro}>
              <div className={styles.heroLine}>sentinel / analytics / dashboard</div>
              <h1 className={styles.heroTitle}>Friction-aware decision diagnostics</h1>
              <p className={styles.heroMeta}>
                Your operating system for unseen risk, energy drift, and decision load across daily rhythms. Focus on the moments where intentions and execution diverge.
              </p>
            </div>
            <div className={styles.heroStatus}>Live analysis</div>
          </div>

          <div className={styles.panelGrid}>
            <div className={styles.miniPanel}>
              <div className={styles.miniLabel}>Health composite</div>
              <div className={styles.miniValue}>{health?.healthScore ?? comprehensive?.overallHealthScore ?? '--'}</div>
              <div className={styles.miniDetail}>Current system wellness rating</div>
            </div>
            <div className={styles.miniPanel}>
              <div className={styles.miniLabel}>Decision quality</div>
              <div className={styles.miniValue}>{health?.decisionQualityScore ?? comprehensive?.decisionQualityScore ?? '--'}</div>
              <div className={styles.miniDetail}>Signal strength for choice reliability</div>
            </div>
            <div className={styles.miniPanel}>
              <div className={styles.miniLabel}>Active alerts</div>
              <div className={styles.miniValue}>{comprehensive?.riskAlerts.length ?? 0}</div>
              <div className={styles.miniDetail}>Alerts requiring attention</div>
            </div>
            <div className={styles.miniPanel}>
              <div className={styles.miniLabel}>Consistency</div>
              <div className={styles.miniValue}>{Math.round(comprehensive?.behavioralAnalysis?.consistencyScore ?? 0) || '--'}</div>
              <div className={styles.miniDetail}>Behavioral stability index</div>
            </div>
          </div>

          <Card style={{ marginTop: '1rem' }}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Friction timeline</h2>
                <p className={styles.sectionSubtitle}>High-risk decisions and execution delays from the last 24 hours.</p>
              </div>
              <span className={styles.statusBadge}>{analyticsLoading ? 'refreshing' : 'synced'}</span>
            </div>
            <Timeline
              events={recentDecisions.map((d) => ({
                label: d.description,
                risk: d.riskLevel,
                time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : 'unknown',
              }))}
            />
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Decision matrix</h2>
                <p className={styles.sectionSubtitle}>Most urgent decisions by risk exposure and momentum.</p>
              </div>
            </div>
            {topRiskDecisions.length ? (
              topRiskDecisions.map((item, index) => (
                <div key={item.id ?? index} className={styles.matrixRow}>
                  <div>
                    <div className={styles.matrixLabel}>{item.description}</div>
                    <div className={styles.matrixMeta}>{item.tags ? item.tags : 'untagged'}</div>
                  </div>
                  <div className={`${styles.badge} ${badgeClass(item.riskLevel)}`}>{badgeLabel(item.riskLevel)}</div>
                </div>
              ))
            ) : (
              <p className={styles.sectionSubtitle}>No recent decisions to populate the risk matrix.</p>
            )}
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Energy-to-difficulty breakdown</h2>
                <p className={styles.sectionSubtitle}>The windows where effort and energy diverge most.</p>
              </div>
            </div>
            {timeBlocks.length ? (
              timeBlocks.map((block, index) => (
                <div key={index} className={styles.energyRow}>
                  <div>
                    <div className={styles.energyLabel}>{block.label}</div>
                    <div className={styles.energyDetail}>Success rate {Math.round(block.successRate * 100) / 100}% · avg energy {block.avgEnergy ?? 'n/a'}</div>
                  </div>
                  <div className={styles.badge} style={{ background: 'rgba(124,58,237,0.18)', color: '#ddd' }}>{block.consistency ?? '—'}</div>
                </div>
              ))
            ) : (
              <p className={styles.sectionSubtitle}>No behavioral time-block analysis available yet.</p>
            )}
            <div style={{ marginTop: '1.25rem' }}>
              <InsightsCharts />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ShadowScheduleViewer points={shadowSchedulePoints} />
              <button onClick={persistSnapshot} style={{ height: 40, padding: '0 12px', borderRadius: 6 }}>Save Snapshot</button>
            </div>
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Hourly activity heatmap</h2>
                <p className={styles.sectionSubtitle}>Recent decision burst intensity by hour and day.</p>
              </div>
            </div>
            <Heatmap matrix={insightMatrix} xLabels={insightLabels} yLabels={insightYLabels} title="Recent decision activity" />
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Terminal log</h2>
                <p className={styles.sectionSubtitle}>Operational trace for the current analytics pipeline.</p>
              </div>
            </div>
            <div className={styles.terminalLog}>
              {terminalLog.map((line) => (
                <p key={line.label} className={styles.logLine}>
                  <span className={styles.logLabel}>{line.label}</span>
                  <span className={styles.logValue}>{line.value}</span>
                </p>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <Card>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Advisor playbook</h2>
                <p className={styles.sectionSubtitle}>Actionable recommendations that reduce friction at the next decision point.</p>
              </div>
            </div>
            {actionables.length ? (
              actionables.slice(0, 2).map((recommendation) => (
                <RecommendationBanner key={recommendation.title} recommendation={recommendation} />
              ))
            ) : (
              <p className={styles.sectionSubtitle}>Awaiting recommendation synthesis from the analytics engine.</p>
            )}
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <h2 className={styles.sectionTitle}>Submit a new decision</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the decision or action..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(148,163,184,0.16)',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'inherit',
                }}
                required
              />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Context tags (optional)"
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(148,163,184,0.16)',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'inherit',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? <Loader /> : 'Submit Decision'}
              </button>
            </form>
          </Card>

          <Card style={{ marginTop: '1rem' }}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Recent decisions</h2>
                <p className={styles.sectionSubtitle}>Latest entries from your decision log.</p>
              </div>
            </div>
            <div className={styles.recentList}>
              {recentDecisions.length ? (
                recentDecisions.slice(0, 5).map((d) => (
                  <div key={d.id} className={styles.recentItem}>
                    <p className={styles.recentItemTitle}>{d.description}</p>
                    <p className={styles.recentItemMeta}>{d.tags ?? 'No tags'} · Score {d.riskScore ?? '—'} · {d.riskLevel?.toUpperCase() ?? 'UNKNOWN'}</p>
                  </div>
                ))
              ) : (
                <p className={styles.sectionSubtitle}>No recent decisions logged yet.</p>
              )}
            </div>
          </Card>
        </section>
      </main>
    </>
  );
}
