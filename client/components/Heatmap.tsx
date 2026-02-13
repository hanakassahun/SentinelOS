import React from 'react';

type Props = { matrix?: number[][]; xLabels?: string[]; yLabels?: string[]; title?: string };

function colorFor(v: number, max = 10) {
  const ratio = Math.max(0, Math.min(1, v / max));
  const r = Math.round(255 * (1 - ratio));
  const g = Math.round(200 * ratio + 55 * (1 - ratio));
  return `rgb(${r}, ${g}, 80)`;
}

export default function Heatmap({ matrix = [], xLabels = [], yLabels = [], title }: Props) {
  const max = matrix.flat().reduce((m, v) => Math.max(m, v), 0) || 1;
  return (
    <div>
      {title ? <h3>{title}</h3> : null}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${matrix[0]?.length ?? 0}, 28px)`, gap: 4, alignItems: 'center' }}>
          <div />
          {(xLabels.length ? xLabels : Array.from({ length: matrix[0]?.length ?? 0 }).map((_,i)=>String(i))).map((l, i) => (
            <div key={i} style={{ fontSize: 11, textAlign: 'center' }}>{l}</div>
          ))}

          {matrix.map((row, ri) => (
            <React.Fragment key={ri}>
              <div style={{ fontSize: 12, paddingRight: 6, textAlign: 'right' }}>{yLabels[ri] ?? `R${ri}`}</div>
              {row.map((cell, ci) => (
                <div key={ci} title={`${cell}`} style={{ width: 28, height: 20, background: colorFor(cell, max), borderRadius: 3 }} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
