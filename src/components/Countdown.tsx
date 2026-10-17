import { useState, useEffect } from 'react';

// Hardcoded target date: Nov 19, 2026 at 12:00 AM (midnight)
const TARGET_DATE = new Date('2026-11-19T00:00:00').getTime();

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState(TARGET_DATE - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(TARGET_DATE - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const safeTimeLeft = Math.max(0, timeLeft);

  const days = Math.floor(safeTimeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((safeTimeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((safeTimeLeft % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="cd">
      <div className="cd-label">EP LAUNCH IN</div>
      <div className="cd-values">
        <div className="cd-block">
          <span className="cd-num">{pad(days)}</span>
          <span className="cd-unit">DAYS</span>
        </div>
        <span className="cd-sep" aria-hidden="true">:</span>
        <div className="cd-block">
          <span className="cd-num">{pad(hours)}</span>
          <span className="cd-unit">HRS</span>
        </div>
        <span className="cd-sep" aria-hidden="true">:</span>
        <div className="cd-block">
          <span className="cd-num">{pad(minutes)}</span>
          <span className="cd-unit">MIN</span>
        </div>
        <span className="cd-sep" aria-hidden="true">:</span>
        <div className="cd-block">
          <span className="cd-num">{pad(seconds)}</span>
          <span className="cd-unit">SEC</span>
        </div>
      </div>
    </div>
  );
}
