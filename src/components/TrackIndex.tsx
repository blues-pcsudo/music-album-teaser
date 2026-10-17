import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../audio/usePlayer';
import { formatTime, pad2, TRACKS, type TrackId } from '../data/tracks';
import { getMostObservedTrackId, useTelemetry } from '../data/telemetry';

interface Props {
  activeId: TrackId | null;
  hoverId: TrackId | null;
  onHover: (id: TrackId | null) => void;
  onSelect: (id: TrackId) => void;
}

/**
 * Direct access to the seven songs. Always visible on wide screens; on
 * narrow screens it folds behind a small "Index" control.
 */
export function TrackIndex({ activeId, hoverId, onHover, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const status = usePlayer((s) => s.status);
  const resonances = useTelemetry((s) => s.resonances);
  const topTrackId = getMostObservedTrackId(resonances);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <nav className="index" aria-label="Track index" data-open={open || undefined}>
      <button
        ref={toggleRef}
        type="button"
        className="index-toggle"
        aria-expanded={open}
        aria-controls="track-index-list"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{open ? 'Close' : 'Index'}</span>
        <span className="index-count" aria-hidden="true">
          07
        </span>
      </button>
      <div className="index-scrim" aria-hidden="true" onClick={() => setOpen(false)} />
      <ol className="index-list" id="track-index-list" ref={listRef}>
        {TRACKS.map((t) => {
          const active = t.id === activeId;
          const playing = active && (status === 'playing' || status === 'loading');
          const isPeak = t.id === topTrackId;
          const resCount = resonances[t.id] ?? 300;
          return (
            <li key={t.id}>
              <button
                type="button"
                className="index-entry"
                aria-current={active ? 'true' : undefined}
                data-hover={t.id === hoverId || undefined}
                data-playing={playing || undefined}
                data-peak={isPeak || undefined}
                onClick={() => {
                  setOpen(false);
                  onSelect(t.id);
                }}
                onMouseEnter={() => onHover(t.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(t.id)}
                onBlur={() => onHover(null)}
              >
                <span className="index-num">{pad2(t.number)}</span>
                <span className="index-title">
                  {t.title}
                  {isPeak && (
                    <span className="index-peak-star" title="Most observed track" aria-label="Most observed">
                      ✦
                    </span>
                  )}
                </span>
                <span className="index-mark" aria-hidden="true" />
                <span className="index-res" title={`${resCount} observer signals`}>
                  ✧ {resCount}
                </span>
                <span className="index-dur">
                  {active ? <span className="sr-only">{playing ? 'Playing, ' : 'Current, '}</span> : null}
                  {formatTime(t.duration)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
