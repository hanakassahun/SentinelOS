'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DEFAULT_USER_ID } from '../config';
import styles from './TaskPlanner.module.css';

type Task = {
  id: string;
  type: string;
  difficulty: number;
  plannedStart: string;
  plannedMinutes?: number | null;
};

function localDateTimeValue() {
  const date = new Date(Date.now() + 30 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default function TaskPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [type, setType] = useState('deep work');
  const [difficulty, setDifficulty] = useState(3);
  const [plannedStart, setPlannedStart] = useState(localDateTimeValue);
  const [plannedMinutes, setPlannedMinutes] = useState(60);
  const [actualMinutes, setActualMinutes] = useState<Record<string, number>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    const response = await fetch(`/api/tasks?userId=${encodeURIComponent(DEFAULT_USER_ID)}`);
    if (!response.ok) throw new Error('Could not load tasks.');
    const payload = await response.json();
    setTasks(payload.tasks.filter((task: Task & { outcome?: string | null }) => !task.outcome));
  }

  useEffect(() => {
    loadTasks().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load tasks.'));
  }, []);

  async function planTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEFAULT_USER_ID,
          type,
          difficulty,
          plannedStart: new Date(plannedStart).toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          plannedMinutes,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not plan task.');
      setTasks((current) => [...current, payload]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not plan task.');
    } finally {
      setPending(false);
    }
  }

  async function finishTask(task: Task, outcome: 'SUCCESS' | 'FAIL') {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualStart: new Date().toISOString(), actualMinutes: actualMinutes[task.id] ?? task.plannedMinutes ?? 60, outcome }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not complete task.');
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not complete task.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="task-planner-title">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>TASKS</p>
          <h2 id="task-planner-title">Plan and complete</h2>
        </div>
        <span className={styles.count}>{tasks.length} pending</span>
      </header>

      <form className={styles.form} onSubmit={planTask}>
        <label>Task type
          <input value={type} onChange={(event) => setType(event.target.value)} required maxLength={80} />
        </label>
        <label>Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value))}>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>Planned start
          <input type="datetime-local" value={plannedStart} onChange={(event) => setPlannedStart(event.target.value)} required />
        </label>
        <label>Planned minutes
          <input type="number" min={1} max={1440} value={plannedMinutes} onChange={(event) => setPlannedMinutes(Number(event.target.value))} />
        </label>
        <button className={styles.planButton} type="submit" disabled={pending}>Plan task</button>
      </form>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.list}>
        {tasks.map((task) => (
          <article className={styles.task} key={task.id}>
            <div className={styles.taskInfo}>
              <strong>{task.type}</strong>
              <span>Difficulty {task.difficulty} · {new Date(task.plannedStart).toLocaleString()}</span>
            </div>
            <label className={styles.duration}>Actual minutes
              <input type="number" min={1} max={1440} value={actualMinutes[task.id] ?? task.plannedMinutes ?? 60} onChange={(event) => setActualMinutes((current) => ({ ...current, [task.id]: Number(event.target.value) }))} />
            </label>
            <div className={styles.actions}>
              <button type="button" disabled={pending} onClick={() => finishTask(task, 'SUCCESS')}>Success</button>
              <button type="button" disabled={pending} onClick={() => finishTask(task, 'FAIL')}>Fail</button>
            </div>
          </article>
        ))}
        {!tasks.length ? <p className={styles.empty}>No pending tasks.</p> : null}
      </div>
    </section>
  );
}
