import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { pad2, getTrack, SPOTIFY_PRESAVE_URL, APPLE_MUSIC_URL, type TrackId } from '../data/tracks';
import {
  getMostObservedTrackId,
  telemetry,
  TRACK_TRANSMISSIONS,
  useTelemetry,
} from '../data/telemetry';
import { AudioControls } from './AudioControls';
import { ReturnGlyph } from './Glyphs';
import { SpotifyIcon, AppleMusicIcon } from './BrandGlyphs';
import { symbolRegistry } from './symbolRegistry';
import { CelestialSymbol } from './symbols';

interface Props {
  id: TrackId;
  onClose: () => void;
  onOpenPass: (id: TrackId) => void;
}

/**
 * The expanded listening panel.
 *
 * It uses a FLIP animation to fly the celestial symbol out of the canvas
 * plate and into the room, preserving visual continuity. When closed, it
 * flies back and restores keyboard focus to the observation button.
 */
export function ListeningPanel({ id, onClose, onOpenPass }: Props) {
  const [closing, setClosing] = useState(false);
  const track = getTrack(id);
  const transmission = TRACK_TRANSMISSIONS[id];
  const resonances = useTelemetry((s) => s.resonances);
  const userResonated = useTelemetry((s) => Boolean(s.userResonated[id]));
  const hasPresaved = useTelemetry((s) => s.hasPresaved);
  const presaveCount = useTelemetry((s) => s.presaveCount);
  const observerNumber = useTelemetry((s) => s.observerNumber);

  const isMostObserved = getMostObservedTrackId(resonances) === id;
  const resonanceCount = resonances[id] ?? 300;
  const isDecrypted = useTelemetry((s) => Boolean(s.hasPresaved || s.decryptedTracks[id]));
  const activeNow = useTelemetry((s) => s.activeNow);

  const playBtn = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const motion = useReducedMotion();

  // The symbol transitions into place using a FLIP animation.
  const artRef = useRef<HTMLDivElement>(null);
  const originRect = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    const entry = symbolRegistry.get(id);
    if (!entry) return;
    const origin = entry.art.getBoundingClientRect();
    originRect.current = origin;
    const art = artRef.current;
    if (!art || motion) return;

    // First paint: measure the destination.
    const dest = art.getBoundingClientRect();
    // Invert the layout change.
    const dx = origin.left - dest.left;
    const dy = origin.top - dest.top;
    const sw = origin.width / dest.width;
    const sh = origin.height / dest.height;

    // Apply the inverted transform immediately (no transition).
    art.style.transition = 'none';
    art.style.transform = `translate(${dx}px, ${dy}px) scale(${sw}, ${sh})`;

    // Next frame: remove the transform to animate to the destination.
    const raf = requestAnimationFrame(() => {
      art.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
      art.style.transform = 'none';
    });
    return () => cancelAnimationFrame(raf);
  }, [id, motion]);

  // Initial focus.
  useEffect(() => {
    // A small delay lets the opening transition start before we shift focus.
    const timer = setTimeout(() => {
      const activeElement = document.activeElement;
      // Don't steal focus if the user already moved it (e.g. they clicked next).
      if (!activeElement || !contentRef.current?.contains(activeElement)) {
        playBtn.current?.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [id]);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    const entry = symbolRegistry.get(id);
    const origin = entry?.art.getBoundingClientRect();
    const art = artRef.current;

    // If we can't do the return animation, just close immediately.
    if (!art || !origin || motion) {
      entry?.button.focus();
      onClose();
      return;
    }

    const dest = art.getBoundingClientRect();
    const dx = origin.left - dest.left;
    const dy = origin.top - dest.top;
    const sw = origin.width / dest.width;
    const sh = origin.height / dest.height;

    art.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    art.style.transform = `translate(${dx}px, ${dy}px) scale(${sw}, ${sh})`;
    art.style.opacity = '0'; // fade out slightly earlier than the container

    setTimeout(() => {
      entry?.button.focus();
      onClose();
    }, 450); // match transition minus a tiny margin
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      className="room"
      role="dialog"
      aria-label={`Listening to ${track.title}`}
      aria-modal="true"
      data-closing={closing || undefined}
    >
      <div className="room-scrim" aria-hidden="true" onClick={handleClose} />
      <div className="room-content" ref={contentRef}>
        <button
          type="button"
          className="room-back"
          onClick={handleClose}
          aria-label="Return to the observatory"
        >
          <ReturnGlyph />
        </button>

        <div className="room-art">
          <div className="room-art-inner" ref={artRef}>
            <CelestialSymbol id={id} />
          </div>
        </div>

        <div className="room-info">
          <div className="room-meta-bar">
            <span className="room-num" aria-hidden="true">
              {pad2(track.number)} // {transmission.catalogCode}
            </span>
            {isMostObserved && (
              <span className="room-peak-badge">✦ MOST OBSERVED</span>
            )}
          </div>

          <div className="room-title-row">
            <h2 className="room-title">
              {track.title}
              {!track.titleConfirmed && <span className="room-unconfirmed" aria-label="Title incomplete">...</span>}
            </h2>

            <button
              type="button"
              className="room-resonate-btn"
              data-active={userResonated || undefined}
              onClick={() => telemetry.toggleResonance(id)}
              aria-pressed={userResonated}
              title={userResonated ? 'Signal transmitted' : 'Send resonance signal for this track'}
            >
              <span className="room-resonate-icon" aria-hidden="true">
                {userResonated ? '✦' : '✧'}
              </span>
              <span className="room-resonate-label">
                {userResonated ? 'SIGNAL SENT' : 'RESONATE'}
              </span>
              <span className="room-resonate-count">{resonanceCount}</span>
            </button>
          </div>

          <AudioControls playRef={playBtn} />

          <div className="room-presave-section">
            <div className="room-presave">
              <a
                href={SPOTIFY_PRESAVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="link-presave"
                aria-label="Pre-save ODUVIL on Spotify"
                onClick={() => telemetry.recordPresave('spotify')}
              >
                <SpotifyIcon />
                <span className="link-presave-name">SPOTIFY</span>
                <span className="link-presave-meta">PRE-SAVE</span>
                <svg className="link-presave-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
                  <path d="M1 9L9 1M9 1H3M9 1V7" strokeWidth="1" strokeLinecap="square" />
                </svg>
              </a>
              <a
                href={APPLE_MUSIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="link-presave"
                aria-label="Pre-add ODUVIL on Apple Music"
                onClick={() => telemetry.recordPresave('apple')}
              >
                <AppleMusicIcon />
                <span className="link-presave-name">APPLE MUSIC</span>
                <span className="link-presave-meta">PRE-ADD</span>
                <svg className="link-presave-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
                  <path d="M1 9L9 1M9 1H3M9 1V7" strokeWidth="1" strokeLinecap="square" />
                </svg>
              </a>
              <button
                type="button"
                className="link-presave link-presave--story"
                onClick={() => onOpenPass(id)}
              >
                <span className="link-presave-name">OBSERVER PASS</span>
                <span className="link-presave-meta">9:16 STORY ↗</span>
              </button>
            </div>

            <div className="room-presave-status">
              <span className="telemetry-live-dot" aria-hidden="true" />
              <span>
                OBSERVER #{observerNumber} · {presaveCount.toLocaleString()} OBSERVERS LOGGED ({activeNow} ACTIVE NOW)
              </span>
            </div>
          </div>

          {/* Classified Transmission / Lyric & Mystery Title Gate */}
          <div
            className="room-transmission"
            data-unlocked={isDecrypted || undefined}
            onClick={!isDecrypted ? () => telemetry.decryptTrack(id) : undefined}
            style={{ cursor: !isDecrypted ? 'pointer' : 'default' }}
          >
            <div className="room-transmission-note">{transmission.fieldNote}</div>
            <div className="room-transmission-secret">
              <div className="room-transmission-header">
                <span className="room-transmission-tag">
                  {isDecrypted ? `✓ ${transmission.classifiedLabel}` : `🔒 ${transmission.classifiedLabel}`}
                </span>
                {!isDecrypted && (
                  <span className="room-transmission-hint">TAP OR PRE-SAVE TO DECRYPT</span>
                )}
              </div>
              <p className="room-transmission-cipher">
                {transmission.classifiedText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
