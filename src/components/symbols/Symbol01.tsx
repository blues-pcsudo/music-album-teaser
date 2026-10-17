import { arc, fmt, polar, radialTicks, reticle, seg } from './geometry';
import type { SymbolDef } from './types';

/*
 * 01 — An open circle with an eccentric inner circle nearly touching its
 * lower wall, a long horizontal axis entering from the west, and a measured
 * run of divisions on the upper-left shoulder. The pen lifts at the top-right
 * and restarts a fraction further out.
 */

const C = [140, 100] as const;
const R = 62;
const OPEN_A0 = -38;
const OPEN_A1 = 298;
const endDot = polar(C[0], C[1], R, OPEN_A0);

const outer = arc(C[0], C[1], R, OPEN_A0, OPEN_A1);
const restart = arc(C[0], C[1], R + 1.3, 305, 316);
const ticks = radialTicks(
  C[0],
  C[1],
  R + 3.5,
  [198, 204, 210, 216, 222, 228, 234, 240, 246, 252],
  (i) => (i % 3 === 0 ? 7.5 : 3.6),
);
// Axis drifts by just over a degree between its far end and the centre.
const axis = seg([[17, 101.4], [134, 100]]);
const cap = seg([[17, 97.4], [17, 105.4]]);
const centre = reticle(C[0], C[1], 2, 6.5);

const construction =
  seg([[C[0], 30], [C[0], 170]]) + `M${fmt(C)}L${fmt(endDot)}`;

function Art() {
  return (
    <>
      <path className="cn" d={construction} />
      <path className="l1" d={outer} />
      <path className="l2" d={restart} />
      <circle className="l2" cx={C[0]} cy={129} r={31} />
      <path className="l2" d={axis + cap} />
      <path className="l2" d={ticks} />
      <path className="l1" d={centre} />
      <circle className="dt" cx={endDot[0]} cy={endDot[1]} r={2.1} />
    </>
  );
}

export const symbol01: SymbolDef = { viewBox: [0, 0, 240, 200], Art };
