import { fmt, parabola, reticle, seg, type Pt } from './geometry';
import type { SymbolDef } from './types';

/*
 * 06 — An open trajectory around a focus. Graduations along the upper
 * branch tighten as the path approaches its nearest point; a small body on
 * the lower branch trails a short line pointing away from the focus.
 * Construction shows the defining equality: focus distance = directrix distance.
 */

const H = 60; // vertex x
const K = 120; // axis y
const F_LEN = 22; // focal length
const F: Pt = [H + F_LEN, K];
const DIRECTRIX = H - F_LEN;

const xAt = (y: number) => H + ((y - K) * (y - K)) / (4 * F_LEN);
const slope = (y: number) => (2 * (y - K)) / (4 * F_LEN);

const path = parabola(H, K, F_LEN, 26, 226);

const GRAD = [40, 57, 72, 85, 96, 105, 112.5];
const graduations = GRAD.map((y, i) => {
  const p: Pt = [xAt(y), y];
  const m = slope(y);
  const len = Math.hypot(1, m);
  const n = [-1 / len, m / len]; // outward normal
  const l0 = 2.5;
  const l1 = i % 3 === 0 ? 9 : 5.5;
  return `M${fmt([p[0] + n[0] * l0, p[1] + n[1] * l0])}L${fmt([p[0] + n[0] * l1, p[1] + n[1] * l1])}`;
}).join('');

const BY = 152;
const body: Pt = [xAt(BY), BY];
const away = [body[0] - F[0], body[1] - F[1]];
const awayLen = Math.hypot(away[0], away[1]);
const tail = seg([
  [body[0] + (away[0] / awayLen) * 5, body[1] + (away[1] / awayLen) * 5],
  [body[0] + (away[0] / awayLen) * 17, body[1] + (away[1] / awayLen) * 17],
]);

const directrix = seg([[DIRECTRIX, 66], [DIRECTRIX, 181]], [[DIRECTRIX - 3, 66], [DIRECTRIX + 3, 66]]);
const axis = seg([[H + 7, K], [194, K]]);

const construction = seg([body, F], [body, [DIRECTRIX, BY]]);

function Art() {
  return (
    <>
      <path className="cn" d={construction} />
      <path className="l3" d={directrix} />
      <path className="l3" d={axis} />
      <path className="l1" d={path} />
      <path className="l2" d={graduations} />
      <circle className="l2" cx={F[0]} cy={F[1]} r={9} />
      <path className="l1" d={reticle(F[0], F[1], 2, 5.5)} />
      <path className="l2" d={tail} />
      <circle className="dt" cx={body[0]} cy={body[1]} r={2.4} />
    </>
  );
}

export const symbol06: SymbolDef = { viewBox: [0, 0, 200, 240], Art };
