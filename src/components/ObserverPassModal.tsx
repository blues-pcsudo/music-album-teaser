import { useEffect, useRef, useState } from 'react';
import { getTrack, pad2, TRACKS, type TrackId } from '../data/tracks';
import {
  getMostObservedTrackId,
  telemetry,
  TRACK_TRANSMISSIONS,
  useTelemetry,
} from '../data/telemetry';

interface Props {
  initialTrackId?: TrackId | null;
  onClose: () => void;
}

/**
 * Generates a personalized 1080x1920 (9:16 Instagram Story) "Observer Pass"
 * card on an HTML5 Canvas that fans can download or share directly to Instagram
 * Stories / WhatsApp / X to promote ODUVIL.
 */
export function ObserverPassModal({ initialTrackId, onClose }: Props) {
  const resonances = useTelemetry((s) => s.resonances);
  const hasPresaved = useTelemetry((s) => s.hasPresaved);
  const presaveCount = useTelemetry((s) => s.presaveCount);
  const storedObserverNumber = useTelemetry((s) => s.observerNumber);

  const defaultTrack = initialTrackId ?? getMostObservedTrackId(resonances);
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>(defaultTrack);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Ensure the user gets a consistent observer number when viewing their pass
  const observerNum = storedObserverNumber ?? telemetry.ensureObserverNumber();
  const track = getTrack(selectedTrackId);
  const transmission = TRACK_TRANSMISSIONS[selectedTrackId];
  const trackResonance = resonances[selectedTrackId] ?? 300;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Draw the 1080x1920 Story Card whenever track or telemetry updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. Deep Obsidian Background + Subtle Radial Glow
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.42, 620);
    glow.addColorStop(0, 'rgba(232, 226, 214, 0.08)');
    glow.addColorStop(0.5, 'rgba(232, 226, 214, 0.025)');
    glow.addColorStop(1, 'rgba(5, 5, 5, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // 2. Deterministic Starfield based on track number
    const seedBase = track.number * 137;
    for (let i = 0; i < 90; i++) {
      const sx = ((seedBase + i * 7919) % 980) + 50;
      const sy = ((seedBase * 3 + i * 6271) % 1780) + 70;
      const r = (i % 3 === 0 ? 1.6 : 0.9);
      const alpha = 0.12 + ((i * 31) % 50) / 100;
      ctx.fillStyle = `rgba(232, 226, 214, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Outer Technical Frame & Corner Registration Marks
    const pad = 72;
    ctx.strokeStyle = 'rgba(232, 226, 214, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

    const markLen = 28;
    ctx.strokeStyle = '#e8e2d6';
    ctx.lineWidth = 2.5;
    const corners = [
      [pad, pad, 1, 1],
      [W - pad, pad, -1, 1],
      [pad, H - pad, 1, -1],
      [W - pad, H - pad, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * markLen);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * markLen, cy);
      ctx.stroke();
    }

    // 4. Top Telemetry Header
    ctx.fillStyle = '#a8a195';
    ctx.font = '500 22px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('OBSERVATORY ARCHIVE // PINA COLADA BLUES', pad + 44, pad + 66);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#e8e2d6';
    ctx.fillText('NOV 19 · EP RELEASE', W - pad - 44, pad + 66);

    // Subtle header divider line
    ctx.strokeStyle = 'rgba(232, 226, 214, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad + 44, pad + 96);
    ctx.lineTo(W - pad - 44, pad + 96);
    ctx.stroke();

    // 5. Center Celestial Diagram (Unique per track)
    const cx = W / 2;
    const cy = H * 0.40;
    const outerR = 300;

    // Outer degree ticks
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const r1 = outerR + (isMajor ? -12 : -5);
      const r2 = outerR + (isMajor ? 12 : 5);
      ctx.strokeStyle = isMajor ? 'rgba(232, 226, 214, 0.45)' : 'rgba(232, 226, 214, 0.16)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
      ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
      ctx.stroke();
    }

    // Main outer circle
    ctx.strokeStyle = 'rgba(232, 226, 214, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.setLineDash([6, 10]);
    ctx.strokeStyle = 'rgba(232, 226, 214, 0.18)';
    ctx.beginPath();
    ctx.moveTo(cx - outerR - 40, cy);
    ctx.lineTo(cx + outerR + 40, cy);
    ctx.moveTo(cx, cy - outerR - 40);
    ctx.lineTo(cx, cy + outerR + 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Track-specific orbital geometry
    const orbitCount = 2 + (track.number % 4);
    for (let i = 0; i < orbitCount; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(((track.number * 28 + i * 45) * Math.PI) / 180);
      ctx.strokeStyle = i === 0 ? 'rgba(232, 226, 214, 0.65)' : 'rgba(232, 226, 214, 0.28)';
      ctx.lineWidth = i === 0 ? 2 : 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, outerR * (0.78 - i * 0.12), outerR * (0.34 + i * 0.08), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 7 Constellation nodes around the center, highlighting the selected track
    TRACKS.forEach((t, idx) => {
      const angle = ((idx * 360) / 7 - 90) * (Math.PI / 180);
      const dist = idx === track.number - 1 ? outerR * 0.52 : outerR * 0.72;
      const nx = cx + Math.cos(angle) * dist;
      const ny = cy + Math.sin(angle) * dist;
      const isSelected = t.id === selectedTrackId;

      // Connect to center
      ctx.strokeStyle = isSelected ? 'rgba(232, 226, 214, 0.6)' : 'rgba(232, 226, 214, 0.12)';
      ctx.lineWidth = isSelected ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Node ring & core
      if (isSelected) {
        ctx.strokeStyle = '#e8e2d6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(nx, ny, 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(232, 226, 214, 0.45)';
      ctx.beginPath();
      ctx.arc(nx, ny, isSelected ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Central Supernova Core
    ctx.fillStyle = '#e8e2d6';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232, 226, 214, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.stroke();

    // 6. Main Wordmark & Editorial Title Block
    const titleY = H * 0.63;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8e2d6';
    ctx.font = '400 84px "Instrument Sans Variable", sans-serif';
    ctx.fillText('O D U V I L .', cx, titleY);

    ctx.fillStyle = '#a8a195';
    ctx.font = 'italic 42px "Newsreader Variable", Georgia, serif';
    ctx.fillText('Finally.', cx, titleY + 60);

    // 7. Featured Track Telemetry Box
    const boxY = titleY + 120;
    ctx.fillStyle = '#a8a195';
    ctx.font = '400 22px "IBM Plex Mono", monospace';
    ctx.fillText(
      `OBSERVATION ${pad2(track.number)} // ${transmission.catalogCode}`,
      cx,
      boxY
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 54px "Newsreader Variable", Georgia, serif';
    const displayTitle = track.titleConfirmed ? track.title : `${track.title}...`;
    ctx.fillText(`“${displayTitle}”`, cx, boxY + 68);

    // Quote / Field note
    ctx.fillStyle = '#e8e2d6';
    ctx.font = '400 24px "Instrument Sans Variable", sans-serif';
    const noteText = hasPresaved ? transmission.classifiedText : transmission.fieldNote;
    ctx.fillText(noteText, cx, boxY + 125, W - 260);

    // 8. Bottom Verified Observer Pass Stamp
    const stampW = W - (pad + 44) * 2;
    const stampH = 190;
    const stampX = pad + 44;
    const stampY = H - pad - stampH - 44;

    ctx.fillStyle = 'rgba(232, 226, 214, 0.04)';
    ctx.fillRect(stampX, stampY, stampW, stampH);
    ctx.strokeStyle = 'rgba(232, 226, 214, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(stampX, stampY, stampW, stampH);

    // Left column of stamp: Observer ID
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a8a195';
    ctx.font = '400 20px "IBM Plex Mono", monospace';
    ctx.fillText(
      hasPresaved ? '● VERIFIED PRE-SAVE OBSERVER' : '● OBSERVATORY TELEMETRY PASS',
      stampX + 36,
      stampY + 54
    );

    ctx.fillStyle = '#e8e2d6';
    ctx.font = '600 44px "IBM Plex Mono", monospace';
    ctx.fillText(`OBSERVER #${observerNum}`, stampX + 36, stampY + 114);

    ctx.fillStyle = '#716d65';
    ctx.font = '400 19px "IBM Plex Mono", monospace';
    ctx.fillText(
      `${presaveCount.toLocaleString()} OBSERVERS LOGGED · ${trackResonance} TRACK SIGNALS`,
      stampX + 36,
      stampY + 154
    );

    // Right column of stamp: Artist tag
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e8e2d6';
    ctx.font = '500 22px "IBM Plex Mono", monospace';
    ctx.fillText('@PINACOLADABLUES', stampX + stampW - 36, stampY + 86);
    ctx.fillStyle = '#a8a195';
    ctx.font = '400 19px "IBM Plex Mono", monospace';
    ctx.fillText('SPOTIFY · APPLE MUSIC', stampX + stampW - 36, stampY + 124);
  }, [selectedTrackId, track, transmission, hasPresaved, observerNum, presaveCount, trackResonance]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `oduvil-observer-${observerNum}-${track.id}.png`;
    a.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File([blob], `oduvil-observer-${observerNum}.png`, {
          type: 'image/png',
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `ODUVIL — Observer #${observerNum}`,
            text: `Observing "${track.title}" from ODUVIL by Pina Colada Blues (Nov 19). Logged as Observer #${observerNum}.`,
            files: [file],
          });
          return;
        }
      }
    } catch {
      // Fallback to download if share is cancelled or unsupported
    }
    handleDownload();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <div className="pass-modal" role="dialog" aria-modal="true" aria-label="Observer Pass Story Card Generator">
      <div className="pass-scrim" onClick={onClose} aria-hidden="true" />
      <div className="pass-dialog">
        <div className="pass-header">
          <div>
            <div className="pass-eyebrow">INSTAGRAM STORY / SHAREABLE ARTIFACT</div>
            <h2 className="pass-title">OBSERVER PASS #{observerNum}</h2>
          </div>
          <button type="button" className="pass-close" onClick={onClose} aria-label="Close Observer Pass">
            ✕
          </button>
        </div>

        <div className="pass-body">
          <div className="pass-preview-wrap">
            <canvas ref={canvasRef} className="pass-canvas" />
          </div>

          <div className="pass-controls">
            <div className="pass-section">
              <div className="pass-label">SELECT FEATURED OBSERVATION (TRACK)</div>
              <div className="pass-track-pills">
                {TRACKS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="pass-track-pill"
                    data-active={t.id === selectedTrackId || undefined}
                    onClick={() => setSelectedTrackId(t.id)}
                  >
                    <span>{pad2(t.number)}</span>
                    <span>{t.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pass-section">
              <div className="pass-label">SHARE TO PROMOTE ODUVIL</div>
              <p className="pass-hint">
                Share this 9:16 card to your Instagram Story or status and tag{' '}
                <strong>@pinacoladablues</strong> to help unlock the next transmission milestone.
              </p>
              <div className="pass-actions">
                <button type="button" className="pass-btn pass-btn--primary" onClick={handleShare}>
                  SHARE / SAVE STORY CARD (9:16)
                </button>
                <div className="pass-actions-row">
                  <button type="button" className="pass-btn" onClick={handleDownload}>
                    DOWNLOAD PNG
                  </button>
                  <button type="button" className="pass-btn" onClick={handleCopyLink}>
                    {copied ? '✓ LINK COPIED' : 'COPY TEASER LINK'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
