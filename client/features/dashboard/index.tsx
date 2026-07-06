"use client";
import React, { useState } from 'react';
import TopNav from '../../components/TopNav';
import Card from '../../components/Card';
import RiskScore from '../../components/RiskScore';
import Timeline from '../../components/Timeline';
import Loader from '../../components/Loader';
import RecommendationBanner from '../../components/RecommendationBanner';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { DEFAULT_USER_ID } from '../../config';

export default function Dashboard() {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<any | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);

  const { loading: analyticsLoading, error, comprehensive, health, refresh } = useAnalyticsData(DEFAULT_USER_ID);

  React.useEffect(() => {
    fetch('/api/decision')
      .then((res) => res.json())
      .then(setRecentDecisions);
  }, []);

  React.useEffect(() => {
    if (decision) {
      setShowExplanation(false);
      setTimeout(() => setShowExplanation(true), 900);
    }
  }, [decision]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowExplanation(false);
    const res = await fetch('/api/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, tags }),
    });
    const data = await res.json();
    setDecision(data);
    setLoading(false);
    fetch('/api/decision')
      .then((res) => res.json())
      .then(setRecentDecisions);
    await refresh();
  };

  return (
    <>
      <TopNav />
      <main style={{
        display: 'flex',
        maxWidth: 'var(--content-max-width)',
        margin: '2rem auto',
        gap: '2.5rem',
        alignItems: 'flex-start',
      }}>
        <section style={{ flex: 1, minWidth: 320 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <div>
                <h2 style={{ marginBottom: 4 }}>Decision Advisor</h2>
                <p style={{ margin: 0, color: '#64748b' }}>Insights for {DEFAULT_USER_ID}</p>
              </div>
              <button
                type="button"
                onClick={refresh}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0.7rem 1rem',
                  cursor: 'pointer',
                }}
              >
                Refresh
              </button>
            </div>
            {analyticsLoading ? (
              <div style={{ marginTop: 16 }}><Loader /></div>
            ) : error ? (
              <div style={{ marginTop: 16, color: '#b91c1c' }}>{error}</div>
            ) : comprehensive ? (
              <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Card>
                    <strong>Health</strong>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#0f766e' }}>{health?.healthScore ?? comprehensive.overallHealthScore}</div>
                    <div style={{ color: '#475569' }}>Overall health score</div>
                  </Card>
                  <Card>
                    <strong>Decision Quality</strong>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#1d4ed8' }}>{health?.decisionQualityScore ?? comprehensive.decisionQualityScore}</div>
                    <div style={{ color: '#475569' }}>Decision engine score</div>
                  </Card>
                </div>
                <div>
                  {comprehensive.synthesizedRecommendations.slice(0, 1).map((recommendation) => (
                    <RecommendationBanner key={recommendation.title} recommendation={recommendation} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 16, color: '#475569' }}>No analytics available yet.</div>
            )}
          </Card>

          <Card style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Latest Insights</h3>
            {comprehensive?.behavioralInsights?.length ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {comprehensive.behavioralInsights.map((insight) => (
                  <div key={insight.title} style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 1px 2px rgba(15,23,42,.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                      <strong>{insight.title}</strong>
                      <span style={{ color: insight.priority === 'high' ? '#b91c1c' : insight.priority === 'medium' ? '#c2410c' : '#16a34a' }}>{insight.priority}</span>
                    </div>
                    <p style={{ margin: 0, color: '#475569' }}>{insight.description}</p>
                    <div style={{ marginTop: 8, color: '#334155', fontSize: 13 }}>Actionable: {insight.actionable}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>No behavioral insights available yet.</div>
            )}
          </Card>
        </section>

        <section style={{ flex: 1, minWidth: 320 }}>
          <Card>
            <h3 style={{ marginBottom: 12 }}>Decision Submission</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the decision or action..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  borderRadius: 'var(--radius)',
                  border: 'var(--border)',
                  padding: '0.75rem',
                  fontSize: 16,
                  marginBottom: 16,
                  resize: 'vertical',
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
                  border: 'var(--border)',
                  padding: '0.75rem',
                  fontSize: 15,
                  marginBottom: 16,
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#c7d2fe' : 'var(--color-accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.9rem',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? <Loader /> : 'Submit Decision'}
              </button>
            </form>
          </Card>

          <Card style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Recent Decisions</h3>
            {recentDecisions.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {recentDecisions.map((d) => (
                  <div key={d.id} style={{ borderRadius: 12, background: '#f8fafc', padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{d.description}</div>
                    <div style={{ color: '#475569', fontSize: 13 }}>{d.tags}</div>
                    <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span>Score: {d.riskScore}</span>
                      <span>{d.riskLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>No decisions found yet.</div>
            )}
          </Card>
        </section>
      </main>
      <section style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto 2.5rem auto' }}>
        <Timeline
          events={recentDecisions.map((d) => ({
            label: d.description,
            risk: d.riskLevel,
            time: new Date(d.createdAt).toLocaleTimeString(),
          }))}
        />
      </section>
    </>
  );
}
