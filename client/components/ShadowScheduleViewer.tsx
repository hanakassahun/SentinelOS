"use client";
import React, { useMemo, useState } from 'react';

interface ShadowScheduleViewerProps {
  points: Array<{ hour: number; label: string; riskScore: number; evidence: string }>;
}

export default function ShadowScheduleViewer({ points }: ShadowScheduleViewerProps) {
  const [showHistoricalReality, setShowHistoricalReality] = useState(true);

  const maxRisk = useMemo(() => Math.max(...points.map((point) => point.riskScore), 1), [points]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={showHistoricalReality} onChange={() => setShowHistoricalReality((value) => !value)} />
        <span>Show Historical Reality</span>
      </label>

      {showHistoricalReality ? (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.24)' }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {points.map((point) => (
              <div key={point.hour} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px', gap: '0.5rem', alignItems: 'center' }}>
                <strong>{point.label}</strong>
                <div style={{ height: '0.65rem', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(8, (point.riskScore / maxRisk) * 100)}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, rgba(248,113,113,0.95), rgba(250,204,21,0.95))' }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#fbbf24' }}>{point.riskScore}%</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#e2e8f0' }}>
            Historical reality overlay: these windows typically show lower energy, weaker execution, or recurring friction.
          </p>
        </div>
      ) : null}
    </div>
  );
}
