import { arc, fmt, reticle, seg, type Pt } from './geometry';
import type { SymbolDef } from './types';

/*
 * 03 — Three bodies of diminishing size strung along one descending axis.
 * The first two overlap; the third stops two units short of the second.
 * Construction reveals the two outer tangents that bind the first and last.
 */

const C1: Pt = [66, 66];
const C2: Pt = [100, 106];
const C3: Pt = [126, 136.6];
const R1 = 40;
const R2 = 25;
const R3 = 13;

const AX = [34 / 52.49, 40 / 52.49] as const; // unit vector along the axis
const N = [-AX[1], AX[0]] as const; // perpendicular

const along = (p: Pt, t: number): Pt => [p[0] + AX[0] * t, p[1] + AX[1] * t];
const across = (p: Pt, t: number): Pt => [p[0] + N[0] * t, p[1] + N[1] * t];

const axis = seg([along(C1, -58), along(C3, 66)]);
const crossTicks = seg([across(C2, -5), across(C2, 5)], [across(C3, -4.5), across(C3, 4.5)]);
const axisDeg = (Math.atan2(AX[1], AX[0]) * 180) / Math.PI;
const centreMark = reticle(C1[0], C1[1], 2, 6.5, axisDeg);
const outerArc = arc(C1[0], C1[1], 49, 128, 236);

// External tangents of circles 1 and 3 (construction).
function tangents(): string {
  const d = Math.hypot(C3[0] - C1[0], C3[1] - C1[1]);
  const phi = Math.atan2(C3[1] - C1[1], C3[0] - C1[0]);
  const beta = Math.acos((R1 - R3) / d);
  return [1, -1]
    .map((s) => {
      const k = [Math.cos(phi + s * beta), Math.sin(phi + s * beta)];
      const a: Pt = [C1[0] + R1 * k[0], C1[1] + R1 * k[1]];
      const b: Pt = [C3[0] + R3 * k[0], C3[1] + R3 * k[1]];
      return `M${fmt(a)}L${fmt(b)}`;
    })
    .join('');
}
const construction = tangents();

function Art() {
  return (
    <>
      <path className="cn" d={construction} />
      <path className="l3" d={axis} />
      <path className="l3" d={outerArc} />
      <circle className="l1" cx={C1[0]} cy={C1[1]} r={R1} />
      <circle className="l1" cx={C2[0]} cy={C2[1]} r={R2} />
      <circle className="l2" cx={C3[0]} cy={C3[1]} r={R3} />
      <path className="l2" d={crossTicks} />
      <path className="l1" d={centreMark} />
      <circle className="dt" cx={C3[0]} cy={C3[1]} r={1.6} />
    </>
  );
}

export const symbol03: SymbolDef = { viewBox: [0, 0, 200, 220], Art };
