import React, { useEffect, useState } from 'react';
import InsightsCharts from '../../components/InsightsCharts';
import Heatmap from '../../components/Heatmap';

export default function Insights() {
  const [matrix, setMatrix] = useState<number[][]>([]);

  useEffect(() => {
    // build a small demo heatmap (7 days x 24 hours) or try fetch from server
    async function build() {
      try {
        const res = await fetch('/api/insights/simple');
        const payload = await res.json();
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
    </div>
  );
}
