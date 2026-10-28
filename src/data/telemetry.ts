import { useSyncExternalStore } from 'react';
import { TRACKS, type TrackId } from './tracks';

export interface SignalEvent {
  id: string;
  text: string;
  timestamp: number;
}

export interface TelemetryState {
  /** Total randomized observers logged in the observatory */
  presaveCount: number;
  /** Live active observers currently tuning in (randomized) */
  activeNow: number;
  milestoneTarget: number;
  hasPresaved: boolean;
  /** Randomly assigned Observer ID for this visitor */
  observerNumber: number;
  presavePlatform: 'spotify' | 'apple' | null;
  resonances: Record<TrackId, number>;
  userResonated: Partial<Record<TrackId, boolean>>;
  decryptedTracks: Partial<Record<TrackId, boolean>>;
  currentSignal: SignalEvent;
}

const STORAGE_KEY = 'oduvil_observatory_telemetry_v2';

// Baseline ranges per track — randomized on first load so counts feel organic
const BASE_RESONANCES: Record<TrackId, number> = {
  slowly: 310,
  omale: 390,
  dopamine: 460,
  melle: 295,
  ormakal: 340,
  pathiye: 275,
  ormayil: 355,
};

// Poetic observatory notes & classified transmissions for each track
export interface TrackTransmission {
  catalogCode: string;
  /** Publicly visible poetic coordinate / vibe note */
  fieldNote: string;
  /** Secret lyric fragment or title cipher */
  classifiedText: string;
  /** Label for the classified box */
  classifiedLabel: string;
}

export const TRACK_TRANSMISSIONS: Record<TrackId, TrackTransmission> = {
  slowly: {
    catalogCode: 'OBS-01 // RA 04h 21m',
    fieldNote: 'First light entering the aperture. A slow gravitational pull.',
    classifiedLabel: 'ARCHIVE LYRIC FRAGMENT',
    classifiedText: '“Every orbit starts with a quiet hesitation before the fall…”',
  },
  omale: {
    catalogCode: 'OBS-02 // RA 07h 14m',
    fieldNote: 'Warmth across light-years. Familiar frequencies returning home.',
    classifiedLabel: 'ARCHIVE LYRIC FRAGMENT',
    classifiedText: '“Omale — a signal carried across the stillness between us.”',
  },
  dopamine: {
    catalogCode: 'OBS-03 // RA 11h 48m',
    fieldNote: 'Peak solar flare. High-velocity pulse in the center of the plate.',
    classifiedLabel: 'ARCHIVE STUDIO NOTE',
    classifiedText: '“Recorded at 124 BPM — the brightest burst inside the supernova.”',
  },
  melle: {
    catalogCode: 'OBS-04 // RA 14h 09m',
    fieldNote: 'Soft drift through nebular dust. Weightless and unhurried.',
    classifiedLabel: 'ARCHIVE LYRIC FRAGMENT',
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
    classifiedLabel: 'ARCHIVE LYRIC FRAGMENT',
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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function computeRandomObserverCount(): number {
  // Generate a natural random observer count between 1,180 and 2,460
  return randomInt(1180, 2460);
}

function computeMilestone(count: number): number {
  if (count < 1500) return 1500;
  if (count < 2000) return 2000;
  if (count < 2500) return 2500;
  return Math.ceil((count + 100) / 500) * 500;
}

function generateAmbientSignal(observerCount: number, activeNow: number): SignalEvent {
  const city = CITIES[randomInt(0, CITIES.length - 1)];
  const track = TRACKS[randomInt(0, TRACKS.length - 1)];
  const roll = Math.random();

  let text: string;
  if (roll < 0.45) {
    text = `SIGNAL DETECTED · ${city} · OBSERVING "${track.title.toUpperCase()}"`;
  } else if (roll < 0.78) {
    const randomObs = randomInt(104, observerCount);
    text = `OBSERVER #${randomObs} · TUNED IN FROM ${city}`;
  } else {
    text = `TELEMETRY · ${activeNow} OBSERVERS CURRENTLY ACTIVE IN THE ROOM`;
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
      if (saved.resonances?.[id]) {
        resonances[id] = saved.resonances[id];
      } else {
        // Add random variance (-25 to +85) so counts don't look static or hardcoded
        resonances[id] = BASE_RESONANCES[id] + randomInt(-25, 85);
      }
    }

    const hasPresaved = Boolean(saved.hasPresaved);
    const presaveCount = saved.presaveCount
      ? saved.presaveCount + randomInt(1, 9)
      : computeRandomObserverCount();

    // Assign every visitor a random Observer ID right away
    const observerNumber =
      saved.observerNumber ?? randomInt(Math.max(101, presaveCount - 650), presaveCount);

    const activeNow = randomInt(14, 48);
    const milestoneTarget = computeMilestone(presaveCount);

    this.state = {
      presaveCount,
      activeNow,
      milestoneTarget,
      hasPresaved,
      observerNumber,
      presavePlatform: saved.presavePlatform ?? null,
      resonances,
      userResonated,
      decryptedTracks: saved.decryptedTracks ?? {},
      currentSignal: {
        id: 'init',
        text: `OBSERVATORY ONLINE · ASSIGNED AS OBSERVER #${observerNumber}`,
        timestamp: Date.now(),
      },
    };

    this.persist();

    if (typeof window !== 'undefined') {
      this.startAmbientFeed();
    }
  }

  private startAmbientFeed() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => {
      // Randomly fluctuate active listeners and occasionally bump total observers
      const bumpTotal = Math.random() < 0.35 ? randomInt(1, 3) : 0;
      const nextCount = this.state.presaveCount + bumpTotal;
      const deltaActive = randomInt(-2, 3);
      const nextActive = Math.max(9, Math.min(84, this.state.activeNow + deltaActive));
      const nextSignal = generateAmbientSignal(nextCount, nextActive);

      // Occasionally bump a random track's signal count
      const nextResonances = { ...this.state.resonances };
      if (Math.random() < 0.4) {
        const randomTrack = TRACKS[randomInt(0, TRACKS.length - 1)].id;
        nextResonances[randomTrack] = (nextResonances[randomTrack] ?? 300) + 1;
      }

      this.state = {
        ...this.state,
        presaveCount: nextCount,
        activeNow: nextActive,
        milestoneTarget: computeMilestone(nextCount),
        resonances: nextResonances,
        currentSignal: nextSignal,
      };
      this.persist();
      this.emit();
    }, 5500);
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
          decryptedTracks: this.state.decryptedTracks,
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
    const platformName = platform === 'spotify' ? 'SPOTIFY' : 'APPLE MUSIC';

    this.state = {
      ...this.state,
      hasPresaved: true,
      presaveCount: nextCount,
      milestoneTarget: computeMilestone(nextCount),
      presavePlatform: platform,
      currentSignal: {
        id: `presave-${Date.now()}`,
        text: `OBSERVER #${this.state.observerNumber} · OPENED ${platformName} PRE-RELEASE`,
        timestamp: Date.now(),
      },
    };
    this.persist();
    this.emit();
  };

  decryptTrack = (id: TrackId) => {
    this.state = {
      ...this.state,
      decryptedTracks: {
        ...this.state.decryptedTracks,
        [id]: true,
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
    return this.state.observerNumber;
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
