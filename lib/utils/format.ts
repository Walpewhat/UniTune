export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDurationVerbose(ms: number, locale: string): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (locale.startsWith("ru")) {
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} ч`);
    if (minutes > 0) parts.push(`${minutes} мин`);
    if (hours === 0 && seconds > 0) parts.push(`${seconds} сек`);
    return parts.join(" ") || "0 сек";
  }
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (hours === 0 && seconds > 0) parts.push(`${seconds} sec`);
  return parts.join(" ") || "0 sec";
}

export function formatCount(n: number, locale: string): string {
  return new Intl.NumberFormat(locale, { notation: "compact" }).format(n);
}

export function formatDate(iso: string | Date, locale: string): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
}

export function joinArtists(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]}, ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, ${names.at(-1)}`;
}
