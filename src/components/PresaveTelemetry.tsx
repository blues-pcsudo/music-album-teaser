interface Props {
  compact?: boolean;
  onOpenPass?: () => void;
}

/**
 * Minimal editorial trigger to open the 9:16 Story Card / Observer Pass modal.
 */
export function PresaveTelemetry({ compact = false, onOpenPass }: Props) {
  if (!onOpenPass) return null;

  return (
    <button
      type="button"
      className="telemetry-story-link"
      data-compact={compact || undefined}
      onClick={onOpenPass}
    >
      <span className="telemetry-live-dot" aria-hidden="true" />
      <span className="telemetry-story-text">SHARE STORY CARD</span>
      <span className="telemetry-story-arrow" aria-hidden="true">↗</span>
    </button>
  );
}
