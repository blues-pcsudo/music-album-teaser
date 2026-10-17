import { useSyncExternalStore } from 'react';
import { TRACKS, type TrackId } from './tracks';

export interface SignalEvent {
  id: string;
  text: string;
  timestamp: number;
}

export interface TelemetryState {
  presaveCount: number;
  milestoneTarget: number;
  hasPresaved: boolean;
  observerNumber: number | null;
  presavePlatform: 'spotify' | 'apple' | null;
  resonances: Record<TrackId, number>;
  userResonated: Partial<Record<TrackId, boolean>>;
  currentSignal: SignalEvent;
}

const STORAGE_KEY = 'oduvil_observatory_telemetry_v1';

// Baseline counts per track so the teaser site feels active from day one
const BASE_RESONANCES: Record<TrackId, number> = {
  slowly: 312,
  omale: 389,
  dopamine: 464,
  melle: 298,
  ormakal: 341,
  pathiye: 276,
  ormayil: 354,
};

// Poetic observatory notes & classified transmissions for each track
export interface TrackTransmission {
   catalogCode: string;
  /** Publicly visible poetic coordinate / vibe note */
  fieldNote: string;
  /** Secret lyric fragment or title cipher unlocked after Pre-Save */
  classifiedText: string;
  /** Label for the classified box */
  classifiedLabel: string;
}

export const TRACK_TRANSMISSIONS: Record<TrackId, TrackTransmission> = {
  slowly: {
    catalogCode: 'OBS-01 // RA 04h 21m',
    fieldNote: 'First light entering the aperture. A slow gravitational pull.',
    classifiedLabel: 'DECRYPTED LYRIC FRAGMENT',
    classifiedText: '“Every orbit starts with a quiet hesitation before the fall…”',
  },
  omale: {
    catalogCode: 'OBS-02 // RA 07h 14m',
    fieldNote: 'Warmth across light-years. Familiar frequencies returning home.',
    classifiedLabel: 'DECRYPTED LYRIC FRAGMENT',
    classifiedText: '“Omale — a signal carried across the stillness between us.”',
  },
  dopamine: {
    catalogCode: 'OBS-03 // RA 11h 48m',
    fieldNote: 'Peak solar flare. High-velocity pulse in the center of the plate.',
    classifiedLabel: 'DECRYPTED STUDIO NOTE',
    classifiedText: '“Recorded at 124 BPM — the brightest burst inside the supernova.”',
  },
  melle: {
    catalogCode: 'OBS-04 // RA 14h 09m',
    fieldNote: 'Soft drift through nebular dust. Weightless and unhurried.',
    classifiedLabel: 'DECRYPTED LYRIC FRAGMENT',
    classifiedText: '“Melle, let the night fold around what we could not say aloud.”',
  },
  ormakal: {
    catalogCode: 'OBS-05 // CLASSIFIED ARCHIVE',
    fieldNote: 'Unconfirmed dual-star designation. Title archive partially redacted.',
    classifiedLabel: 'REDACTED TITLE ARCHIVE [05]',
    classifiedText: 'ARCHIVE CIPHER: “Ormakal / Ta…” — Two memories colliding in the same frame.',
  },
  pathiye: {
    catalogCode: 'OBS-06 // CLASSIFIED ARCHIVE',
    fieldNote: 'Unconfirmed trajectory. Second half of the designation remains locked.',
    classifiedLabel: 'REDACTED TITLE ARCHIVE [06]',
    classifiedText: 'ARCHIVE CIPHER: “Pathiye / Fa…” — Fading slowly into the horizon line.',
  },
  ormayil: {
    catalogCode: 'OBS-07 // RA 22h 59m',
    fieldNote: 'Final afterglow of the supernova. Everything that stays behind.',
    classifiedLabel: 'DECRYPTED LYRIC FRAGMENT',
    classifiedText: '“In the memory that outlives the star — Oduvil, finally.”',
  },
};

const CITIES = [
  'KOCHI',
  'TRIVANDRUM',
  'BANGALORE',
  'CHENNAI',
  'MUMBAI',
  'DUBAI',
  'LONDON',
  'CALICUT',
  'DELHI',
  'TORONTO',
];

function computeBasePresaves(): number {
  // Deterministic gentle growth based on time so the counter feels alive
  const anchor = new Date('2026-10-09T00:00:00Z').getTime();
  const now = Date.now();
  const elapsedHours = Math.max(0, Math.floor((now - anchor) / (1000 * 60 * 20)));
  return 1412 + (elapsedHours % 75);
}

function generateAmbientSignal(presaveCount: number): SignalEvent {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const track = TRACKS[Math.floor(Math.random() * TRACKS.length)];
  const roll = Math.random();

  let text: string;
  if (roll < 0.42) {
    text = `SIGNAL DETECTED · ${city} · OBSERVING "${track.title.toUpperCase()}"`;
  } else if (roll < 0.78) {
    const obsNum = presaveCount - Math.floor(Math.random() * 6);
    const platform = Math.random() > 0.35 ? 'SPOTIFY' : 'APPLE MUSIC';
    text = `OBSERVER #${obsNum} · PRE-SAVED ON ${platform}`;
  } else {
    text = `RESONANCE PULSE · ${city} · +1 SIGNAL ON ${track.number.toString().padStart(2, '0')} ${track.title.toUpperCase()}`;
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    timestamp: Date.now(),
  };
}

class TelemetryStore {
  private state: TelemetryState;
  private listeners = new Set<() => void>();
  private intervalId: number | null = null;

  constructor() {
    const basePresaves = computeBasePresaves();
    let saved: Partial<TelemetryState> = {};

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        saved = JSON.parse(raw);
      }
    } catch {
      // Ignore storage errors
    }

    const userResonated = saved.userResonated ?? {};
    const resonances = { ...BASE_RESONANCES };
    for (const id of Object.keys(resonances) as TrackId[]) {
      if (saved.resonances?.[id] && saved.resonances[id] > resonances[id]) {
        resonances[id] = saved.resonances[id];
      } else if (userResonated[id]) {
        resonances[id] += 1;
      }
    }

    const hasPresaved = Boolean(saved.hasPresaved);
    const presaveCount = Math.max(
      basePresaves + (hasPresaved ? 1 : 0),
      saved.presaveCount ?? 0
    );

    const milestoneTarget = presaveCount >= 1500 ? 2000 : 1500;

    this.state = {
      presaveCount,
      milestoneTarget,
      hasPresaved,
      observerNumber: saved.observerNumber ?? null,
      presavePlatform: saved.presavePlatform ?? null,
      resonances,
      userResonated,
      currentSignal: {
        id: 'init',
        text: `OBSERVATORY ONLINE · ${presaveCount.toLocaleString()} OBSERVERS LOGGED`,
        timestamp: Date.now(),
      },
    };

    if (typeof window !== 'undefined') {
      this.startAmbientFeed();
    }
  }

  private startAmbientFeed() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => {
      // Occasionally increment ambient pre-save or resonance to keep the room alive
      const bumpPresave = Math.random() < 0.22;
      const nextCount = bumpPresave ? this.state.presaveCount + 1 : this.state.presaveCount;
      const nextSignal = generateAmbientSignal(nextCount);

      this.state = {
        ...this.state,
        presaveCount: nextCount,
        milestoneTarget: nextCount >= 1500 ? 2000 : 1500,
        currentSignal: nextSignal,
      };
      this.persist();
      this.emit();
    }, 6500);
  }

  private persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          presaveCount: this.state.presaveCount,
          hasPresaved: this.state.hasPresaved,
          observerNumber: this.state.observerNumber,
          presavePlatform: this.state.presavePlatform,
          resonances: this.state.resonances,
          userResonated: this.state.userResonated,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  getState = (): TelemetryState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  recordPresave = (platform: 'spotify' | 'apple') => {
    const already = this.state.hasPresaved;
    const nextCount = already ? this.state.presaveCount : this.state.presaveCount + 1;
    const observerNumber = this.state.observerNumber ?? nextCount;
    const platformName = platform === 'spotify' ? 'SPOTIFY' : 'APPLE MUSIC';

    this.state = {
      ...this.state,
      hasPresaved: true,
      presaveCount: nextCount,
      milestoneTarget: nextCount >= 1500 ? 2000 : 1500,
      observerNumber,
      presavePlatform: platform,
      currentSignal: {
        id: `presave-${Date.now()}`,
        text: `YOU ARE LOGGED AS OBSERVER #${observerNumber} · ${platformName} PRE-SAVE CONFIRMED`,
        timestamp: Date.now(),
      },
    };
    this.persist();
    this.emit();
  };

  toggleResonance = (id: TrackId) => {
    const currently = Boolean(this.state.userResonated[id]);
    const currentCount = this.state.resonances[id] ?? 300;
    const nextCount = currently ? Math.max(0, currentCount - 1) : currentCount + 1;
    const track = TRACKS.find((t) => t.id === id);

    this.state = {
      ...this.state,
      resonances: {
        ...this.state.resonances,
        [id]: nextCount,
      },
      userResonated: {
        ...this.state.userResonated,
        [id]: !currently,
      },
      currentSignal: !currently
        ? {
            id: `res-${Date.now()}`,
            text: `SIGNAL TRANSMITTED · "${track?.title.toUpperCase()}" RESONANCE AT ${nextCount}`,
            timestamp: Date.now(),
          }
        : this.state.currentSignal,
    };
    this.persist();
    this.emit();
  };

  ensureObserverNumber = (): number => {
    if (this.state.observerNumber) return this.state.observerNumber;
    const num = this.state.presaveCount + 1;
    this.state = {
      ...this.state,
      observerNumber: num,
    };
    this.persist();
    this.emit();
    return num;
  };
}

export const telemetry = new TelemetryStore();

export function useTelemetry<T>(selector: (state: TelemetryState) => T): T {
  return useSyncExternalStore(
    telemetry.subscribe,
    () => selector(telemetry.getState()),
    () => selector(telemetry.getState())
  );
}

export function getMostObservedTrackId(resonances: Record<TrackId, number>): TrackId {
  let bestId: TrackId = 'dopamine';
  let bestVal = -1;
  for (const [id, val] of Object.entries(resonances) as [TrackId, number][]) {
    if (val > bestVal) {
      bestVal = val;
      bestId = id;
    }
  }
  return bestId;
}
