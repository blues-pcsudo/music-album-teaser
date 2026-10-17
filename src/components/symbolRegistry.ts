import type { TrackId } from '../data/tracks';

/**
 * The canvas registers each symbol's drawing element here so the listening
 * panel can measure where a symbol lives (for the open/close transition) and
 * return keyboard focus to it on close.
 */
interface Entry {
  button: HTMLButtonElement;
  art: HTMLElement;
}

const entries = new Map<TrackId, Entry>();

export const symbolRegistry = {
  set(id: TrackId, entry: Entry | null) {
    if (entry) entries.set(id, entry);
    else entries.delete(id);
  },
  get(id: TrackId): Entry | undefined {
    return entries.get(id);
  },
};
