// electron-builder afterPack hook — VMP-signs the packaged app using castLabs
// EVS CLI. Without this, Spotify's Widevine license server returns 500 on
// every /widevine-license/v1/audio/license POST because the runtime binary
// isn't registered with a recognised VMP signature.
//
// Prerequisites (one-time, per developer machine):
//   1. Python 3 installed and on PATH.
//   2. pip install --upgrade castlabs-evs
//   3. python -m castlabs_evs.account signup  (creates the EVS account)
//
// Runtime env:
//   PYTHON   — optional override for the python executable (default: "python")
//   SKIP_VMP — set to "1" to bypass signing (useful for quick CI iteration
//              when you know the artifact won't be used against Spotify DRM)

const { spawnSync } = require("node:child_process");

/** @param {import("electron-builder").AfterPackContext} context */
exports.default = async function vmpSign(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== "win32") {
    console.log(`[vmp-sign] skip: platform=${electronPlatformName}`);
    return;
  }
  if (process.env.SKIP_VMP === "1") {
    console.log("[vmp-sign] skip: SKIP_VMP=1");
    return;
  }

  const python = process.env.PYTHON || "python";
  // `-f` / `--force` — bypass castlabs_evs's local signature cache. Without
  // this, the CLI happily prints "Using cached signature: streaming, 1550
  // days left" and returns success, but the cache key is the binary hash as
  // it was at a prior build. electron-builder's own `updating asar integrity
  // executable resource` step mutates UniTune.exe *before* this afterPack
  // hook runs, so the cached signature no longer matches the current hash.
  // Result: verify-pkg fails ("InvalidSignature"), and Spotify's Widevine
  // license server responds with 403 on every playback attempt. Forcing a
  // fresh sign makes every build round-trip to the EVS backend — slower
  // (~60s upload of the 213 MB bundle), but signature is always valid.
  console.log(`[vmp-sign] running ${python} -m castlabs_evs.vmp sign-pkg -f "${appOutDir}"`);

  const result = spawnSync(
    python,
    ["-m", "castlabs_evs.vmp", "sign-pkg", "-f", appOutDir],
    { stdio: "inherit" },
  );

  if (result.error) {
    throw new Error(
      `[vmp-sign] failed to spawn python — is Python installed and on PATH?\n${result.error.message}`,
    );
  }
  if (result.status !== 0) {
    throw new Error(
      `[vmp-sign] castlabs_evs.vmp exited with code ${result.status}. ` +
        `Did you run "python -m castlabs_evs.account signup" and "reauth"?`,
    );
  }
  console.log("[vmp-sign] done");
};
