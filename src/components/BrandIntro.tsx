import { useEffect, useState, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

export function BrandIntro({ onComplete }: Props) {
  const [exiting, setExiting] = useState(false);
  const skipped = useRef(false);

  useEffect(() => {
    // Shorter cinematic reveal for logo
    const exitTimer = setTimeout(() => {
      if (!skipped.current) {
        setExiting(true);
      }
    }, 2800);

    const completeTimer = setTimeout(() => {
      if (!skipped.current) {
        onComplete();
      }
    }, 4000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (exiting || skipped.current) return;
    skipped.current = true;
    setExiting(true);
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  return (
    <div 
      className={`brand-intro ${exiting ? 'is-exiting' : ''}`}
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      aria-label="Skip introduction"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
          e.preventDefault();
          handleSkip();
        }
      }}
    >
      <div className="intro-logo-wrapper" aria-hidden="true">
        <img src="/logo.png" alt="Pina Colada Blues" className="intro-logo-img" />
      </div>
      <div className="intro-skip-hint">Click anywhere to skip</div>
    </div>
  );
}
