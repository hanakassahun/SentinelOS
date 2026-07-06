"use client";
import React from 'react';

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        border: '1px solid rgba(148,163,184,0.12)',
        background: 'rgba(255,255,255,0.04)',
        boxShadow: '0 20px 50px -30px rgba(0,0,0,0.32)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
