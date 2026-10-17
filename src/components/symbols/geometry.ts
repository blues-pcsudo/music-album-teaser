/**
 * Small drafting helpers for the celestial symbols.
 *
 * Angles are in degrees, measured clockwise from east (SVG's y-down space),
 * so 270° points straight up. Every symbol is authored by hand with explicit
 * coordinates — these helpers only turn measured intentions into path data.
 * Nothing here is random.
 */

export type Pt = readonly [number, number];

const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;

export const polar = (cx: number, cy: number, r: number, deg: number): Pt => [
  cx + r * Math.cos(rad(deg)),
  cy + r * Math.sin(rad(deg)),
];

export const fmt = ([x, y]: Pt) => `${r2(x)} ${r2(y)}`;

/** Straight segment(s). Accepts pairs of points. */
export function seg(...pairs: [Pt, Pt][]): string {
  return pairs.map(([a, b]) => `M${fmt(a)}L${fmt(b)}`).join('');
}

/** Circular arc drawn clockwise from a0 to a1 (a1 > a0). */
export function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${fmt(p0)}A${r2(r)} ${r2(r)} 0 ${large} 1 ${fmt(p1)}`;
}

/** Radial ticks on a circle: each angle gets a tick from r0 to r0 + len. */
export function radialTicks(
  cx: number,
  cy: number,
  r0: number,
  angles: readonly number[],
  len: (i: number) => number,
): string {
  return angles
    .map((a, i) => `M${fmt(polar(cx, cy, r0, a))}L${fmt(polar(cx, cy, r0 + len(i), a))}`)
    .join('');
}

/** Point on a rotated ellipse at parametric angle t. */
export function ellipsePt(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  t: number,
): Pt {
  const ct = Math.cos(rad(t));
  const st = Math.sin(rad(t));
  const cr = Math.cos(rad(rot));
  const sr = Math.sin(rad(rot));
  const x = rx * ct;
  const y = ry * st;
  return [cx + x * cr - y * sr, cy + x * sr + y * cr];
}

/** Elliptical arc between parametric angles t0 → t1 (t1 > t0). */
export function ellipseArc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  t0: number,
  t1: number,
): string {
  const p0 = ellipsePt(cx, cy, rx, ry, rot, t0);
  const p1 = ellipsePt(cx, cy, rx, ry, rot, t1);
  const large = t1 - t0 > 180 ? 1 : 0;
  return `M${fmt(p0)}A${r2(rx)} ${r2(ry)} ${r2(rot)} ${large} 1 ${fmt(p1)}`;
}

/**
 * The family reticle: four short arms around a point, with an open centre.
 * Every symbol carries exactly one, in a different role.
 */
export function reticle(cx: number, cy: number, inner = 2, outer = 6, rot = 0): string {
  return [0, 90, 180, 270]
    .map((a) => `M${fmt(polar(cx, cy, inner, a + rot))}L${fmt(polar(cx, cy, outer, a + rot))}`)
    .join('');
}

/**
 * Exact quadratic Bézier for the parabola x = h + (y - k)² / (4f),
 * between y0 and y1.
 */
export function parabola(h: number, k: number, f: number, y0: number, y1: number): string {
  const x = (y: number) => h + ((y - k) * (y - k)) / (4 * f);
  const dx = (y: number) => (2 * (y - k)) / (4 * f);
  const yc = (y0 + y1) / 2;
  const xc = x(y0) + dx(y0) * (yc - y0);
  return `M${fmt([x(y0), y0])}Q${fmt([xc, yc])} ${fmt([x(y1), y1])}`;
}
