"use client";

import { useQuery } from "@tanstack/react-query";
import { Music2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrackList } from "@/components/track/TrackList";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { ProviderBadge } from "@/components/track/ProviderBadge";
import type { UnifiedTrack } from "@/types/track";
import { cn } from "@/lib/utils/cn";
import type { ProviderId } from "@/types/provider";

interface HomeSection {
  provider: ProviderId;
  title: string;
  tracks: UnifiedTrack[];
}

interface HomeResponse {
  sections: HomeSection[];
}

export function HomeFeed() {
  const { data, isLoading, error } = useQuery<HomeResponse>({
    queryKey: ["home"],
    queryFn: async () => {
      const res = await fetch("/api/home");
      if (!res.ok) throw new Error("home fetch failed");
      return res.json();
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Couldn’t load your home feed.
        </CardContent>
      </Card>
    );
  }

  const sections = data?.sections ?? [];
  if (sections.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Play something to see it here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <QuickGrid tracks={sections.flatMap((s) => s.tracks).slice(0, 6)} />
      {sections.map((s) => (
        <section key={`${s.provider}-${s.title}`} className="space-y-3">
          <div className="flex items-center gap-2">
            <ProviderBadge provider={s.provider} />
            <h2 className="text-lg font-semibold tracking-tight">{s.title}</h2>
          </div>
          <TrackList tracks={s.tracks} showAlbum={false} />
        </section>
      ))}
    </div>
  );
}

function QuickGrid({ tracks }: { tracks: UnifiedTrack[] }) {
  const { playTrack } = usePlayer();
  if (tracks.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tracks.map((t) => (
        <button
          key={t.uid}
          onClick={() => playTrack(t)}
          className={cn(
            "group flex items-center gap-3 rounded-md bg-card p-3 text-left",
            "hover:bg-accent/60",
          )}
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
            {t.coverUrl ? (
              <Image
                src={t.coverUrl}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                <Music2 className="size-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{t.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t.artists.map((a) => a.name).join(", ")}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
