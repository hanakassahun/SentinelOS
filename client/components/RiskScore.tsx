import React, { useEffect, useRef, useState } from 'react';
import styles from './RiskScore.module.css';

type RiskLevel = 'low' | 'medium' | 'high';

function getRiskColor(level: RiskLevel) {
  switch (level) {
    case 'low': return 'var(--color-risk-low)';
    case 'medium': return 'var(--color-risk-medium)';
    case 'high': return 'var(--color-risk-high)';
    default: return 'var(--color-text-primary)';
  }
}

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
}

const RiskScore: React.FC<RiskScoreProps> = ({ score, level }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [color, setColor] = useState('var(--color-text-primary)');
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 800;
    const target = score;
    function animate(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplayScore(Math.round(progress * target));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setDisplayScore(target);
      }
    }
    setColor('var(--color-text-primary)');
    raf.current = requestAnimationFrame(animate);
    // Color transition
    const colorTimeout = setTimeout(() => setColor(getRiskColor(level)), duration * 0.7);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      clearTimeout(colorTimeout);
    };
  }, [score, level]);

  return (
    <div className={styles.score} style={{ color }}>
      {displayScore} <span className={styles.outof}>/ 100</span>
    </div>
  );
};

export default RiskScore;
