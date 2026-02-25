"use client";
import React, { useState } from 'react';
import TopNav from '../../components/TopNav';
import Card from '../../components/Card';
import RiskScore from '../../components/RiskScore';
import Timeline from '../../components/Timeline';
import Loader from '../../components/Loader';

const explanationPoints = [
  'Analyzed behavioral patterns for anomalies.',
  'Detected moderate risk due to recent activity.',
  'No critical threats identified.',
];

export default function Dashboard() {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<any | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);

  // Fetch last 5 decisions
  React.useEffect(() => {
    fetch("/api/decision")
      .then(res => res.json())
      .then(setRecentDecisions);
  }, []);

  // Show explanation animation
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
    const res = await fetch("/api/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, tags }),
    });
    const data = await res.json();
    setDecision(data);
    setLoading(false);
    // Refresh recent decisions
    fetch("/api/decision")
      .then(res => res.json())
      .then(setRecentDecisions);
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
        {/* Left Column: Action Input */}
        <section style={{ flex: 1, minWidth: 320 }}>
          <Card>
            <h2 style={{ marginBottom: 8 }}>Action Description</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the decision or action..."
                style={{
                  width: '100%',
                  minHeight: 80,
                  borderRadius: 'var(--radius)',
                  border: 'var(--border)',
                  padding: '0.75rem',
                  fontSize: 16,
                  marginBottom: 16,
                  resize: 'vertical',
                }}
                required
              />
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500 }}>Context Tags (optional)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="Add tags..."
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius)',
                    border: 'var(--border)',
                    padding: '0.5rem',
                    fontSize: 15,
                    marginTop: 6,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#c7d2fe' : 'var(--color-accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: 'none',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? <Loader /> : 'Analyze Decision'}
              </button>
            </form>
          </Card>
          {/* Last 5 Decisions */}
          <Card>
            <h3 style={{ marginBottom: 8 }}>Last 5 Decisions</h3>
            <ul style={{ paddingLeft: 0, margin: 0 }}>
              {recentDecisions.map(d => (
                <li key={d.id} style={{ marginBottom: 12, listStyle: 'none', borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
                  <div style={{ fontWeight: 500 }}>{d.description}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{d.tags}</div>
                  <div style={{ color: 'var(--color-risk-' + d.riskLevel + ')', fontWeight: 600 }}>Score: {d.riskScore} ({d.riskLevel})</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Time: {new Date(d.createdAt).toLocaleTimeString()}</div>
                  <ul style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                    {d.explanation.map((pt: string, i: number) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Right Column: Risk Output */}
        <section style={{ flex: 1, minWidth: 320 }}>
          <Card>
            {decision ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: 15 }}>Risk Score</div>
                    <RiskScore score={decision.riskScore} level={decision.riskLevel} />
                  </div>
                  <span
                    style={{
                      background: `var(--color-risk-${decision.riskLevel})`,
                      color: '#fff',
                      borderRadius: 6,
                      padding: '0.35em 0.9em',
                      fontWeight: 600,
                      fontSize: 15,
                      marginLeft: 8,
                      letterSpacing: '0.01em',
                      transition: 'background 0.4s',
                    }}
                  >
                    {decision.riskLevel.charAt(0).toUpperCase() + decision.riskLevel.slice(1)} Risk
                  </span>
                </div>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Explanation</div>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {decision.explanation.map((pt: string, i: number) => (
                    <li
                      key={i}
                      style={{
                        opacity: showExplanation ? 1 : 0,
                        transition: `opacity 0.4s ${0.15 * i + 0.2}s`,
                        marginBottom: 6,
                      }}
                    >
                      {pt}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>Submit a decision to see risk evaluation.</div>
            )}
            {loading && <Loader />}
          </Card>
        </section>
      </main>
      {/* Bottom Section: Timeline */}
      <section style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto 2.5rem auto' }}>
        <Timeline
          events={recentDecisions.map(d => ({
            label: d.description,
            risk: d.riskLevel,
            time: new Date(d.createdAt).toLocaleTimeString(),
          }))}
        />
      </section>
    </>
  );
}
