import React from 'react';
import type { Recommendation } from '../types';

const priorityColor: Record<Recommendation['priority'], string> = {
  critical: '#b91c1c',
  high: '#c2410c',
  medium: '#ca8a04',
  low: '#16a34a',
};

export default function RecommendationBanner({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div style={{
      borderLeft: `4px solid ${priorityColor[recommendation.priority]}`,
      background: '#f8fafc',
      padding: '1rem',
      borderRadius: 12,
      marginTop: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: priorityColor[recommendation.priority] }}>
          {recommendation.priority.toUpperCase()} RECOMMENDATION
        </span>
        <span style={{ fontSize: 13, color: '#475569' }}>{recommendation.category}</span>
      </div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{recommendation.title}</div>
      <div style={{ color: '#334155', marginBottom: 10 }}>{recommendation.description}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {recommendation.actionItems.map((action, index) => (
          <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: priorityColor[recommendation.priority], fontWeight: 700 }}>•</span>
            <p style={{ margin: 0, fontSize: 14, color: '#334155' }}>{action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
