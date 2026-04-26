// Type augmentation for @castlabs/electron-releases.
//
// castLabs ships a fork of Electron with Widevine CDM bundled. It adds a
// `components` export to the `electron` module (not present in upstream
// @types/electron). We install it via an npm alias:
//
//   "electron": "npm:@castlabs/electron-releases@..."
//
// so `import { ... } from "electron"` resolves to the castLabs build. This
// declaration merges the extra export into the existing module type.
//
// Reference: https://github.com/castlabs/electron-releases/blob/master/docs/Components.md

declare module "electron" {
  export const components: {
    /**
     * Resolves when all bundled components (Widevine CDM among them) are
     * initialised. First launch downloads the CDM; subsequent launches resolve
     * quickly. Must be awaited before opening any BrowserWindow that plays
     * DRM-protected media (Spotify Web Playback SDK, Netflix, etc.).
     */
    whenReady(): Promise<void>;
    /**
     * Snapshot of component load state — useful for logging. Returns a map of
     * component name → status string (e.g. `{ "WIDEVINE_CDM": "READY" }`).
     */
    status(): Record<string, string>;
  };
}
