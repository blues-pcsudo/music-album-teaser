import { useEffect, useRef } from 'react';

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Array<{ x: number, y: number, radius: number, alpha: number, speed: number, maxAlpha: number, phase: number }> = [];

    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      burnoutTime: number;
      frames: number;
    }
    let shootingStars: ShootingStar[] = [];

    const isSmall = () => window.innerWidth < 768;
    // Phones report DPR 3; a canvas that dense is expensive to clear and
    // composite every frame. Capping it is visually indistinguishable for tiny stars.
    const getDpr = () => Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 2);

    let width = 0;
    let height = 0;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => { prefersReducedMotion = e.matches; };
    motionQuery.addEventListener?.('change', onMotionChange);

    const resize = () => {
      const newW = window.innerWidth;
      // Mobile browsers fire `resize` when the URL bar shows/hides during
      // scroll. Size the canvas to the largest height seen so we never have
      // to reallocate (and regenerate the stars) mid-scroll.
      const newH = Math.max(window.innerHeight, window.screen?.height || 0);
      if (newW === width && newH <= height) return;
      width = newW;
      height = Math.max(newH, height);

      const dpr = getDpr();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.height = `${height}px`;
      // setTransform (not scale) so repeated resizes don't compound.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const initStars = () => {
      stars = [];
      shootingStars = [];
      const numStars = isSmall() ? 110 : 400; // Reduce on mobile
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.1, // Subtle, tiny stars
          alpha: Math.random(),
          maxAlpha: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.02 + 0.005, // Twinkle speed
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Twinkling is slow; 30fps is plenty on phones and halves the work.
    const frameInterval = isSmall() ? 1000 / 30 : 0;
    let lastFrame = 0;

    const draw = (now: number = 0) => {
      animationFrameId = requestAnimationFrame(draw);
      if (document.hidden) return;
      if (frameInterval && now - lastFrame < frameInterval) return;
      // Keep the twinkle speed consistent regardless of the frame rate.
      const step = frameInterval ? 2 : 1;
      lastFrame = now;

      // Clear with absolute minimal trail to prevent blurring
      ctx.clearRect(0, 0, width, height);

      // Draw background stars
      ctx.fillStyle = 'rgb(233, 226, 212)'; // Warm white / ivory glow (matching ODUVIL brand)
      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.phase += star.speed * step;
          star.alpha = Math.abs(Math.sin(star.phase)) * star.maxAlpha;
        } else {
          star.alpha = star.maxAlpha * 0.7; // Static state
        }

        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Handle shooting stars
      if (!prefersReducedMotion) {
        // Very rare spawn rate (approx once every 8 seconds at 60fps)
        if (Math.random() < 0.002 * step) {
          shootingStars.push({
            x: Math.random() * width + (width * 0.2), // Start slightly off-screen right
            y: (Math.random() * height * 0.5) - 100, // Mostly upper half
            length: Math.random() * 150 + 150, // 150-300px long
            speed: Math.random() * 15 + 15, // 15-30px per frame (fast & smooth)
            angle: (Math.PI / 4) + (Math.random() * 0.1 - 0.05), // ~45 deg down-left
            opacity: 0,
            burnoutTime: Math.random() * 50 + 50, // Lasts ~1-2 seconds
            frames: 0
          });
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          s.x -= Math.cos(s.angle) * s.speed * step;
          s.y += Math.sin(s.angle) * s.speed * step;
          s.frames += step;

          // Smooth fade in and out (burnout)
          if (s.frames < 10) {
            s.opacity = s.frames / 10;
          } else if (s.frames > s.burnoutTime - 20) {
            s.opacity = Math.max(0, (s.burnoutTime - s.frames) / 20);
          } else {
            s.opacity = 1;
          }

          // Remove dead stars
          if (s.opacity <= 0 || s.x < -s.length || s.y > height + s.length) {
            shootingStars.splice(i, 1);
            continue;
          }

          // Draw the smooth gradient tail
          const tailX = s.x + Math.cos(s.angle) * s.length;
          const tailY = s.y - Math.sin(s.angle) * s.length;

          const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
          gradient.addColorStop(1, `rgba(233, 226, 212, 0)`);

          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      motionQuery.removeEventListener?.('change', onMotionChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        pointerEvents: 'none',
        zIndex: -1, // Keep behind everything
        opacity: 0.8
      }}
    />
  );
}

