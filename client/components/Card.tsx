import React from 'react';

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 16, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      {children}
    </div>
  );
}
