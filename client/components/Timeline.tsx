import React from 'react';
import styles from './Timeline.module.css';

interface TimelineEvent {
  label: string;
  risk: 'low' | 'medium' | 'high' | null;
  time: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => (
  <div className={styles.timeline}>
    {events.map((event, i) => (
      <div key={i} className={styles.event}>
        <span
          className={styles.dot}
          style={{ background: event.risk ? `var(--color-risk-${event.risk})` : '#CBD5E1' }}
        />
        <span className={styles.label}>{event.label}</span>
        <span className={styles.time}>{event.time}</span>
      </div>
    ))}
  </div>
);

export default Timeline;
