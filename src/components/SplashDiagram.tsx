import { useState, type ReactNode } from 'react';
import { type TrackId, getTrack } from '../data/tracks';

// Helper to pad numbers
const pad2 = (num: number) => num.toString().padStart(2, '0');

interface SplashDiagramProps {
  onSelect?: (trackId?: TrackId, cx?: number, cy?: number) => void;
  zoomTarget?: { cx: number; cy: number } | null;
}

interface InteractiveNodeProps {
  trackId: TrackId;
  cx: number;
  cy: number;
  labelDir?: 'left' | 'right';
  className?: string;
  onSelect?: (id?: TrackId, cx?: number, cy?: number) => void;
  children: ReactNode;
}

function InteractiveNode({ trackId, cx, cy, labelDir = 'right', className = '', onSelect, children }: InteractiveNodeProps) {
  const [selected, setSelected] = useState(false);
  const track = getTrack(trackId);
  if (!track) return null;

  const lx = labelDir === 'right' ? cx + 12 : cx - 12;
  const ly = cy - 4; // slight vertical optical bump

  const handleSelect = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    setSelected(true);
    onSelect?.(trackId, cx, cy);
  };

  return (
    <g 
      className={`diag-node-group ${className} ${selected ? 'is-selected' : ''}`.trim()}
      role="button"
      tabIndex={0}
      aria-label={`Preview Track ${pad2(track.number)}: ${track.title}`}
      onClick={(e) => handleSelect(e)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(e);
        }
      }}
    >
      {/* The bespoke geometric art (children) */}
      {children}
      
      {/* Label (revealed on hover/focus) */}
      <text 
        x={lx} 
        y={ly} 
        className="diag-node-label" 
        textAnchor={labelDir === 'right' ? 'start' : 'end'}
      >
        <tspan className="diag-node-num">{pad2(track.number)} </tspan>
        <tspan className="diag-node-title">
          {track.title}{!track.titleConfirmed ? '...' : ''}
        </tspan>
      </text>

      {/* Accessible invisible hit target (at least 32x32). Increased to r=40 for easier clicking anywhere on the song label/node */}
      <circle cx={cx} cy={cy} r="40" className="diag-hit-area" />
    </g>
  );
}

export function SplashDiagram({ onSelect, zoomTarget }: SplashDiagramProps) {
  const handleSvgClick = () => {
    onSelect?.();
  };

  return (
    <svg 
      viewBox="0 0 400 400" 
      className="splash-diagram"
      aria-label="Celestial diagram representing the seven works. Reference points are interactive."
      role="img"
      onClick={handleSvgClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Invisible background to capture hover/click events everywhere */}
      <rect width="400" height="400" fill="transparent" />
      
      <g 
        className="diag-zoom-container"
        style={{
          transformOrigin: zoomTarget ? `${zoomTarget.cx}px ${zoomTarget.cy}px` : '200px 200px',
          transform: zoomTarget ? 'scale(8)' : 'scale(1)',
          transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
      {/* 1. Static Observatory Grid / Registration */}
      <g className="diag-grid" aria-hidden="true">
        {/* Outer Ring and Accents */}
        <circle cx="200" cy="200" r="190" className="diag-ring-outer" />
        <path d="M10,200 A190,190 0 0,1 390,200" className="diag-arc-accent" fill="none" />
        <circle cx="200" cy="200" r="180" className="diag-ring-inner" strokeDasharray="1 5" />
        
        {/* Registration crosshairs */}
        <line x1="10" y1="200" x2="390" y2="200" className="diag-axis" />
        <line x1="200" y1="10" x2="200" y2="390" className="diag-axis" />
        
        {/* Fine tick marks on the primary axis */}
        <line x1="10" y1="195" x2="10" y2="205" className="diag-tick" />
        <line x1="390" y1="195" x2="390" y2="205" className="diag-tick" />
        <line x1="195" y1="10" x2="205" y2="10" className="diag-tick" />
        <line x1="195" y1="390" x2="205" y2="390" className="diag-tick" />

        {/* Diagonal precise axes */}
        <line x1="65" y1="65" x2="335" y2="335" className="diag-axis-sub" strokeDasharray="2 8" />
        <line x1="65" y1="335" x2="335" y2="65" className="diag-axis-sub" strokeDasharray="2 8" />

        {/* Incomplete circular arcs in the center to suggest technical instrumentation */}
        <path d="M200,165 A35,35 0 0,1 235,200" fill="none" className="diag-arc-inner" />
        <path d="M200,235 A35,35 0 0,1 165,200" fill="none" className="diag-arc-inner" />
      </g>

      {/* 2. Orbital Paths */}
      <g className="diag-orbits" aria-hidden="true">
        <ellipse cx="200" cy="200" rx="150" ry="50" transform="rotate(-30 200 200)" />
        <ellipse cx="200" cy="200" rx="170" ry="30" transform="rotate(45 200 200)" strokeDasharray="4 4" />
        <ellipse cx="200" cy="200" rx="90" ry="90" strokeDasharray="1 3" />
      </g>

      {/* 3. The Constellation */}
      <path 
        className="diag-constellation" 
        d="M60,200 L122,152 L260,115 L200,200 L278,248 L340,200 L140,285 Z" 
        aria-hidden="true"
      />

      {/* 4. The 7 Celestial Interactive Nodes */}
      <g className="diag-nodes">
        {/* Node 1: Center */}
        <InteractiveNode trackId="slowly" cx={200} cy={200} onSelect={onSelect} className="diag-center-node">
          <circle cx={200} cy={200} r={3} className="diag-node-core" />
          <circle cx={200} cy={200} r={10} className="diag-node-ring" />
        </InteractiveNode>

        {/* Node 2: Orbit 1 Left */}
        <InteractiveNode trackId="omale" cx={122} cy={152} labelDir="left" onSelect={onSelect}>
          <circle cx={122} cy={152} r={2.5} className="diag-node-core" />
          <circle cx={122} cy={152} r={6} className="diag-node-ring" strokeDasharray="1 2" />
        </InteractiveNode>

        {/* Node 3: Orbit 1 Right */}
        <InteractiveNode trackId="dopamine" cx={278} cy={248} onSelect={onSelect}>
          <circle cx={278} cy={248} r={2.5} className="diag-node-core" />
        </InteractiveNode>

        {/* Node 4: Orbit 2 Top */}
        <InteractiveNode trackId="melle" cx={260} cy={115} onSelect={onSelect}>
          <circle cx={260} cy={115} r={2} className="diag-node-core" />
        </InteractiveNode>

        {/* Node 5: Orbit 2 Bottom */}
        <InteractiveNode trackId="ormakal" cx={140} cy={285} labelDir="left" onSelect={onSelect}>
          <circle cx={140} cy={285} r={2} className="diag-node-core" />
          <circle cx={140} cy={285} r={5} className="diag-node-ring" />
        </InteractiveNode>

        {/* Node 6: Outer Ring Left */}
        <InteractiveNode trackId="pathiye" cx={60} cy={200} labelDir="left" onSelect={onSelect}>
          <circle cx={60} cy={200} r={2.5} className="diag-node-core" />
          <line x1={50} y1={200} x2={70} y2={200} className="diag-node-mark" />
        </InteractiveNode>

        {/* Node 7: Outer Ring Right */}
        <InteractiveNode trackId="ormayil" cx={340} cy={200} onSelect={onSelect}>
          <circle cx={340} cy={200} r={2.5} className="diag-node-core" />
          <line x1={330} y1={200} x2={350} y2={200} className="diag-node-mark" />
        </InteractiveNode>
      </g>
      </g>
    </svg>
  );
}
