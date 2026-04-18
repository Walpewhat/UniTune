"use client";

import type {
  PlayerFactoryOptions,
  ProviderPlayer,
  ProviderPlayerEventName,
  ProviderPlayerEvents,
  Unsubscribe,
} from "@/lib/providers/types";
import type { UnifiedTrack } from "@/types/track";

const WIDGET_API_URL = "https://w.soundcloud.com/player/api.js";
const WIDGET_SRC = (url: string) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    url,
  )}&visual=false&show_comments=false&auto_play=false`;

type Listener<E extends ProviderPlayerEventName> = (
  data: ProviderPlayerEvents[E],
) => void;

declare global {
  interface Window {
    SC?: {
      Widget: ((el: HTMLIFrameElement) => SCWidget) & {
        Events: {
          READY: string;
          PLAY: string;
          PAUSE: string;
          PLAY_PROGRESS: string;
          FINISH: string;
          ERROR: string;
        };
      };
    };
  }
}

interface SCWidget {
  bind(event: string, cb: (data: unknown) => void): void;
  unbind(event: string): void;
  load(url: string, opts?: { callback?: () => void }): void;
  play(): void;
  pause(): void;
  seekTo(ms: number): void;
  setVolume(v: number): void;
  getPosition(cb: (pos: number) => void): void;
  getDuration(cb: (dur: number) => void): void;
}

let widgetPromise: Promise<void> | null = null;

function loadWidgetScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.SC) return Promise.resolve();
  if (widgetPromise) return widgetPromise;
  widgetPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = WIDGET_API_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("SC widget load failed"));
    document.head.appendChild(s);
  });
  return widgetPromise;
}

function getIframeHost(): HTMLElement {
  let host = document.getElementById("unitune-sc-host");
  if (host) return host;
  host = document.createElement("div");
  host.id = "unitune-sc-host";
  host.style.cssText =
    "position:fixed;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;bottom:0;left:0;";
  document.body.appendChild(host);
  return host;
}

export class SoundcloudPlayer implements ProviderPlayer {
  readonly provider = "soundcloud" as const;
  private iframe: HTMLIFrameElement | null = null;
  private widget: SCWidget | null = null;
  private listeners = new Map<ProviderPlayerEventName, Set<Listener<never>>>();
  private currentTrack: UnifiedTrack | null = null;
  private lastVolume = 0.7;
  private durationMs = 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_opts: PlayerFactoryOptions) {}

  async init(): Promise<void> {
    await loadWidgetScript();
    if (!this.iframe) {
      const host = getIframeHost();
      this.iframe = document.createElement("iframe");
      this.iframe.allow = "autoplay";
      this.iframe.width = "100%";
      this.iframe.height = "166";
      this.iframe.frameBorder = "0";
      host.appendChild(this.iframe);
    }
  }

  async load(track: UnifiedTrack): Promise<void> {
    if (!this.iframe) await this.init();
    if (!this.iframe || !window.SC) return;

    const url = track.permalinkUrl ?? track.providerId;
    this.currentTrack = track;

    await new Promise<void>((resolve) => {
      this.iframe!.src = WIDGET_SRC(url);
      this.iframe!.onload = () => {
        this.widget = window.SC!.Widget(this.iframe!);
        this.widget.bind(window.SC!.Widget.Events.READY, () => {
          this.widget?.setVolume(this.lastVolume * 100);
          this.widget?.getDuration((d) => {
            this.durationMs = d;
          });
          this.emit("ready", {});
          resolve();
        });
        this.widget.bind(window.SC!.Widget.Events.PLAY, () => {
          this.emit("stateChange", { isPlaying: true });
        });
        this.widget.bind(window.SC!.Widget.Events.PAUSE, () => {
          this.emit("stateChange", { isPlaying: false });
        });
        this.widget.bind(
          window.SC!.Widget.Events.PLAY_PROGRESS,
          (data: unknown) => {
            const d = data as { currentPosition: number };
            this.emit("progress", {
              positionMs: d.currentPosition,
              durationMs: this.durationMs || 0,
            });
          },
        );
        this.widget.bind(window.SC!.Widget.Events.FINISH, () => {
          this.emit("ended", undefined);
        });
        this.widget.bind(window.SC!.Widget.Events.ERROR, () => {
          this.emit("error", { message: "soundcloud_widget_error" });
        });
      };
    });
  }

  async play(): Promise<void> {
    this.widget?.play();
  }
  async pause(): Promise<void> {
    this.widget?.pause();
  }
  async seek(ms: number): Promise<void> {
    this.widget?.seekTo(ms);
  }
  async setVolume(v: number): Promise<void> {
    this.lastVolume = Math.max(0, Math.min(1, v));
    this.widget?.setVolume(this.lastVolume * 100);
  }
  async getPosition(): Promise<number> {
    return new Promise((resolve) =>
      this.widget?.getPosition((pos) => resolve(pos)) ?? resolve(0),
    );
  }

  on<E extends ProviderPlayerEventName>(event: E, cb: Listener<E>): Unsubscribe {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(cb as Listener<never>);
    return () => set?.delete(cb as Listener<never>);
  }

  async destroy(): Promise<void> {
    if (this.widget) {
      for (const ev of Object.values(window.SC?.Widget.Events ?? {})) {
        try {
          this.widget.unbind(ev);
        } catch {
          /* ignore */
        }
      }
    }
    this.iframe?.remove();
    this.iframe = null;
    this.widget = null;
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
        console.error("[SoundcloudPlayer listener]", err);
      }
    }
  }
}

export function createSoundcloudPlayer(
  opts: PlayerFactoryOptions,
): ProviderPlayer {
  return new SoundcloudPlayer(opts);
}
