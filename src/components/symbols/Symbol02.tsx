import { arc, fmt, polar, reticle } from './geometry';
import type { SymbolDef } from './types';

/*
 * 02 — A fragment of a graticule seen from far below its pole: three
 * parallels and three meridians that do not quite agree on where they end,
 * a fourth meridian left unfinished, one marked object and a faint companion.
 * The plate's registration mark sits alone in the lower-left corner.
 */

const P = [110, -160] as const; // pole, outside the plate
const at = (r: number, a: number) => polar(P[0], P[1], r, a);
const ray = (a: number, r0: number, r1: number) => `M${fmt(at(r0, a))}L${fmt(at(r1, a))}`;

const parallels =
  arc(P[0], P[1], 200, 72, 104) + arc(P[0], P[1], 246, 70.5, 106) + arc(P[0], P[1], 300, 73, 103.5);
const meridians = ray(75.5, 188, 312) + ray(88, 192, 318) + ray(101.5, 186, 306);
const unfinished = ray(110, 212, 284);
const outerParallel = arc(P[0], P[1], 334, 78, 98);

const object = at(268, 82);
const companion = at(222, 95.5);

const construction = ray(82, 196, 340) + arc(P[0], P[1], 268, 73.5, 101.5);

function Art() {
  return (
    <>
      <path className="cn" d={construction} />
      <path className="l1" d={parallels} />
      <path className="l2" d={meridians} />
      <path className="l3" d={unfinished} />
      <path className="ds" d={outerParallel} />
      <circle className="l1" cx={object[0]} cy={object[1]} r={5.2} />
      <circle className="dt" cx={object[0]} cy={object[1]} r={1.15} />
      <circle className="dt" cx={companion[0]} cy={companion[1]} r={1.7} />
      <path className="l2" d={reticle(30, 177, 2, 6.5)} />
    </>
  );
}

export const symbol02: SymbolDef = { viewBox: [0, 0, 220, 200], Art };
