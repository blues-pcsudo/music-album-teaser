export function SplashEngraving() {
  return (
    <svg 
      viewBox="0 0 1000 1000" 
      className="splash-engraving"
      aria-hidden="true"
    >
      {/* 
        Oversized astronomical engraving.
        Provides a subtle, structural background without competing with the main diagram. 
      */}
      <g className="engraving-group">
        {/* Massive concentric circles mapping an expanded field */}
        <circle cx="500" cy="500" r="350" className="engraving-ring" />
        <circle cx="500" cy="500" r="480" className="engraving-ring-dashed" />
        <circle cx="500" cy="500" r="700" className="engraving-ring" />
        <circle cx="500" cy="500" r="850" className="engraving-ring-faint" />

        {/* Faint radial axes mapping the instrument */}
        <line x1="500" y1="0" x2="500" y2="1000" className="engraving-axis" />
        <line x1="0" y1="500" x2="1000" y2="500" className="engraving-axis" />
        
        {/* Diagonal structural markers */}
        <line x1="146" y1="146" x2="854" y2="854" className="engraving-axis-sub" />
        <line x1="146" y1="854" x2="854" y2="146" className="engraving-axis-sub" />

        {/* Incomplete circular arcs / calibration zones */}
        <path d="M500,20 A480,480 0 0,1 980,500" fill="none" className="engraving-arc" />
        <path d="M500,980 A480,480 0 0,1 20,500" fill="none" className="engraving-arc" />

        {/* Outer radial ticks (e.g., degree markers) */}
        <g className="engraving-ticks">
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i * 5 * Math.PI) / 180;
            const r1 = 475;
            const r2 = 485;
            const x1 = 500 + r1 * Math.cos(angle);
            const y1 = 500 + r1 * Math.sin(angle);
            // Highlight every 30 degrees (i % 6 === 0)
            const isMajor = i % 6 === 0;
            const x3 = 500 + (r2 + (isMajor ? 10 : 0)) * Math.cos(angle);
            const y3 = 500 + (r2 + (isMajor ? 10 : 0)) * Math.sin(angle);

            return (
              <line 
                key={i} 
                x1={x1} y1={y1} 
                x2={x3} y2={y3} 
                className={isMajor ? "engraving-tick-major" : "engraving-tick-minor"} 
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}
