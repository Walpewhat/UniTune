import type { ProviderPlayer } from "@/lib/providers/types";
import { CROSSFADE_MS } from "@/lib/constants";

/**
 * Best-effort volume crossfade. Since we cannot mix audio buffers between
 * third-party SDKs, this is a volume ramp: fade out the outgoing player then
 * fade in the incoming one.
 */
export async function crossfade(
  from: ProviderPlayer | null,
  to: ProviderPlayer,
  targetVolume: number,
): Promise<void> {
  const steps = 10;
  const stepMs = CROSSFADE_MS / steps;

  if (from) {
    for (let i = steps - 1; i >= 0; i--) {
      await from.setVolume((targetVolume * i) / steps);
      await wait(stepMs);
    }
    try {
      await from.pause();
    } catch {
      /* ignore */
    }
  }

  await to.setVolume(0);
  await to.play();
  for (let i = 1; i <= steps; i++) {
    await to.setVolume((targetVolume * i) / steps);
    await wait(stepMs);
  }
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
