import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { usePlayer } from '../audio/usePlayer';
import { pad2, TRACKS, type Track, type TrackId } from '../data/tracks';
import { COMPOSITION } from './composition';
import { symbolRegistry } from './symbolRegistry';
import { CelestialSymbol, symbolRatio } from './symbols';

interface CanvasProps {
  activeId: TrackId | null;
  hoverId: TrackId | null;
  /** Symbol currently "lifted" into the listening panel — hidden here. */
  liftedId: TrackId | null;
  receded: boolean;
  revealed: boolean;
  onHover: (id: TrackId | null) => void;
  onSelect: (id: TrackId) => void;
}

const STATUS_WORD: Record<string, string> = {
  playing: 'Playing',
  loading: 'Loading',
  paused: 'Paused',
  ended: 'Ended',
  error: 'Unavailable',
};

/** The seven observations, composed as one plate. */
export function ObservatoryCanvas({
  activeId,
  hoverId,
  liftedId,
  receded,
  revealed,
  onHover,
  onSelect,
}: CanvasProps) {
  const [previewId, setPreviewId] = useState<TrackId | null>(null);
  const status = usePlayer((s) => s.status);

  const handleSelect = useCallback(
    (id: TrackId) => {
      setPreviewId(null);
      onSelect(id);
    },
    [onSelect],
  );

  return (
    <section
      className="canvas"
      aria-label="Seven observations"
      data-receded={receded || undefined}
      data-revealed={revealed || undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('plate')) {
          setPreviewId(null);
        }
      }}
    >
      <div className="plate">
        <span className="plate-mark plate-mark--tl" aria-hidden="true" />
        <span className="plate-mark plate-mark--tr" aria-hidden="true" />
        <span className="plate-mark plate-mark--bl" aria-hidden="true" />
        <span className="plate-mark plate-mark--br" aria-hidden="true" />
        <ul className="observations">
          {TRACKS.map((track, i) => (
            <Observation
              key={track.id}
              track={track}
              index={i}
              active={track.id === activeId}
              statusWord={track.id === activeId ? STATUS_WORD[status] : undefined}
              hovered={track.id === hoverId}
              previewed={track.id === previewId}
              lifted={track.id === liftedId}
              onHover={onHover}
              onPreview={setPreviewId}
              onSelect={handleSelect}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

interface ObservationProps {
  track: Track;
  index: number;
  active: boolean;
  statusWord?: string;
  hovered: boolean;
  previewed: boolean;
  lifted: boolean;
  onHover: (id: TrackId | null) => void;
  onPreview: (id: TrackId | null) => void;
  onSelect: (id: TrackId) => void;
}

function Observation({
  track,
  index,
  active,
  statusWord,
  hovered,
  previewed,
  lifted,
  onHover,
  onPreview,
  onSelect,
}: ObservationProps) {
  const { wide, tall } = COMPOSITION[track.id];
  const pointerType = useRef<string>('');
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const style = {
    '--i': index,
    '--ratio': symbolRatio(track.id),
    '--wx': wide.x,
    '--wy': wide.y,
    '--ww': wide.w,
    '--wlx': wide.lx,
    '--wly': wide.ly,
    '--tx': tall.x,
    '--ty': tall.y,
    '--tw': tall.w,
    '--tlx': tall.lx,
    '--tly': tall.ly,
  } as CSSProperties;

  const artRef = useRef<HTMLSpanElement | null>(null);
  useLayoutEffect(() => {
    const art = artRef.current;
    const button = buttonRef.current;
    if (art && button) symbolRegistry.set(track.id, { art, button });
    return () => symbolRegistry.set(track.id, null);
  }, [track.id]);

  const num = pad2(track.number);
  const label = `${num}, ${track.title}${statusWord ? `, ${statusWord.toLowerCase()}` : ''}`;

  return (
    <li
      className="obs"
      style={style}
      data-wdir={wide.dir}
      data-tdir={tall.dir}
      data-active={active || undefined}
      data-hover={hovered || undefined}
      data-preview={previewed || undefined}
      data-lifted={lifted || undefined}
    >
      <button
        ref={buttonRef}
        type="button"
        className="obs-hit"
        aria-label={label}
        aria-current={active ? 'true' : undefined}
        onPointerDown={(e: PointerEvent) => {
          pointerType.current = e.pointerType;
        }}
        onClick={() => {
          const touch = pointerType.current === 'touch' || pointerType.current === 'pen';
          pointerType.current = '';
          // Touch: first tap reveals the title, second tap opens the song.
          if (touch && !previewed) {
            onPreview(track.id);
            return;
          }
          onSelect(track.id);
        }}
        onMouseEnter={() => onHover(track.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(track.id)}
        onBlur={() => onHover(null)}
      >
        <span className="obs-art" ref={artRef}>
          <CelestialSymbol id={track.id} />
        </span>
        <span className="obs-label" aria-hidden="true">
          <span className="obs-num">{num}</span>
          <span className="obs-rule" />
          <span className="obs-text">
            <span className="obs-title">{track.title}</span>
            {statusWord && <span className="obs-state">{statusWord}</span>}
            <span className="obs-open">Tap again to listen</span>
          </span>
        </span>
      </button>
    </li>
  );
}
