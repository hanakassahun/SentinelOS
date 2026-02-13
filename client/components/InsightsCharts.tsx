import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type LogPoint = { value: number; timestamp: string };

export default function InsightsCharts() {
  const [logs, setLogs] = useState<LogPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/insights/simple');
        if (!res.ok) throw new Error('fetch failed');
        const payload = await res.json();
        // try common shapes: { logs: [...] } or array of points or { data: { logs: [...] } }
        let pts: LogPoint[] = [];
        if (Array.isArray(payload)) pts = payload as any;
        else if (Array.isArray(payload.logs)) pts = payload.logs;
        else if (payload.data && Array.isArray(payload.data.logs)) pts = payload.data.logs;
        // normalize timestamps
        pts = pts.map((p) => ({ value: Number(p.value) || 0, timestamp: String(p.timestamp) }));
        setLogs(pts);
      } catch (err) {
        // fallback: generate demo data (7 days)
        const now = Date.now();
        const demo: LogPoint[] = Array.from({ length: 30 }).map((_, i) => ({ value: Math.round(20 + Math.sin(i / 3) * 8 + Math.random() * 4), timestamp: new Date(now - (29 - i) * 24 * 3600 * 1000).toISOString() }));
        setLogs(demo);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const labels = logs.map((p) => format(parseISO(p.timestamp), 'MMM d'));
  const values = logs.map((p) => p.value);

  // daily summary (group by day)
  const daily = labels.reduce<Record<string, number>>((acc, label, idx) => {
    acc[label] = (acc[label] || 0) + values[idx];
    return acc;
  }, {});

  const dailyLabels = Object.keys(daily);
  const dailyValues = dailyLabels.map((k) => daily[k]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h3>Trends</h3>
      <div style={{ width: '100%', maxWidth: 980 }}>
        <Line
          data={{ labels, datasets: [{ label: 'Value', data: values, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.08)', tension: 0.25 }] }}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </div>

      <h3>Daily Summary (last {dailyLabels.length} days)</h3>
      <div style={{ width: '100%', maxWidth: 980 }}>
        <Bar
          data={{ labels: dailyLabels, datasets: [{ label: 'Daily total', data: dailyValues, backgroundColor: '#10b981' }] }}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </div>
      <div>
        <h4>Quick recommendation</h4>
        {loading ? <p>Loading recommendations...</p> : (
          <div>
            {values.length === 0 ? <p>No data</p> : (
              <ul>
                <li>Peak recent value: <strong>{Math.max(...values)}</strong></li>
                <li>Median recent value: <strong>{Math.round(values.sort((a,b)=>a-b)[Math.floor(values.length/2)] ?? 0)}</strong></li>
                <li>Recommendation: focus on days where daily total &gt; {Math.round((dailyValues.reduce((s,a)=>s+a,0)/Math.max(1,dailyValues.length)) * 1.2)}</li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
