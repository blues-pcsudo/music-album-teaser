import { useTelemetry } from '../data/telemetry';

interface Props {
  compact?: boolean;
  onOpenPass?: () => void;
}

/**
 * Displays randomized live observatory telemetry, active observer count, and the
 * visitor's assigned random Observer # badge.
 */
export function PresaveTelemetry({ compact = false, onOpenPass }: Props) {
  const observerCount = useTelemetry((s) => s.presaveCount);
  const activeNow = useTelemetry((s) => s.activeNow);
  const milestoneTarget = useTelemetry((s) => s.milestoneTarget);
  const hasPresaved = useTelemetry((s) => s.hasPresaved);
  const observerNumber = useTelemetry((s) => s.observerNumber);

  const baseline = Math.max(0, milestoneTarget - 600);
  const pct = Math.min(
    100,
    Math.max(12, ((observerCount - baseline) / (milestoneTarget - baseline)) * 100)
  );

  return (
    <div className="telemetry-presave" data-compact={compact || undefined} data-presaved={hasPresaved || undefined}>
      <div className="telemetry-presave-row">
        <span className="telemetry-live-dot" aria-hidden="true" />
        <span className="telemetry-presave-count">
          <strong>{observerCount.toLocaleString()}</strong> OBSERVERS LOGGED
        </span>
        <span className="telemetry-sep" aria-hidden="true">·</span>
        <span className="telemetry-badge-logged">
          YOU ARE OBSERVER #{observerNumber}
        </span>
      </div>

      <div className="telemetry-bar" role="progressbar" aria-valuenow={observerCount} aria-valuemin={baseline} aria-valuemax={milestoneTarget} aria-label="Observatory milestone progress">
        <div className="telemetry-bar-fill" style={{ width: `${pct.toFixed(1)}%` }} />
      </div>

      <div className="telemetry-presave-footer">
        <span className="telemetry-unlock-caption">
          {activeNow} OBSERVERS ACTIVE NOW · NEXT MILESTONE {milestoneTarget.toLocaleString()}
        </span>
        {onOpenPass && (
          <button
            type="button"
            className="telemetry-pass-trigger"
            onClick={onOpenPass}
          >
            <span>OBSERVER PASS #{observerNumber}</span>
            <span aria-hidden="true">↗</span>
          </button>
        )}
      </div>
    </div>
  );
}
