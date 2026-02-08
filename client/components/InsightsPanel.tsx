"use client";

import React, { useEffect, useState } from 'react';

export default function InsightsPanel() {
  const [insights, setInsights] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load(force = false) {
    setLoading(true);
    try {
      const url = '/api/insights' + (force ? '?force=true' : '');
      const res = await fetch(url);
      const data = await res.json();
      setInsights(data.insights || []);
      setAnalysis(data.analysis || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div>Loading insights…</div>;
  if (!insights || insights.length === 0) return <div>No insights available yet.</div>;

  return (
    <div>
      <h4>Insights</h4>
      <button onClick={() => load(true)}>Refresh</button>
      <ul>
        {insights.map((ins: any, i: number) => (
          <li key={i}>
            <strong>{ins.priority?.toUpperCase() ?? ''}</strong> — {ins.message}
            {ins.recommendation && <div style={{ color: '#666' }}>{ins.recommendation}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
