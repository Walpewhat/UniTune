import type { ProviderId } from "@/types/provider";

export function makeUid(provider: ProviderId, providerId: string): string {
  return `${provider}:${providerId}`;
}

export function parseUid(
  uid: string,
): { provider: ProviderId; id: string } | null {
  const idx = uid.indexOf(":");
  if (idx < 1) return null;
  const provider = uid.slice(0, idx) as ProviderId;
  const id = uid.slice(idx + 1);
  if (!id) return null;
  return { provider, id };
}

export function isSameTrack(a: string, b: string): boolean {
  return a === b;
}
