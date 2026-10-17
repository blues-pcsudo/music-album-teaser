/**
 * ODUVIL — central track configuration.
 *
 * This file is the single source of truth for the seven songs. The canvas,
 * the track index, the listening panel and the audio controller all derive
 * from it. Edit titles, order or sources here only.
 *
 * Audio sources are imported directly from the original files in the project
 * root. Vite serves them in development and copies them (fingerprinted) into
 * `dist/assets` at build time. The originals are never moved or modified.
 *
 * Source inspection (ffprobe, 2026-10-09):
 *   every file — MPEG-1 Layer III, 320 kbps, 48 kHz, stereo.
 *   Embedded tags contain no title/artist/album — only encoder, a date and a
 *   tempo field written by the DAW, so they are not presented as release data.
 *   Filenames end in "tease", so each file is presented as a teaser excerpt.
 */

import slowlySrc from '../../slowly tease.mp3';
import omaleSrc from '../../omale tease.mp3';
import dopamineSrc from '../../dopamine tease.mp3';
import melleSrc from '../../melle tease.mp3';
import ormakalSrc from '../../Ormakal tease.mp3';
import pathiyeSrc from '../../pathiye tease.mp3';
import ormayilSrc from '../../ormayil tease.mp3';

export type TrackId =
  | 'slowly'
  | 'omale'
  | 'dopamine'
  | 'melle'
  | 'ormakal'
  | 'pathiye'
  | 'ormayil';

export const SPOTIFY_PRESAVE_URL =
  'https://open.spotify.com/prerelease/4Lu7GH88hKSOv9nBFhR3mN?si=vM6kXgrGQ9WDF9DWx9sW7A&utm_source=copy-link';

export const APPLE_MUSIC_URL =
  'https://music.apple.com/in/album/oduvil/6821942777';

export const APPLE_MUSIC_ARTIST_URL =
  'https://music.apple.com/in/artist/pina-colada-blues/1511588553';

export interface ExternalLink {
  readonly label: string;
  readonly href: string;
}

export interface Track {
  /** Stable identity. Never derive identity from array position. */
  readonly id: TrackId;
  /** Position in the confirmed running order, 1-based. */
  readonly number: number;
  /** Title exactly as it should be displayed. */
  readonly title: string;
  /**
   * `false` when the full title has not been confirmed. The display title then
   * contains only the confirmed portion. Update `title` and set this to `true`
   * once the complete title is known.
   */
  readonly titleConfirmed: boolean;
  /** Original filename in the project root (for reference only). */
  readonly file: string;
  /** Resolved, deployment-safe URL of the audio file. */
  readonly src: string;
  readonly mime: string;
  /** Measured duration in seconds; replaced at runtime by browser metadata. */
  readonly duration: number;
  /** All supplied files are teaser excerpts (per their filenames). */
  readonly kind: 'teaser';
  /** Authentic cover art, if ever supplied. None exists — do not fabricate. */
  readonly cover?: string;
  /** Authentic listening links, if ever supplied. None exist — do not fabricate. */
  readonly links: readonly ExternalLink[];
}

export const TRACKS: readonly Track[] = [
  {
    id: 'slowly',
    number: 1,
    title: 'Slowly...',
    titleConfirmed: true,
    file: 'slowly tease.mp3',
    src: slowlySrc,
    mime: 'audio/mpeg',
    duration: 22.656,
    kind: 'teaser',
    links: [
      {
        label: 'Spotify Pre-save',
        href: SPOTIFY_PRESAVE_URL,
      },
      {
        label: 'Apple Music',
        href: APPLE_MUSIC_URL,
      },
    ],
  },
  {
    id: 'omale',
    number: 2,
    title: 'Omale.',
    titleConfirmed: true,
    file: 'omale tease.mp3',
    src: omaleSrc,
    mime: 'audio/mpeg',
    duration: 22.2,
    kind: 'teaser',
    links: [
      {
        label: 'Spotify Pre-save',
        href: SPOTIFY_PRESAVE_URL,
      },
      {
        label: 'Apple Music',
        href: APPLE_MUSIC_URL,
      },
    ],
  },
  {
    id: 'dopamine',
    number: 3,
    title: 'Dopamine',
    titleConfirmed: true,
    file: 'dopamine tease.mp3',
    src: dopamineSrc,
    mime: 'audio/mpeg',
    duration: 22.2,
    kind: 'teaser',
    links: [
      {
        label: 'Spotify Pre-save',
        href: SPOTIFY_PRESAVE_URL,
      },
      {
        label: 'Apple Music',
        href: APPLE_MUSIC_URL,
      },
    ],
  },
  {
    id: 'melle',
    number: 4,
    title: 'Melle',
    titleConfirmed: true,
    file: 'melle tease.mp3',
    src: melleSrc,
    mime: 'audio/mpeg',
    duration: 22.2,
    kind: 'teaser',
    links: [
      {
        label: 'Spotify Pre-save',
        href: SPOTIFY_PRESAVE_URL,
      },
      {
        label: 'Apple Music',
        href: APPLE_MUSIC_URL,
      },
    ],
  },
  {
    // The supplied listing reads "Ormakal/Ta..." — the ending is unknown.
    // Only the confirmed portion (also confirmed by the filename) is shown.
    id: 'ormakal',
    number: 5,
    title: 'Ormakal',
    titleConfirmed: false,
    file: 'Ormakal tease.mp3',
    src: ormakalSrc,
    mime: 'audio/mpeg',
    duration: 24.048,
    kind: 'teaser',
    links: [
      {
        label: 'Spotify Pre-save',
        href: SPOTIFY_PRESAVE_URL,
      },
      {
        label: 'Apple Music',
        href: APPLE_MUSIC_URL,
      },
    ],
  },
  {
    // The supplied listing reads "Pathiye/Fa..." — the ending is unknown.
    // Only the confirmed portion (also confirmed by the filename) is shown.
    id: 'pathiye',
    number: 6,
    title: 'Pathiye',
    titleConfirmed: false,
    file: 'pathiye tease.mp3',
    src: pathiyeSrc,
    mime: 'audio/mpeg',
    duration: 22.2,
    kind: 'teaser',
    links: [
      {
        label: 'Spotify Pre-save',
        href: SPOTIFY_PRESAVE_URL,
      },
      {
        label: 'Apple Music',
        href: APPLE_MUSIC_URL,
      },
    ],
  },
  {
    id: 'ormayil',
    number: 7,
    title: 'Ormayil',
    titleConfirmed: true,
    file: 'ormayil tease.mp3',
    src: ormayilSrc,
    mime: 'audio/mpeg',
    duration: 22.2,
    kind: 'teaser',
    links: [
      {
        label: 'Spotify Pre-save',
        href: SPOTIFY_PRESAVE_URL,
      },
      {
        label: 'Apple Music',
        href: APPLE_MUSIC_URL,
      },
    ],
  },
];

const BY_ID = new Map<TrackId, Track>(TRACKS.map((t) => [t.id, t]));

export function getTrack(id: TrackId): Track {
  const track = BY_ID.get(id);
  if (!track) throw new Error(`Unknown track: ${id}`);
  return track;
}

/** Previous track in running order, or `null` at the first track. */
export function getPrevious(id: TrackId): Track | null {
  const i = TRACKS.findIndex((t) => t.id === id);
  return i > 0 ? TRACKS[i - 1] : null;
}

/** Next track in running order, or `null` at the last track. */
export function getNext(id: TrackId): Track | null {
  const i = TRACKS.findIndex((t) => t.id === id);
  return i >= 0 && i < TRACKS.length - 1 ? TRACKS[i + 1] : null;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Catalogue-style time, e.g. 00:22. */
export function formatTime(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '--:--';
  const s = Math.floor(seconds);
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

/** Spoken time for assistive technology, e.g. "22 seconds". */
export function spokenTime(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return 'unknown';
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  const parts: string[] = [];
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`);
  parts.push(`${r} second${r === 1 ? '' : 's'}`);
  return parts.join(' ');
}
