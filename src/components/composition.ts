import type { TrackId } from '../data/tracks';

/**
 * Where each observation sits on the canvas. Hand-placed, never random.
 *
 * Two compositions:
 *   wide — landscape plate, 16:10
 *   tall — portrait plate for tablets in portrait and phones
 *
 * x, y   centre of the drawing, in % of the plate's width / height
 * w      drawing width, in % of the plate's width (height follows the
 *        symbol's own proportions)
 * lx, ly where the catalogue label attaches, in % of the drawing's box
 * dir    which way the title unfolds from its number
 */
export interface Placement {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly lx: number;
  readonly ly: number;
  readonly dir: 'e' | 'w';
}

export const PLATE = {
  wide: 1.6, // width / height
  tall: 0.6,
} as const;

export const COMPOSITION: Record<TrackId, { wide: Placement; tall: Placement }> = {
  slowly: {
    wide: { x: 23, y: 37, w: 19.5, lx: 86, ly: 84, dir: 'e' },
    tall: { x: 38, y: 12.5, w: 50, lx: 88, ly: 86, dir: 'e' },
  },
  omale: {
    wide: { x: 48, y: 19, w: 11, lx: 88, ly: 16, dir: 'e' },
    tall: { x: 79, y: 25, w: 27, lx: 14, ly: 92, dir: 'w' },
  },
  dopamine: {
    wide: { x: 62.5, y: 58, w: 12.5, lx: 18, ly: 84, dir: 'w' },
    tall: { x: 27, y: 39, w: 31, lx: 86, ly: 90, dir: 'e' },
  },
  melle: {
    wide: { x: 82, y: 29, w: 20.5, lx: 8, ly: 72, dir: 'w' },
    tall: { x: 68, y: 52, w: 50, lx: 70, ly: 96, dir: 'e' },
  },
  ormakal: {
    wide: { x: 39, y: 75, w: 15, lx: 94, ly: 90, dir: 'e' },
    tall: { x: 33, y: 70, w: 41, lx: 92, ly: 92, dir: 'e' },
  },
  pathiye: {
    wide: { x: 86, y: 73, w: 9.5, lx: 12, ly: 28, dir: 'w' },
    tall: { x: 77, y: 79, w: 25, lx: 12, ly: 30, dir: 'w' },
  },
  ormayil: {
    wide: { x: 49.5, y: 47, w: 8, lx: 60, ly: 93, dir: 'e' },
    tall: { x: 38, y: 91, w: 19, lx: 60, ly: 94, dir: 'e' },
  },
};
