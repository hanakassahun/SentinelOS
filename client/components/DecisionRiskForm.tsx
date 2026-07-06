import React, { useState } from 'react';
import type { RiskEvaluationOutput } from '../types';

export default function DecisionRiskForm() {
  const [action, setAction] = useState('');
  const [context, setContext] = useState('{}');
  const [result, setResult] = useState<RiskEvaluationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/decision/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, context: JSON.parse(context) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Decision Risk Evaluation</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Action<br />
            <input value={action} onChange={e => setAction(e.target.value)} required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Context (JSON)<br />
            <textarea value={context} onChange={e => setContext(e.target.value)} rows={4} style={{ width: '100%' }} />
          </label>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Evaluating...' : 'Evaluate Risk'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Risk Score: {result.riskScore}</h3>
          {result.explanations && (
            <div>
              <strong>Explanations:</strong>
              <ul>
                {result.explanations.map((ex: string, i: number) => <li key={i}>{ex}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
