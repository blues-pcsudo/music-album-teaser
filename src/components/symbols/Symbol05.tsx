import { arc, fmt, polar, reticle, seg } from './geometry';
import type { SymbolDef } from './types';

/*
 * 05 — Four concentric arcs rising from a common horizon, each stopping
 * earlier than the one inside it. A vertical scale records their radii.
 * A single object is marked beyond the outermost arc; a short dotted arc
 * lies beneath the horizon.
 */

const O = [100, 150] as const;
const RADII = [26, 50, 76, 102] as const;
const ENDS = [360, 334, 302, 256] as const;

const arcs = RADII.map((r, i) => arc(O[0], O[1], r, 180, ENDS[i]));
const endTicks = RADII.map(
  (r, i) => `M${fmt(polar(O[0], O[1], r + 2, ENDS[i]))}L${fmt(polar(O[0], O[1], r + 6, ENDS[i]))}`,
).join('');

const horizon = seg([[18, 150], [206, 150.7]]);
const scale = seg([[O[0], 150], [O[0], 34]]);
const scaleTicks =
  RADII.map((r) => seg([[O[0], O[1] - r], [O[0] + 5, O[1] - r]])).join('') +
  seg([[O[0] - 4, 34], [O[0] + 4, 34]]);

const below = arc(O[0], O[1], 26, 24, 156);
const marked = polar(O[0], O[1], 118, 318);

const construction =
  `M${fmt(O)}L${fmt(polar(O[0], O[1], 108, 213))}` +
  `M${fmt(O)}L${fmt(polar(O[0], O[1], 108, 246))}` +
  `M${fmt(polar(O[0], O[1], 30, 318))}L${fmt(polar(O[0], O[1], 110, 318))}`;

function Art() {
  return (
    <>
      <path className="cn" d={construction} />
      <path className="l2" d={horizon} />
      <path className="l3" d={scale} />
      <path className="l2" d={scaleTicks} />
      <path className="l1" d={arcs[0] + arcs[1] + arcs[2]} />
      <path className="l2" d={arcs[3]} />
      <path className="l2" d={endTicks} />
      <path className="ds" d={below} />
      <circle className="dt" cx={O[0]} cy={O[1]} r={2} />
      <path className="l1" d={reticle(marked[0], marked[1], 2, 6.5)} />
    </>
  );
}

export const symbol05: SymbolDef = { viewBox: [0, 20, 220, 160], Art };
