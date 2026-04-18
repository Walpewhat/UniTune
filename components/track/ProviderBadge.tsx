import { cn } from "@/lib/utils/cn";
import type { ProviderId } from "@/types/provider";

const LABELS: Record<ProviderId, string> = {
  spotify: "Spotify",
  soundcloud: "SoundCloud",
};

const CLASSES: Record<ProviderId, string> = {
  spotify: "bg-[color:var(--color-brand-spotify)]/15 text-[color:var(--color-brand-spotify)]",
  soundcloud:
    "bg-[color:var(--color-brand-soundcloud)]/15 text-[color:var(--color-brand-soundcloud)]",
};

export function ProviderBadge({
  provider,
  className,
  showLabel = false,
}: {
  provider: ProviderId;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        CLASSES[provider],
        className,
      )}
      aria-label={LABELS[provider]}
      title={LABELS[provider]}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor:
            provider === "spotify" ? "#1db954" : "#ff5500",
        }}
      />
      {showLabel && LABELS[provider]}
    </span>
  );
}
