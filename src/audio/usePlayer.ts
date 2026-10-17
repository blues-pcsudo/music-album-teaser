import { useEffect, useSyncExternalStore, type RefObject } from 'react';
import { player, type PlayerState } from './player';

/** Subscribe to one slice of player state; re-renders only when it changes. */
export function usePlayer<T>(select: (s: PlayerState) => T): T {
  return useSyncExternalStore(
    player.subscribe,
    () => select(player.getState()),
    () => select(player.getState()),
  );
}

/** Whole seconds elapsed — re-renders at most once per second. */
export function usePlaybackSeconds(): number {
  return useSyncExternalStore(
    player.subscribeTime,
    () => Math.floor(player.currentTime),
    () => 0,
  );
}

/**
 * Drives a CSS custom property (`--progress`, 0–1) on an element at display
 * rate while playing, without rendering React. Falls back to low-frequency
 * time events when paused (seeks, source changes).
 */
export function useProgressVar(ref: RefObject<HTMLElement | null>, onFrame?: (t: number) => void) {
  const status = usePlayer((s) => s.status);
  const duration = usePlayer((s) => s.duration);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = () => {
      const t = player.currentTime;
      const p = duration && duration > 0 ? Math.min(1, t / duration) : 0;
      el.style.setProperty('--progress', p.toFixed(5));
      onFrame?.(t);
    };
    write();
    const unsubscribe = player.subscribeTime(write);
    let raf = 0;
    if (status === 'playing') {
      const loop = () => {
        write();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [ref, status, duration, onFrame]);
}
