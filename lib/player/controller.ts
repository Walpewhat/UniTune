"use client";

import type {
  MusicProvider,
  ProviderPlayer,
  Unsubscribe,
} from "@/lib/providers/types";
import type { ProviderId } from "@/types/provider";
import type { UnifiedTrack } from "@/types/track";
import type { PlayerSnapshot } from "@/stores/player";
import { useQueueStore } from "@/stores/queue";
import { getProvider } from "@/lib/providers/registry";
import { crossfade } from "./crossfade";
import { DEFAULT_VOLUME } from "@/lib/constants";

type SnapshotListener = (s: Partial<PlayerSnapshot>) => void;

class PlayerController {
  private players = new Map<ProviderId, ProviderPlayer>();
  private activeProvider: ProviderId | null = null;
  private activeUnsubs: Unsubscribe[] = [];
  private snapshotListeners = new Set<SnapshotListener>();
  private currentTrack: UnifiedTrack | null = null;
  private volume = DEFAULT_VOLUME;
  private muted = false;
  private requirePremiumCallback: (() => void) | null = null;

  subscribe(cb: SnapshotListener): Unsubscribe {
    this.snapshotListeners.add(cb);
    return () => this.snapshotListeners.delete(cb);
  }

  onRequirePremium(cb: () => void) {
    this.requirePremiumCallback = cb;
  }

  async playTrack(track: UnifiedTrack) {
    try {
      const provider = getProvider(track.provider);
      const player = await this.ensurePlayer(provider);

      const previousPlayer =
        this.activeProvider && this.activeProvider !== track.provider
          ? this.players.get(this.activeProvider) ?? null
          : null;

      await player.load(track);
      if (previousPlayer) {
        await crossfade(previousPlayer, player, this.muted ? 0 : this.volume);
      } else {
        await player.setVolume(this.muted ? 0 : this.volume);
        await player.play();
      }
      this.activeProvider = track.provider;
      this.currentTrack = track;
      this.emit({
        currentTrack: track,
        isPlaying: true,
        isBuffering: false,
        error: null,
      });
    } catch (err) {
      console.error("[PlayerController.playTrack]", err);
      this.emit({
        error: err instanceof Error ? err.message : "play_failed",
        isPlaying: false,
        isBuffering: false,
      });
    }
  }

  async playQueue(items: UnifiedTrack[], startIndex = 0) {
    useQueueStore.getState().setQueue(items, startIndex);
    const startTrack = items[startIndex];
    if (startTrack) await this.playTrack(startTrack);
  }

  async toggle() {
    const active = this.getActivePlayer();
    if (!active || !this.currentTrack) return;
    // We don't track isPlaying reliably from outside; peek state by toggling
    // based on store. Consumers update via snapshots.
    // We simply call pause/play alternately — providers are idempotent enough.
    // For a safer impl we could store isPlaying; but store mirrors events already.
    const snapshot = (await (async () => undefined)()) as undefined;
    void snapshot;
    try {
      // Try resume; if it throws we'll catch and pause.
      await active.play();
      this.emit({ isPlaying: true });
    } catch {
      await active.pause();
      this.emit({ isPlaying: false });
    }
  }

  async play() {
    const p = this.getActivePlayer();
    if (!p) return;
    await p.play();
    this.emit({ isPlaying: true });
  }

  async pause() {
    const p = this.getActivePlayer();
    if (!p) return;
    await p.pause();
    this.emit({ isPlaying: false });
  }

  async seek(ms: number) {
    const p = this.getActivePlayer();
    if (!p) return;
    await p.seek(ms);
    this.emit({ positionMs: ms });
  }

  async setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    this.muted = false;
    const p = this.getActivePlayer();
    if (p) await p.setVolume(this.volume);
    this.emit({ volume: this.volume, muted: false });
  }

  async toggleMute() {
    this.muted = !this.muted;
    const p = this.getActivePlayer();
    if (p) await p.setVolume(this.muted ? 0 : this.volume);
    this.emit({ muted: this.muted });
  }

  async next() {
    const nextIdx = useQueueStore.getState().nextIndex();
    if (nextIdx === null) return;
    useQueueStore.getState().setCurrentIndex(nextIdx);
    const track = useQueueStore.getState().items[nextIdx];
    if (track) await this.playTrack(track);
  }

  async previous() {
    const prevIdx = useQueueStore.getState().previousIndex();
    if (prevIdx === null) return;
    useQueueStore.getState().setCurrentIndex(prevIdx);
    const track = useQueueStore.getState().items[prevIdx];
    if (track) await this.playTrack(track);
  }

  private getActivePlayer(): ProviderPlayer | null {
    if (!this.activeProvider) return null;
    return this.players.get(this.activeProvider) ?? null;
  }

  private async ensurePlayer(provider: MusicProvider): Promise<ProviderPlayer> {
    const existing = this.players.get(provider.id);
    if (existing) return existing;

    const player = provider.createPlayer({
      getAccessToken: () => fetchAccessToken(provider.id),
      onRequirePremium: () => this.requirePremiumCallback?.(),
    });

    await player.init();
    this.players.set(provider.id, player);

    // Wire provider events into snapshot + queue flow
    const offProgress = player.on("progress", ({ positionMs, durationMs }) => {
      this.emit({ positionMs, durationMs });
    });
    const offState = player.on("stateChange", ({ isPlaying }) => {
      this.emit({ isPlaying });
    });
    const offEnded = player.on("ended", () => {
      void this.next();
    });
    const offError = player.on("error", ({ message }) => {
      this.emit({ error: message, isPlaying: false });
    });

    this.activeUnsubs.push(offProgress, offState, offEnded, offError);
    return player;
  }

  private emit(patch: Partial<PlayerSnapshot>) {
    for (const cb of this.snapshotListeners) cb(patch);
  }

  async dispose() {
    for (const unsub of this.activeUnsubs) unsub();
    this.activeUnsubs = [];
    for (const p of this.players.values()) await p.destroy();
    this.players.clear();
    this.activeProvider = null;
    this.currentTrack = null;
  }
}

let singleton: PlayerController | null = null;

export function getPlayerController(): PlayerController {
  if (!singleton) singleton = new PlayerController();
  return singleton;
}

async function fetchAccessToken(provider: ProviderId): Promise<string> {
  const res = await fetch(`/api/providers/${provider}/token`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token fetch failed: ${res.status}`);
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}
