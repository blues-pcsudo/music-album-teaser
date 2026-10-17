import { useRef } from 'react';
import { player } from '../audio/player';
import { usePlaybackSeconds, usePlayer, useProgressVar } from '../audio/usePlayer';
import { formatTime, getTrack, pad2, type TrackId } from '../data/tracks';
import { PauseGlyph, PlayGlyph } from './Glyphs';

interface Props {
  hidden: boolean;
  onOpen: (id: TrackId) => void;
}

/**
 * A quiet line at the foot of the plate while a song is current and the
 * listening room is closed. Playback continues; the room can be reopened.
 */
export function NowPlaying({ hidden, onOpen }: Props) {
  const id = usePlayer((s) => s.currentId);
  const status = usePlayer((s) => s.status);
  const duration = usePlayer((s) => s.duration);
  const seconds = usePlaybackSeconds();
  const lineRef = useRef<HTMLDivElement>(null);
  useProgressVar(lineRef);

  if (!id) return null;
  const track = getTrack(id);
  const active = status === 'playing' || status === 'loading';

  return (
    <aside className="now" aria-label="Now playing" data-hidden={hidden || undefined} ref={lineRef}>
      <button
        type="button"
        className="now-toggle"
        onClick={() => player.toggle()}
        aria-label={active ? `Pause ${track.title}` : `Play ${track.title}`}
      >
        {active ? <PauseGlyph /> : <PlayGlyph />}
      </button>
      <button type="button" className="now-open" onClick={() => onOpen(id)} aria-label={`Open ${track.title} in the listening room`}>
        <span className="now-num">{pad2(track.number)}</span>
        <span className="now-title">{track.title}</span>
        <span className="now-time">
          {formatTime(seconds)} <span className="now-sep">/</span> {formatTime(duration)}
        </span>
        <span className="now-cue">Open</span>
      </button>
      <span className="now-line" aria-hidden="true" />
    </aside>
  );
}
