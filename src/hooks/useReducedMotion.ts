import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const mql = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(QUERY) : null);

export const prefersReducedMotion = () => mql()?.matches ?? false;

function subscribe(cb: () => void) {
  const m = mql();
  m?.addEventListener('change', cb);
  return () => m?.removeEventListener('change', cb);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
