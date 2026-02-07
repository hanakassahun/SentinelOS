import { BehavioralEvent, Insight } from '../types';

export function formatInsight(text: string): Insight {
  return { id: 'local-'+Date.now(), text, createdAt: new Date().toISOString() };
}

export function summarizeEvents(events: BehavioralEvent[]) {
  // small client-side summarizer (presentation only)
  return { count: events.length };
}
