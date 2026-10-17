import { ellipseArc, ellipsePt, fmt, reticle } from './geometry';
import type { SymbolDef } from './types';

/*
 * 04 — A long, inclined orbit. One open body travels it, trailed by three
 * recorded positions; a single point sits on the far side. Only the eastern
 * reach of a wider orbit is drawn. Construction shows the two axes.
 */

const CX = 140;
const CY = 80;
const RX = 120;
const RY = 33;
const ROT = -11;

const on = (t: number, grow = 0) => ellipsePt(CX, CY, RX + grow, RY + grow, ROT, t);
const body = on(198);
const point = on(36);
const trail = [207, 215, 222]
  .map((t) => `M${fmt(on(t, 2.5))}L${fmt(on(t, 6.5))}`)
  .join('');

const outerReach = ellipseArc(CX, CY, 131, 43, ROT, -62, 27);

const construction =
  `M${fmt(on(0))}L${fmt(on(180))}` + `M${fmt(on(90))}L${fmt(on(270))}`;

function Art() {
  return (
    <>
      <path className="cn" d={construction} />
      <ellipse
        className="l1"
        cx={CX}
        cy={CY}
        rx={RX}
        ry={RY}
        transform={`rotate(${ROT} ${CX} ${CY})`}
      />
      <path className="l3" d={outerReach} />
      <circle className="l2" cx={CX} cy={CY} r={12} />
      <path className="l1" d={reticle(CX, CY, 2, 6, ROT)} />
      <circle className="l1 solid-bg" cx={body[0]} cy={body[1]} r={4.6} />
      <path className="l2" d={trail} />
      <circle className="dt" cx={point[0]} cy={point[1]} r={1.9} />
    </>
  );
}

export const symbol04: SymbolDef = { viewBox: [0, 0, 280, 160], Art };
