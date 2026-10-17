import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The seven original MP3s live in the project root and are imported from
 * `src/data/tracks.ts`. Vite serves them as-is in development and emits
 * fingerprinted copies into `dist/assets` on build — the originals are never
 * moved, renamed or re-encoded.
 *
 * `base: './'` keeps every asset reference relative, so the build works from
 * any sub-path or static host.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    // Never inline audio into the JS bundle.
    assetsInlineLimit: (file) => (/\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(file) ? false : undefined),
    rollupOptions: {
      output: {
        // Spaces in the original filenames are replaced in the *emitted copy*
        // only, giving clean URLs on every static host.
        assetFileNames: (info: any) => {
          const name = (info.names?.[0] ?? 'asset').replace(/\.[^.]+$/, '');
          const safe = name.trim().replace(/\s+/g, '-').replace(/[^\w.-]/g, '').toLowerCase();
          return `assets/${safe || 'asset'}-[hash][extname]`;
        },
      },
    },
  },
});
