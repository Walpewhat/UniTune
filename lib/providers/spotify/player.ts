"use client";

import type {
  PlayerFactoryOptions,
  ProviderPlayer,
  ProviderPlayerEventName,
  ProviderPlayerEvents,
  Unsubscribe,
} from "@/lib/providers/types";
import type { UnifiedTrack } from "@/types/track";
import { playOnDevice, transferPlayback, trackUri } from "./api";

type Listener<E extends ProviderPlayerEventName> = (
  data: ProviderPlayerEvents[E],
) => void;

const SDK_URL = "https://sdk.scdn.co/spotify-player.js";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: typeof Spotify;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Spotify) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    const readyPromise = new Promise<void>((readyResolve) => {
      window.onSpotifyWebPlaybackSDKReady = () => readyResolve();
    });
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Spotify SDK"));
    document.head.appendChild(script);
    readyPromise.then(resolve, reject);
  });
  return sdkPromise;
}

type SpotifySdkInstance = InstanceType<typeof Spotify.Player>;

export class SpotifyPlayer implements ProviderPlayer {
  readonly provider = "spotify" as const;
  private sdk: SpotifySdkInstance | null = null;
  private deviceId: string | null = null;
  private currentToken: string | null = null;
  private currentTrack: UnifiedTrack | null = null;
  private progressTimer: number | null = null;
  private fallbackAudio: HTMLAudioElement | null = null;
  private listeners = new Map<ProviderPlayerEventName, Set<Listener<never>>>();
  private initialized = false;

  constructor(private readonly opts: PlayerFactoryOptions) {}

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      await loadSdk();
      if (!window.Spotify) throw new Error("Spotify SDK not available");
      this.sdk = new window.Spotify.Player({
        name: "UniTune Web",
        volume: 0.7,
        getOAuthToken: async (cb) => {
          const token = await this.opts.getAccessToken();
          this.currentToken = token;
          cb(token);
        },
      });

      this.sdk.addListener("ready", ({ device_id }) => {
        this.deviceId = device_id;
        this.emit("ready", { deviceId: device_id });
      });
      this.sdk.addListener("not_ready", () => {
        this.deviceId = null;
      });
      this.sdk.addListener("initialization_error", ({ message }) =>
        this.emit("error", { message }),
      );
      this.sdk.addListener("authentication_error", ({ message }) => {
        this.emit("error", { message });
      });
      this.sdk.addListener("account_error", ({ message }) => {
        this.opts.onRequirePremium?.();
        this.emit("error", { message });
      });
      this.sdk.addListener("player_state_changed", (state) => {
        if (!state) return;
        this.emit("stateChange", { isPlaying: !state.paused });
        this.emit("progress", {
          positionMs: state.position,
          durationMs: state.duration,
        });
        if (state.paused && state.position === 0 && state.track_window.previous_tracks.length > 0) {
          this.emit("ended", undefined);
        }
      });

      const connected = await this.sdk.connect();
      if (!connected) throw new Error("Spotify SDK connect() returned false");
    } catch (err) {
      this.emit("error", {
        message: err instanceof Error ? err.message : "spotify_init_failed",
      });
      throw err;
    }
  }

  async load(track: UnifiedTrack): Promise<void> {
    this.currentTrack = track;
    this.stopFallback();

    if (this.deviceId && this.currentToken) {
      try {
        await transferPlayback(this.currentToken, this.deviceId);
      } catch {
        /* non-fatal */
      }
    }

    if (!this.deviceId || !this.currentToken) {
      await this.loadFallback(track);
      return;
    }
    try {
      await playOnDevice(
        this.currentToken,
        this.deviceId,
        trackUri(track.providerId),
      );
      this.startProgressTicker();
    } catch (err) {
      if (track.previewUrl) {
        await this.loadFallback(track);
      } else {
        throw err;
      }
    }
  }

  async play(): Promise<void> {
    if (this.fallbackAudio) {
      await this.fallbackAudio.play();
      this.emit("stateChange", { isPlaying: true });
      return;
    }
    await this.sdk?.resume();
  }

  async pause(): Promise<void> {
    if (this.fallbackAudio) {
      this.fallbackAudio.pause();
      this.emit("stateChange", { isPlaying: false });
      return;
    }
    await this.sdk?.pause();
  }

  async seek(ms: number): Promise<void> {
    if (this.fallbackAudio) {
      this.fallbackAudio.currentTime = ms / 1000;
      return;
    }
    await this.sdk?.seek(ms);
  }

  async setVolume(v: number): Promise<void> {
    const clamped = Math.max(0, Math.min(1, v));
    if (this.fallbackAudio) {
      this.fallbackAudio.volume = clamped;
      return;
    }
    await this.sdk?.setVolume(clamped);
  }

  async getPosition(): Promise<number> {
    if (this.fallbackAudio) return this.fallbackAudio.currentTime * 1000;
    const state = await this.sdk?.getCurrentState();
    return state?.position ?? 0;
  }

  on<E extends ProviderPlayerEventName>(
    event: E,
    cb: Listener<E>,
  ): Unsubscribe {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(cb as Listener<never>);
    return () => set?.delete(cb as Listener<never>);
  }

  async destroy(): Promise<void> {
    this.stopProgressTicker();
    this.stopFallback();
    await this.sdk?.disconnect();
    this.sdk = null;
    this.deviceId = null;
    this.initialized = false;
    this.listeners.clear();
  }

  private emit<E extends ProviderPlayerEventName>(
    event: E,
    data: ProviderPlayerEvents[E],
  ) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try {
        (cb as Listener<E>)(data);
      } catch (err) {
        console.error("[SpotifyPlayer listener]", err);
      }
    }
  }

  private startProgressTicker() {
    this.stopProgressTicker();
    this.progressTimer = window.setInterval(async () => {
      const state = await this.sdk?.getCurrentState();
      if (!state) return;
      this.emit("progress", {
        positionMs: state.position,
        durationMs: state.duration,
      });
      if (state.position >= state.duration - 200 && !state.paused) {
        this.emit("ended", undefined);
      }
    }, 500);
  }

  private stopProgressTicker() {
    if (this.progressTimer !== null) {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private async loadFallback(track: UnifiedTrack) {
    if (!track.previewUrl) {
      this.emit("error", { message: "no_preview_available" });
      return;
    }
    this.stopFallback();
    const audio = new Audio(track.previewUrl);
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.addEventListener("timeupdate", () => {
      this.emit("progress", {
        positionMs: audio.currentTime * 1000,
        durationMs: (audio.duration || 30) * 1000,
      });
    });
    audio.addEventListener("ended", () => this.emit("ended", undefined));
    audio.addEventListener("error", () =>
      this.emit("error", { message: "preview_playback_error" }),
    );
    this.fallbackAudio = audio;
    this.emit("ready", {});
  }

  private stopFallback() {
    if (this.fallbackAudio) {
      this.fallbackAudio.pause();
      this.fallbackAudio.src = "";
      this.fallbackAudio = null;
    }
  }
}

export function createSpotifyPlayer(
  opts: PlayerFactoryOptions,
): ProviderPlayer {
  return new SpotifyPlayer(opts);
}
