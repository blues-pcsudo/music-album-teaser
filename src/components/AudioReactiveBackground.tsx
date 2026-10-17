import { useEffect, useRef } from 'react';
import '../styles/reactive.css';

interface Props {
  active: boolean;
}

export function AudioReactiveBackground({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Do not run a 60fps loop when audio isn't playing
    if (!active) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationId: number;
    let time = 0;

    const resize = () => {
      const isSmall = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1 : 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // We will render two massive, incredibly soft radial gradients
    // that slowly orbit each other and breathe in opacity.
    const draw = () => {
      animationId = requestAnimationFrame(draw);
      if (document.hidden) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Slow down time for extreme elegance
      time += 0.005;
      
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.max(w, h) * 0.8; // Huge spread

      ctx.globalCompositeOperation = 'screen';

      // Base opacity throbs very subtly between 0.04 and 0.08
      const baseOpacity = (Math.sin(time * 1.5) * 0.5 + 0.5) * 0.04 + 0.04;

      // Orb 1: Upper left, sweeping slowly
      const x1 = cx + Math.cos(time) * (w * 0.2);
      const y1 = cy + Math.sin(time * 0.8) * (h * 0.2);
      
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, maxRadius);
      g1.addColorStop(0, `rgba(233, 226, 212, ${baseOpacity * 1.2})`);
      g1.addColorStop(1, 'rgba(233, 226, 212, 0)');
      
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Orb 2: Lower right, sweeping in opposite phase
      const x2 = cx + Math.cos(time + Math.PI) * (w * 0.25);
      const y2 = cy + Math.sin(time * 1.2 + Math.PI) * (h * 0.25);
      
      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, maxRadius * 0.9);
      g2.addColorStop(0, `rgba(233, 226, 212, ${baseOpacity})`);
      g2.addColorStop(1, 'rgba(233, 226, 212, 0)');
      
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);
    };

    window.addEventListener('resize', resize);
    resize();
    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className={`audio-reactive-bg ${active ? 'is-active' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1, // Keep it strictly behind the interactive elements
        width: '100vw',
        height: '100vh',
        opacity: active ? 1 : 0,
        transition: 'opacity 3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    />
  );
}
