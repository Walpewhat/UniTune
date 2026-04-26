import type { MusicProvider } from "@/lib/providers/types";
import { soundcloudApi } from "./api";
import { createSoundcloudPlayer } from "./player";

export const soundcloudProvider: MusicProvider = {
  id: "soundcloud",
  displayName: "SoundCloud",
  brandColor: "#ff5500",
  capabilities: {
    search: Boolean(process.env.SOUNDCLOUD_CLIENT_ID),
    library: false,
    playlists: false,
    playback: "embed",
    requiresPremium: false,
  },
  auth: null,
  api: soundcloudApi,
  // MVP: SoundCloud API is closed for new app registrations. Hide from UI
  // until we either ship an unofficial client_id extractor or SoundCloud
  // reopens their developer program. Provider object stays so existing
  // type references and potential stored connections don't break.
  enabled: false,
  createPlayer: createSoundcloudPlayer,
};
