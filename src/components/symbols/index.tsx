import type { TrackId } from '../../data/tracks';
import { symbol01 } from './Symbol01';
import { symbol02 } from './Symbol02';
import { symbol03 } from './Symbol03';
import { symbol04 } from './Symbol04';
import { symbol05 } from './Symbol05';
import { symbol06 } from './Symbol06';
import { symbol07 } from './Symbol07';
import type { SymbolDef } from './types';

/** Each track's abstract visual identity. Purely visual — no implied meaning. */
export const SYMBOLS: Record<TrackId, SymbolDef> = {
  slowly: symbol01,
  omale: symbol02,
  dopamine: symbol03,
  melle: symbol04,
  ormakal: symbol05,
  pathiye: symbol06,
  ormayil: symbol07,
};

/** width / height of a symbol's drawing plate. */
export const symbolRatio = (id: TrackId) => {
  const [, , w, h] = SYMBOLS[id].viewBox;
  return w / h;
};

interface Props {
  id: TrackId;
  className?: string;
}

/** Decorative SVG; the containing control supplies the accessible name. */
export function CelestialSymbol({ id, className }: Props) {
  const { viewBox, Art } = SYMBOLS[id];
  return (
    <svg
      className={className ? `sym ${className}` : 'sym'}
      viewBox={viewBox.join(' ')}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <Art />
    </svg>
  );
}
