"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrackList } from "@/components/track/TrackList";
import { ProviderBadge } from "@/components/track/ProviderBadge";
import { SoundCloudPasteCard } from "./SoundCloudPasteCard";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { listProviders } from "@/lib/providers/registry";
import type { ProviderId } from "@/types/provider";
import type {
  UnifiedTrack,
} from "@/types/track";
import type { UnifiedAlbum } from "@/types/album";
import type { UnifiedArtist } from "@/types/artist";
import type { UnifiedPlaylist } from "@/types/playlist";
import Image from "next/image";
import Link from "next/link";
import { Music2, Search as SearchIcon } from "lucide-react";

interface SearchResponse {
  q: string;
  providers: { provider: ProviderId; ok: boolean; error?: string }[];
  tracks: UnifiedTrack[];
  albums: UnifiedAlbum[];
  artists: UnifiedArtist[];
  playlists: UnifiedPlaylist[];
}

const PROVIDERS = listProviders();

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function SearchView({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("search");
  const [query, setQuery] = React.useState(initialQuery);
  const [providerFilter, setProviderFilter] = React.useState<ProviderId | "all">(
    "all",
  );
  const debounced = useDebounced(query, SEARCH_DEBOUNCE_MS);

  React.useEffect(() => {
    const q = params.get("q") ?? "";
    if (q !== query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  React.useEffect(() => {
    const current = params.get("q") ?? "";
    if (debounced === current) return;
    const url = new URL(window.location.href);
    if (debounced) url.searchParams.set("q", debounced);
    else url.searchParams.delete("q");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [debounced, params, router]);

  const { data, isFetching } = useQuery<SearchResponse>({
    queryKey: ["search", debounced, providerFilter],
    enabled: debounced.trim().length > 0,
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const url = new URL("/api/search", window.location.origin);
      url.searchParams.set("q", debounced);
      if (providerFilter !== "all") {
        url.searchParams.set("providers", providerFilter);
      }
      const res = await fetch(url.toString(), { signal });
      if (!res.ok) throw new Error("search failed");
      return res.json();
    },
  });

  const anyResults =
    !!data &&
    (data.tracks.length > 0 ||
      data.albums.length > 0 ||
      data.artists.length > 0 ||
      data.playlists.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="h-11 pl-9"
            autoFocus
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterChip
            active={providerFilter === "all"}
            onClick={() => setProviderFilter("all")}
          >
            {t("filterAll")}
          </FilterChip>
          {PROVIDERS.map((p) => (
            <FilterChip
              key={p.id}
              active={providerFilter === p.id}
              onClick={() => setProviderFilter(p.id)}
              disabled={!p.capabilities.search}
              title={
                p.capabilities.search
                  ? undefined
                  : "Search unavailable for this provider"
              }
            >
              <ProviderBadge provider={p.id} />
              {p.displayName}
            </FilterChip>
          ))}
        </div>
      </div>

      <SoundCloudPasteCard />

      {!debounced.trim() && (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {t("hint")}
          </CardContent>
        </Card>
      )}

      {debounced.trim() && !anyResults && !isFetching && (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {t("empty", { query: debounced })}
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-8">
          {data.tracks.length > 0 && (
            <Section title={t("tabs.tracks")}>
              <TrackList tracks={data.tracks.slice(0, 20)} />
            </Section>
          )}
          {data.artists.length > 0 && (
            <Section title={t("tabs.artists")}>
              <Grid>
                {data.artists.slice(0, 10).map((a) => (
                  <Link
                    key={a.uid}
                    href={`/artist/${a.provider}/${a.providerId}`}
                    className="group space-y-2"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-full bg-muted">
                      {a.imageUrl ? (
                        <Image src={a.imageUrl} alt="" fill sizes="180px" className="object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <Music2 className="size-8" />
                        </div>
                      )}
                    </div>
                    <p className="truncate text-sm font-medium group-hover:underline">{a.name}</p>
                    <ProviderBadge provider={a.provider} />
                  </Link>
                ))}
              </Grid>
            </Section>
          )}
          {data.albums.length > 0 && (
            <Section title={t("tabs.albums")}>
              <Grid>
                {data.albums.slice(0, 10).map((a) => (
                  <Link
                    key={a.uid}
                    href={`/album/${a.provider}/${a.providerId}`}
                    className="group space-y-2"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                      {a.coverUrl ? (
                        <Image src={a.coverUrl} alt="" fill sizes="180px" className="object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <Music2 className="size-8" />
                        </div>
                      )}
                    </div>
                    <p className="truncate text-sm font-medium group-hover:underline">{a.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.artists.map((ar) => ar.name).join(", ")}
                    </p>
                  </Link>
                ))}
              </Grid>
            </Section>
          )}
          {data.playlists.length > 0 && (
            <Section title={t("tabs.playlists")}>
              <Grid>
                {data.playlists.slice(0, 10).map((p) => (
                  <Link
                    key={p.uid}
                    href={`/playlist/${p.providerId}`}
                    className="group space-y-2"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                      {p.coverUrl ? (
                        <Image src={p.coverUrl} alt="" fill sizes="180px" className="object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <Music2 className="size-8" />
                        </div>
                      )}
                    </div>
                    <p className="truncate text-sm font-medium group-hover:underline">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.ownerName ?? ""}</p>
                  </Link>
                ))}
              </Grid>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  disabled,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 rounded-full"
    >
      {children}
    </Button>
  );
}
