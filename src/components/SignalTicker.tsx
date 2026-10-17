import { getTrack, pad2, type TrackId } from '../data/tracks';
import { getMostObservedTrackId, useTelemetry } from '../data/telemetry';

interface Props {
  onSelectTrack?: (id: TrackId) => void;
  onOpenPass?: () => void;
}

/**
 * Live ambient telemetry ticker showing real-time observatory signals and the
 * currently most-observed teaser track.
 */
export function SignalTicker({ onSelectTrack, onOpenPass }: Props) {
  const signal = useTelemetry((s) => s.currentSignal);
  const resonances = useTelemetry((s) => s.resonances);
  const hasPresaved = useTelemetry((s) => s.hasPresaved);
  const observerNumber = useTelemetry((s) => s.observerNumber);

  const topTrackId = getMostObservedTrackId(resonances);
  const topTrack = getTrack(topTrackId);
  const topCount = resonances[topTrackId];

  return (
    <div className="signal-ticker" aria-live="polite">
      <div className="signal-ticker-feed" key={signal.id}>
        <span className="signal-pulse" aria-hidden="true" />
        <span className="signal-text">{signal.text}</span>
      </div>

      <div className="signal-ticker-right">
        <button
          type="button"
          className="signal-peak-btn"
          onClick={() => onSelectTrack?.(topTrackId)}
          title={`Listen to most observed track: ${topTrack.title}`}
        >
          <span className="signal-peak-star" aria-hidden="true">✦</span>
          <span>
            PEAK SIGNAL: {pad2(topTrack.number)} {topTrack.title.toUpperCase()} ({topCount})
          </span>
        </button>

        {onOpenPass && (
          <button
            type="button"
            className="signal-pass-btn"
            onClick={onOpenPass}
          >
            {hasPresaved && observerNumber
              ? `OBSERVER #${observerNumber} · PASS ↗`
              : 'OBSERVER PASS ↗'}
          </button>
        )}
      </div>
    </div>
  );
}
