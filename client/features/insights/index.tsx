import React, { useEffect, useState } from 'react';
import InsightsCharts from '../../components/InsightsCharts';
import Heatmap from '../../components/Heatmap';

export default function Insights() {
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [weeklyRecs, setWeeklyRecs] = useState<any[]>([]);
  const [guidance, setGuidance] = useState<any[]>([]);

  useEffect(() => {
    // build a small demo heatmap (7 days x 24 hours) or try fetch from server
    async function build() {
      try {
        const res = await fetch('/api/insights/simple');
        const payload = await res.json();
        if (Array.isArray(payload.weeklyRecommendations)) setWeeklyRecs(payload.weeklyRecommendations);
        if (Array.isArray(payload.explainableGuidance)) setGuidance(payload.explainableGuidance);
        // payload may include logs: try to build hourly counts over last 7 days
        const logs = Array.isArray(payload.logs) ? payload.logs : Array.isArray(payload) ? payload : [];
        const now = new Date();
        const days = 7;
        const matrix = Array.from({ length: days }, () => Array.from({ length: 24 }, () => 0));
        logs.forEach((l: any) => {
          const t = new Date(l.timestamp || l.time || l.ts || l.createdAt);
          if (isNaN(t.getTime())) return;
          const dayIdx = Math.max(0, days - 1 - Math.floor((Date.now() - t.getTime()) / (24 * 3600 * 1000)));
          if (dayIdx < 0 || dayIdx >= days) return;
          const hour = t.getHours();
          matrix[dayIdx][hour] = (matrix[dayIdx][hour] || 0) + 1;
        });
        setMatrix(matrix.reverse());
      } catch (err) {
        // demo random matrix
        const demo = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => Math.round(Math.random() * 8)));
        setMatrix(demo);
        // demo weekly recs
        setWeeklyRecs(Array.from({ length: 4 }).map((_,i)=>({ weekStart: new Date(Date.now()-i*7*24*3600*1000).toISOString(), recommendation: 'No data — keep building logs.' })));
      }
    }
    build();
  }, []);

  return (
    <div style={{ padding: 8 }}>
      <h2>Insights</h2>
      <p>Pattern detections and generated insights.</p>
      <div style={{ marginTop: 16 }}>
        <InsightsCharts />
      </div>
      <div style={{ marginTop: 24 }}>
        <Heatmap matrix={matrix} xLabels={Array.from({ length: 24 }).map((_,i)=>String(i))} yLabels={['6d','5d','4d','3d','2d','1d','today']} title="Hourly activity (recent days)" />
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>Explainable Guidance</h3>
        {guidance.length === 0 ? <p>No guidance available.</p> : (
          <ul>
            {guidance.map((g, idx) => (
              <li key={`g-${idx}`} style={{ marginBottom: 8 }}>
                <div><strong>{g.message}</strong></div>
                {g.recommendation ? <div style={{ fontSize: 13 }}>{g.recommendation}</div> : null}
              </li>
            ))}
          </ul>
        )}

        <h3 style={{ marginTop: 18 }}>Weekly Recommendations</h3>
        {weeklyRecs.length === 0 ? <p>No recommendations yet.</p> : (
          <ul>
            {weeklyRecs.map((w, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <strong>{new Date(w.weekStart).toLocaleDateString()}</strong>: {w.recommendation || w.recommend}
                <div style={{ fontSize: 12, color: '#666' }}>Average: {w.average ?? '—'} • Count: {w.count ?? 0} • Trend: {w.trend ?? '—'}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
