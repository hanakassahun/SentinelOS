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
  const [score] = useState(72);
  const [riskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  React.useEffect(() => {
    setTimeout(() => setShowExplanation(true), 900);
  }, []);

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
            <textarea
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
            />
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Context Tags (optional)</label>
              <input
                type="text"
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
              style={{
                background: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius)',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: 'none',
                transition: 'background 0.2s',
              }}
            >
              Analyze Decision
            </button>
          </Card>
        </section>

        {/* Right Column: Risk Output */}
        <section style={{ flex: 1, minWidth: 320 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: 15 }}>Risk Score</div>
                <RiskScore score={score} level={riskLevel} />
              </div>
              <span
                style={{
                  background: `var(--color-risk-${riskLevel})`,
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
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
              </span>
            </div>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Explanation</div>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {explanationPoints.map((pt, i) => (
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
            {loading && <Loader />}
          </Card>
        </section>
      </main>
      {/* Bottom Section: Timeline */}
      <section style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto 2.5rem auto' }}>
        <Timeline
          events={[
            { label: 'Decision Created', risk: null, time: '09:00' },
            { label: 'Pattern Detected', risk: 'medium', time: '09:10' },
            { label: 'Risk Evaluated', risk: 'medium', time: '09:12' },
            { label: 'Finalized', risk: 'low', time: '09:15' },
          ]}
        />
      </section>
    </>
  );
}
