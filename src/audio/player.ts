/**
 * The single playback controller.
 *
 * One HTMLAudioElement for the whole site, owned by a module-level store, so
 * playback survives any component mounting/unmounting and two tracks can
 * never sound at once. React subscribes through `useSyncExternalStore`
 * (see usePlayer.ts); the per-frame playhead is read directly from the
 * element and never pushed through React state.
 */

import { getNext, getPrevious, getTrack, TRACKS, type Track, type TrackId } from '../data/tracks';

export type PlaybackStatus = 'idle' | 'paused' | 'loading' | 'playing' | 'ended' | 'error';

/**
 * missing      the file could not be found at its URL
 * unsupported  the browser cannot decode this format
 * network      the transfer failed part-way
 * blocked      the browser refused to start playback (autoplay policy etc.)
 * unknown      anything else
 */
export type PlaybackProblem = 'missing' | 'unsupported' | 'network' | 'blocked' | 'unknown';

export interface PlayerState {
  readonly currentId: TrackId | null;
  readonly status: PlaybackStatus;
  /** Seconds. Starts as the measured value from tracks.ts, then browser metadata. */
  readonly duration: number | null;
  readonly problem: PlaybackProblem | null;
}

type Listener = () => void;

const INITIAL: PlayerState = { currentId: null, status: 'idle', duration: null, problem: null };

class Player {
  private audio: HTMLAudioElement | null = null;
  private state: PlayerState = INITIAL;
  private listeners = new Set<Listener>();
  private timeListeners = new Set<Listener>();
  /** Incremented on every source change; stale async results are discarded. */
  private token = 0;
  /** The visitor's intent: should sound be coming out right now? */
  private wantPlay = false;
  private teardown: (() => void) | null = null;

  /* ---------- subscription ---------- */

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = () => this.state;

  /** Fires on timeupdate / seek / source change — for low-frequency readers. */
  subscribeTime = (listener: Listener) => {
    this.timeListeners.add(listener);
    return () => {
      this.timeListeners.delete(listener);
    };
  };

  get currentTime(): number {
    return this.audio?.currentTime ?? 0;
  }

  private set(patch: Partial<PlayerState>) {
    const next = { ...this.state, ...patch };
    const s = this.state;
    if (
      next.currentId === s.currentId &&
      next.status === s.status &&
      next.duration === s.duration &&
      next.problem === s.problem
    ) {
      return;
    }
    this.state = next;
    this.listeners.forEach((l) => l());
  }

  private emitTime = () => this.timeListeners.forEach((l) => l());

  /* ---------- element ---------- */

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const a = new Audio();
    a.preload = 'none'; // nothing is fetched until a track is chosen

    const sync = () => this.sync();
    const onMeta = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) this.set({ duration: a.duration });
      this.emitTime();
    };
    const onEnded = () => this.handleEnded();
    const onError = () => this.handleMediaError();

    const events: [string, EventListener][] = [
      ['play', sync],
      ['playing', sync],
      ['pause', sync],
      ['waiting', sync],
      ['canplay', sync],
      ['seeking', sync],
      ['seeked', sync],
      ['loadedmetadata', onMeta],
      ['durationchange', onMeta],
      ['timeupdate', this.emitTime],
      ['seeked', this.emitTime],
      ['emptied', this.emitTime],
      ['ended', onEnded],
      ['error', onError],
    ];
    events.forEach(([type, fn]) => a.addEventListener(type, fn));
    this.teardown = () => {
      events.forEach(([type, fn]) => a.removeEventListener(type, fn));
      a.pause();
      a.removeAttribute('src');
      a.load();
    };
    this.audio = a;
    return a;
  }

  /** Derive status from the element itself — robust against event ordering. */
  private sync() {
    const a = this.audio;
    if (!a || !this.state.currentId || this.state.status === 'error') return;
    let status: PlaybackStatus;
    if (a.ended) status = 'ended';
    else if (a.paused) status = this.wantPlay ? 'loading' : 'paused';
    else if (a.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) status = 'loading';
    else status = 'playing';
    this.set({ status });
  }

  /* ---------- commands ---------- */

  /**
   * Make `id` the current track. By default playback continues if something
   * was already playing, and stays paused otherwise. Selecting the current
   * track again is a no-op (state is preserved).
   */
  select(id: TrackId, opts: { autoplay?: boolean } = {}) {
    const autoplay = opts.autoplay ?? this.wantPlay;
    if (this.state.currentId === id && this.state.status !== 'error') {
      if (autoplay && !this.isActive()) this.play();
      return;
    }
    const track = getTrack(id);
    const a = this.ensureAudio();
    this.token++;
    a.pause();
    this.wantPlay = false;

    if (a.canPlayType(track.mime) === '') {
      this.set({ currentId: id, status: 'error', duration: track.duration, problem: 'unsupported' });
      this.updateMediaSession(track);
      return;
    }

    a.preload = 'metadata';
    a.src = track.src; // triggers the load algorithm
    this.set({ currentId: id, status: 'paused', duration: track.duration, problem: null });
    this.updateMediaSession(track);
    this.emitTime();
    if (autoplay) this.play();
  }

  play() {
    const id = this.state.currentId;
    if (!id) {
      this.select(TRACKS[0].id, { autoplay: true });
      return;
    }
    const a = this.ensureAudio();
    if (this.state.status === 'error') {
      if (this.state.problem === 'unsupported' && a.canPlayType(getTrack(id).mime) === '') return;
      this.retry();
      return;
    }
    this.wantPlay = true;
    if (this.state.problem === 'blocked') this.set({ problem: null });
    const token = this.token;
    const attempt = a.play();
    this.sync();
    attempt.catch((err: DOMException) => {
      if (token !== this.token || err.name === 'AbortError') return;
      this.wantPlay = false;
      if (err.name === 'NotAllowedError') {
        this.set({ status: 'paused', problem: 'blocked' });
      } else if (err.name === 'NotSupportedError') {
        // The media 'error' event refines this (missing vs unsupported).
        if (this.state.status !== 'error') this.set({ status: 'error', problem: 'unsupported' });
      } else {
        this.set({ status: 'error', problem: 'unknown' });
      }
    });
  }

  pause() {
    this.wantPlay = false;
    this.audio?.pause();
    this.sync();
  }

  toggle() {
    if (this.isActive()) this.pause();
    else this.play();
  }

  isActive() {
    return this.state.status === 'playing' || this.state.status === 'loading';
  }

  seek(seconds: number) {
    const a = this.audio;
    if (!a || !this.state.currentId || this.state.status === 'error') return;
    const max = this.state.duration ?? a.duration;
    const t = Math.max(0, Number.isFinite(max) ? Math.min(seconds, max) : seconds);
    a.currentTime = t;
    this.emitTime();
  }

  next() {
    const id = this.state.currentId;
    const n = id ? getNext(id) : TRACKS[0];
    if (n) this.select(n.id);
  }

  previous() {
    const id = this.state.currentId;
    const p = id ? getPrevious(id) : null;
    if (p) this.select(p.id);
  }

  /** Reload the current source and try again. */
  retry() {
    const id = this.state.currentId;
    if (!id) return;
    const track = getTrack(id);
    const a = this.ensureAudio();
    this.token++;
    this.set({ status: 'paused', problem: null });
    a.preload = 'metadata';
    a.src = track.src;
    this.play();
  }

  /* ---------- lifecycle events ---------- */

  private handleEnded() {
    const id = this.state.currentId;
    const n = id ? getNext(id) : null;
    if (n) {
      // Continuous listening: advance through the running order, stop after 07.
      this.select(n.id, { autoplay: true });
    } else {
      this.wantPlay = false;
      this.sync();
    }
  }

  private handleMediaError() {
    const a = this.audio;
    const id = this.state.currentId;
    if (!a || !id || !a.error) return;
    const code = a.error.code;
    const token = this.token;
    this.wantPlay = false;
    const problem: PlaybackProblem =
      code === MediaError.MEDIA_ERR_NETWORK
        ? 'network'
        : code === MediaError.MEDIA_ERR_DECODE || code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
          ? 'unsupported'
          : 'unknown';
    this.set({ status: 'error', problem });

    // "Not supported" is also what browsers report for a 404. Ask the server.
    if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || code === MediaError.MEDIA_ERR_NETWORK) {
      const src = getTrack(id).src;
      fetch(src, { method: 'HEAD', cache: 'no-store' })
        .then((res) => {
          if (token !== this.token) return;
          const type = res.headers.get('content-type') ?? '';
          // Static hosts with SPA fallback answer 200 with HTML for missing files.
          if (!res.ok || type.startsWith('text/html')) this.set({ problem: 'missing' });
        })
        .catch(() => {
          /* offline — keep the original classification */
        });
    }
  }

  /* ---------- OS media controls ---------- */

  private mediaSessionReady = false;

  private updateMediaSession(track: Track) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: 'ODUVIL',
    });
    if (this.mediaSessionReady) return;
    this.mediaSessionReady = true;
    const ms = navigator.mediaSession;
    const safe = (action: MediaSessionAction, handler: MediaSessionActionHandler) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        /* action not supported by this browser */
      }
    };
    safe('play', () => this.play());
    safe('pause', () => this.pause());
    safe('previoustrack', () => this.previous());
    safe('nexttrack', () => this.next());
    safe('seekto', (d) => d.seekTime != null && this.seek(d.seekTime));
  }

  destroy() {
    this.teardown?.();
    this.teardown = null;
    this.audio = null;
    this.listeners.clear();
    this.timeListeners.clear();
  }
}

export const player = new Player();

// During development, a hot-reloaded module must not leave a second voice behind.
if (import.meta.hot) {
  import.meta.hot.dispose(() => player.destroy());
}
