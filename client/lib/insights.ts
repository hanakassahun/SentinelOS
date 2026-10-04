import { Insight } from '../types';

export function formatInsight(text: string): Insight {
  return { id: 'local-'+Date.now(), text, createdAt: new Date().toISOString() };
}
