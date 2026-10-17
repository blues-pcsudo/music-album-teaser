import { useId } from 'react';
import { arc, fmt, reticle, seg, type Pt } from './geometry';
import type { SymbolDef } from './types';

/*
 * 07 — An occultation. A smaller engraved disc crosses the upper-right limb
 * of a larger body, whose outline breaks exactly where it is covered.
 * A partial halo on the lower-left; a plumb line falls to a small terminal
 * ring, drifting a fraction of a unit as it descends.
 */

const C: Pt = [88, 88];
const R = 52;
const D: Pt = [120, 64];
const RD = 30;

// Visible limb: excluded where the disc covers it (computed from the overlap).
const dist = Math.hypot(D[0] - C[0], D[1] - C[1]);
const phi = (Math.atan2(D[1] - C[1], D[0] - C[0]) * 180) / Math.PI;
const alpha = (Math.acos((dist * dist + R * R - RD * RD) / (2 * dist * R)) * 180) / Math.PI;
const limb = arc(C[0], C[1], R, phi + alpha, phi - alpha + 360);

const halo = arc(C[0], C[1], 63, 104, 196);

// Engraved hatching at 45°, clipped to the disc.
const hatch = (() => {
  const out: string[] = [];
  const u = [Math.SQRT1_2, -Math.SQRT1_2];
  const v = [Math.SQRT1_2, Math.SQRT1_2];
  for (let k = -6; k <= 6; k++) {
    const s = k * 4.6;
    const a: Pt = [D[0] + v[0] * s - u[0] * 34, D[1] + v[1] * s - u[1] * 34];
    const b: Pt = [D[0] + v[0] * s + u[0] * 34, D[1] + v[1] * s + u[1] * 34];
    out.push(`M${fmt(a)}L${fmt(b)}`);
  }
  return out.join('');
})();

const plumb = seg([[C[0], 148], [C[0] + 0.7, 225]], [[C[0] - 6, 225.2], [C[0] + 7.4, 225.2]]);

const ux = (D[0] - C[0]) / dist;
const uy = (D[1] - C[1]) / dist;
const construction = seg([
  [C[0] - ux * 72, C[1] - uy * 72],
  [D[0] + ux * 42, D[1] + uy * 42],
]);

function Art() {
  const clip = `occ${useId().replace(/[^\w-]/g, '')}`;
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx={D[0]} cy={D[1]} r={RD - 0.6} />
        </clipPath>
      </defs>
      <path className="cn" d={construction} />
      <path className="l3" d={halo} />
      <path className="l1" d={limb} />
      <path className="l3" d={hatch} clipPath={`url(#${clip})`} />
      <circle className="l1" cx={D[0]} cy={D[1]} r={RD} />
      <path className="l1" d={reticle(C[0], C[1], 2, 6.5)} />
      <path className="l2" d={plumb} />
      <circle className="l2" cx={C[0] + 0.7} cy={232.4} r={2.6} />
    </>
  );
}

export const symbol07: SymbolDef = { viewBox: [0, 0, 180, 250], Art };
