import { useTelemetry } from '../data/telemetry';

interface Props {
  compact?: boolean;
  onOpenPass?: () => void;
}

/**
 * Displays live pre-save social proof, milestone progress bar, and the user's
 * personal Observer # badge once they click Spotify Pre-Save or Apple Music Pre-Add.
 */
export function PresaveTelemetry({ compact = false, onOpenPass }: Props) {
  const presaveCount = useTelemetry((s) => s.presaveCount);
  const milestoneTarget = useTelemetry((s) => s.milestoneTarget);
  const hasPresaved = useTelemetry((s) => s.hasPresaved);
  const observerNumber = useTelemetry((s) => s.observerNumber);

  // Calculate progress between 1000 baseline and milestoneTarget
  const baseline = milestoneTarget - 500;
  const pct = Math.min(
    100,
    Math.max(8, ((presaveCount - baseline) / (milestoneTarget - baseline)) * 100)
  );
  const remaining = Math.max(0, milestoneTarget - presaveCount);

  return (
    <div className="telemetry-presave" data-compact={compact || undefined} data-presaved={hasPresaved || undefined}>
      <div className="telemetry-presave-row">
        <span className="telemetry-live-dot" aria-hidden="true" />
        <span className="telemetry-presave-count">
          <strong>{presaveCount.toLocaleString()}</strong> OBSERVERS PRE-SAVED
        </span>
        <span className="telemetry-sep" aria-hidden="true">·</span>
        {hasPresaved && observerNumber ? (
          <span className="telemetry-badge-logged">
            LOGGED AS OBSERVER #{observerNumber}
          </span>
        ) : (
          <span className="telemetry-milestone-hint">
            {remaining} TO {milestoneTarget.toLocaleString()} MILESTONE
          </span>
        )}
      </div>

      <div className="telemetry-bar" role="progressbar" aria-valuenow={presaveCount} aria-valuemin={baseline} aria-valuemax={milestoneTarget} aria-label="Pre-save milestone progress">
        <div className="telemetry-bar-fill" style={{ width: `${pct.toFixed(1)}%` }} />
      </div>

      <div className="telemetry-presave-footer">
        <span className="telemetry-unlock-caption">
          {hasPresaved
            ? '✓ CLASSIFIED TRACK TRANSMISSIONS UNLOCKED'
            : 'PRE-SAVE TO UNLOCK CLASSIFIED LYRIC & TITLE ARCHIVES'}
        </span>
        {onOpenPass && (
          <button
            type="button"
            className="telemetry-pass-trigger"
            onClick={onOpenPass}
          >
            <span>{hasPresaved ? 'GET OBSERVER PASS' : 'SHARE STORY CARD'}</span>
            <span aria-hidden="true">↗</span>
          </button>
        )}
      </div>
    </div>
  );
}
