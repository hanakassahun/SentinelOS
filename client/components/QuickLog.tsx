"use client";

import React, { useState, useEffect } from 'react';
import styles from './quicklog.module.css';

type Behavior = 'ENERGY' | 'MOOD';

const SEMANTIC_LABEL = (v: number) => {
  if (v <= 3) return 'drained';
  if (v <= 6) return 'stable';
  if (v <= 8) return 'energized';
  return 'peak';
};

export default function QuickLog() {
  const [behavior, setBehavior] = useState<Behavior | null>(null);
  const [value, setValue] = useState<number>(7);
  const [expectedValue, setExpectedValue] = useState<number | undefined>(undefined);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [lastLogAt, setLastLogAt] = useState<number | null>(null);
  const [recent, setRecent] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('recentLogs');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message]);

  function toggleTag(name: string) {
    setTags((s) => (s.includes(name) ? s.filter((t) => t !== name) : [...s, name]));
  }

  async function submitLog(auto = false) {
    if (!behavior) return;

    const now = Date.now();
    if (lastLogAt && now - lastLogAt < 10 * 60 * 1000) {
      // soft guard: if too frequent, ask confirmation
      const ok = confirm('You logged recently — are you sure you want to log again?');
      if (!ok) return;
    }

    const payload: any = {
      behaviorType: behavior,
      value,
      expectedValue,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tags,
      note: note || undefined,
    };

    // optimistic feedback
    setMessage('✅ Logged. You\'re building your behavioral intelligence.');
    setLastLogAt(Date.now());
    const optimisticEntry = { behaviorType: behavior, value, timestamp: new Date().toISOString(), tags, note };
    const newRecent = [optimisticEntry, ...recent].slice(0, 10);
    setRecent(newRecent);
    try {
      localStorage.setItem('recentLogs', JSON.stringify(newRecent));
    } catch {}

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      // on success, clear transient if quick-tap
      if (auto) {
        setTags([]);
        setNote('');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to log — try again');
      // rollback optimistic cache
      const rolled = recent;
      setRecent(rolled);
      try { localStorage.setItem('recentLogs', JSON.stringify(rolled)); } catch {}
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <button
          className={styles.bigButton}
          onClick={() => {
            setBehavior('ENERGY');
            // quick-tap: one-tap logging with default value
            submitLog(true);
          }}
        >
          ⚡ Energy
        </button>

        <button
          className={styles.bigButton}
          onClick={() => {
            setBehavior('MOOD');
            submitLog(true);
          }}
        >
          🙂 Mood
        </button>
      </div>

      <div className={styles.form}>
        <label className={styles.label}>Selected</label>
        <div className={styles.info}>
          <div>Behavior: {behavior ?? '—'}</div>
          <div>
            Value: {value} — <em>{SEMANTIC_LABEL(value)}</em>
          </div>
        </div>

        <label className={styles.label} htmlFor="valueRange">Adjust value</label>
        <input
          id="valueRange"
          aria-label="Value"
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />

        <div className={styles.rangeLabels}>
          <span>1–3 drained</span>
          <span>4–6 stable</span>
          <span>7–8 energized</span>
          <span>9–10 peak</span>
        </div>

        <label className={styles.label} htmlFor="expectedRange">Expected (optional) — {expectedValue ?? '—'}</label>
        <input
          id="expectedRange"
          aria-label="Expected value"
          type="range"
          min={1}
          max={10}
          value={expectedValue ?? 7}
          onChange={(e) => setExpectedValue(Number(e.target.value))}
        />

        <label className={styles.label}>Quick tags</label>
        <div className={styles.tagsRow}>
          {['Home', 'Campus', 'Work', 'Outside'].map((t) => (
            <button
              key={t}
              className={tags.includes(t) ? styles.tagActive : styles.tag}
              onClick={() => toggleTag(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>

        <label className={styles.label}>State tags</label>
        <div className={styles.tagsRow}>
          {['Alone', 'With people'].map((t) => (
            <button
              key={t}
              className={tags.includes(t) ? styles.tagActive : styles.tag}
              onClick={() => toggleTag(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>

        <label className={styles.label}>Note (optional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} />

        <div className={styles.actions}>
          <button
            disabled={!behavior}
            onClick={() => submitLog(false)}
            className={styles.save}
          >
            Save Log
          </button>
        </div>
      </div>

      {message && <div className={styles.toast}>{message}</div>}
    </div>
  );
}
