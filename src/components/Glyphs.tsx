/**
 * Control glyphs, drawn in the same fine-line vocabulary as the symbols.
 * All decorative — the buttons that contain them carry accessible names.
 */

const base = {
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false,
  className: 'glyph',
} as const;

export function PlayGlyph() {
  return (
    <svg {...base}>
      <path d="M8.5 6.2v11.6L18 12z" className="glyph-fill" />
    </svg>
  );
}

export function PauseGlyph() {
  return (
    <svg {...base}>
      <path d="M9 6.5v11M15 6.5v11" />
    </svg>
  );
}

export function PrevGlyph() {
  return (
    <svg {...base}>
      <path d="M6.5 6.5v11M18 6.8v10.4L9.6 12z" />
    </svg>
  );
}

export function NextGlyph() {
  return (
    <svg {...base}>
      <path d="M17.5 6.5v11M6 6.8v10.4L14.4 12z" />
    </svg>
  );
}

export function ReturnGlyph() {
  return (
    <svg {...base}>
      <path d="M20 12H4.5M9.5 7l-5 5 5 5" />
    </svg>
  );
}
