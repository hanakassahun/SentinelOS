import type { TaskEvent } from '../types';

export function correlateEnergy(events: TaskEvent[]) {
  const withEnergy = events.filter(e => typeof e.energyAtStart === 'number' && e.outcome !== null && e.outcome !== undefined);
  if (withEnergy.length < 2) return { correlation: null, summary: 'Insufficient data' };
  const energy = withEnergy.map(e => e.energyAtStart as number);
  const outcome = withEnergy.map(e => e.outcome === 'SUCCESS' ? 1 : 0);
  const n = energy.length;
  const avgE = energy.reduce((a, b) => a + b, 0) / n;
  const avgO = outcome.reduce<number>((a, b) => a + b, 0) / n;
  let num = 0, denE = 0, denO = 0;
  for (let i = 0; i < n; i++) {
    const dE = energy[i] - avgE;
    const dO = outcome[i] - avgO;
    num += dE * dO;
    denE += dE * dE;
    denO += dO * dO;
  }
  const denom = Math.sqrt(denE * denO);
  const correlation = denom === 0 ? null : +(num / denom).toFixed(3);
  return { correlation, summary: `Energy-success correlation: ${correlation}` };
}
