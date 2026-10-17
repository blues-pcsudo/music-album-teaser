import { useCallback, useEffect, useRef, useState, type Ref } from 'react';
import { player, type PlaybackProblem } from '../audio/player';
import { usePlaybackSeconds, usePlayer, useProgressVar } from '../audio/usePlayer';
import { formatTime, getNext, getPrevious, getTrack, pad2, spokenTime } from '../data/tracks';
import { NextGlyph, PauseGlyph, PlayGlyph, PrevGlyph } from './Glyphs';

const PROBLEM_TEXT: Record<PlaybackProblem, string> = {
  missing: 'This recording could not be found.',
  unsupported: 'This browser cannot play this audio format.',
  network: 'The recording stopped loading. Check the connection.',
  blocked: 'The browser held playback back. Press play to begin.',
  unknown: 'This recording could not be played.',
};

/** True only after `value` has stayed true for `ms` — avoids flicker. */
function useSettled(value: boolean, ms: number) {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!value) {
      setSettled(false);
      return;
    }
    const id = window.setTimeout(() => setSettled(true), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return settled && value;
}

interface Props {
  playRef?: Ref<HTMLButtonElement>;
}

/** Transport, timeline and honest status for the current track. */
export function AudioControls({ playRef }: Props) {
  const id = usePlayer((s) => s.currentId);
  const status = usePlayer((s) => s.status);
  const duration = usePlayer((s) => s.duration);
  const problem = usePlayer((s) => s.problem);
  const seconds = usePlaybackSeconds();

  const timelineRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const scrubbing = useRef(false);

  const syncRange = useCallback((t: number) => {
    const r = rangeRef.current;
    if (r && !scrubbing.current) r.value = String(t);
  }, []);
  useProgressVar(timelineRef, syncRange);

  const loading = useSettled(status === 'loading', 320);

  if (!id) return null;
  const track = getTrack(id);
  const prev = getPrevious(id);
  const next = getNext(id);
  const active = status === 'playing' || status === 'loading';
  const failed = status === 'error';

  let message = '';
  if (problem) message = PROBLEM_TEXT[problem];
  else if (loading) message = 'Loading…';
  else if (status === 'ended' && !next) message = 'End of the seven songs.';

  return (
    <div className="controls" data-status={status}>
      <div className="transport">
        <button
          type="button"
          className="transport-btn"
          onClick={() => player.previous()}
          disabled={!prev}
          aria-label={prev ? `Previous song: ${pad2(prev.number)}, ${prev.title}` : 'Previous song (this is the first)'}
        >
          <PrevGlyph />
        </button>
        <button
          ref={playRef}
          type="button"
          className="transport-btn transport-play"
          onClick={() => player.toggle()}
          aria-label={failed ? `Try ${track.title} again` : active ? `Pause ${track.title}` : `Play ${track.title}`}
          aria-busy={loading || undefined}
        >
          {active ? <PauseGlyph /> : <PlayGlyph />}
        </button>
        <button
          type="button"
          className="transport-btn"
          onClick={() => player.next()}
          disabled={!next}
          aria-label={next ? `Next song: ${pad2(next.number)}, ${next.title}` : 'Next song (this is the last)'}
        >
          <NextGlyph />
        </button>
      </div>

      <div className="timeline" ref={timelineRef} data-disabled={failed || undefined}>
        <span className="time" aria-hidden="true">
          {formatTime(seconds)}
        </span>
        <div className="line">
          <span className="line-base" aria-hidden="true" />
          <span className="line-fill" aria-hidden="true" />
          <span className="line-head" aria-hidden="true" />
          <input
            ref={rangeRef}
            className="line-input"
            type="range"
            min={0}
            max={duration ?? 0}
            step={0.1}
            defaultValue={0}
            disabled={failed || !duration}
            aria-label={`Seek within ${track.title}`}
            aria-valuetext={`${spokenTime(seconds)} of ${spokenTime(duration)}`}
            onPointerDown={() => {
              scrubbing.current = true;
            }}
            onPointerUp={() => {
              scrubbing.current = false;
            }}
            onPointerCancel={() => {
              scrubbing.current = false;
            }}
            onBlur={() => {
              scrubbing.current = false;
            }}
            onInput={(e) => player.seek(Number(e.currentTarget.value))}
          />
        </div>
        <span className="time time--total" aria-hidden="true">
          {formatTime(duration)}
        </span>
      </div>

      <div className="status" role="status" aria-live="polite">
        {message && <span className="status-text">{message}</span>}
        {failed && (
          <span className="status-actions">
            <button type="button" className="text-btn" onClick={() => player.retry()}>
              Try again
            </button>
            {next && (
              <button type="button" className="text-btn" onClick={() => player.select(next.id)}>
                Skip to {pad2(next.number)}
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
