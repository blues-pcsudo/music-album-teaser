import type { ComponentType } from 'react';

/**
 * Stroke vocabulary shared by all seven symbols (styled in symbols.css):
 *   l1 — primary line          l2 — secondary line
 *   l3 — faint annotation      dt — filled point
 *   ds — static dotted line    cn — construction line, revealed on
 *                                   hover / focus / selection only
 */
export interface SymbolDef {
  /** min-x, min-y, width, height */
  readonly viewBox: readonly [number, number, number, number];
  readonly Art: ComponentType;
}
