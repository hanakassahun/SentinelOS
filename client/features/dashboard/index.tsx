import React from 'react';
import QuickLog from '../../components/QuickLog';

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>High-level metrics and recent insights.</p>
      <section style={{ marginTop: 18 }}>
        <h3>Quick Log</h3>
        <QuickLog />
      </section>
    </div>
  );
}
