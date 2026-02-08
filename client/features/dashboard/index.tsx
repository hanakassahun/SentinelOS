import React from 'react';
import QuickLog from '../../components/QuickLog';
import InsightsPanel from '../../components/InsightsPanel';

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>High-level metrics and recent insights.</p>
      <section style={{ marginTop: 18 }}>
        <h3>Quick Log</h3>
        <QuickLog />
      </section>
      <section style={{ marginTop: 18 }}>
        <h3>Intelligence</h3>
        <InsightsPanel />
      </section>
    </div>
  );
}
