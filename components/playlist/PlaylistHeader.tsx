"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Play, Shuffle, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { useQueueStore } from "@/stores/queue";
import type { UnifiedTrack } from "@/types/track";
import { formatDuration } from "@/lib/utils/format";

interface Props {
  playlistId: string;
  name: string;
  description: string | null;
  trackCount: number;
  tracks: UnifiedTrack[];
  cover: React.ReactNode;
}

export function PlaylistHeader({
  playlistId,
  name,
  description,
  trackCount,
  tracks,
  cover,
}: Props) {
  const router = useRouter();
  const tA = useTranslations("actions");
  const tP = useTranslations("player");
  const { playQueue } = usePlayer();
  const toggleShuffle = useQueueStore((s) => s.toggleShuffle);
  const [pending, setPending] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const totalMs = tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);

  const onPlay = async () => {
    if (tracks.length === 0) return;
    await playQueue(tracks, 0);
  };

  const onShuffle = async () => {
    if (tracks.length === 0) return;
    toggleShuffle();
    const start = Math.floor(Math.random() * tracks.length);
    await playQueue(tracks, start);
  };

  const onDelete = async () => {
    setPending(true);
    try {
      const res = await fetch(`/api/super-playlists/${playlistId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Playlist deleted");
      router.push("/library/playlists");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setPending(false);
      setDeleteOpen(false);
    }
  };

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end">
      {cover}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Super-playlist
        </p>
        <h1 className="truncate text-4xl font-bold tracking-tight">{name}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {trackCount} {trackCount === 1 ? "song" : "songs"} ·{" "}
          {formatDuration(totalMs)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Button onClick={onPlay} disabled={tracks.length === 0}>
            <Play className="mr-1.5 size-4" />
            {tP("play")}
          </Button>
          <Button
            variant="outline"
            onClick={onShuffle}
            disabled={tracks.length === 0}
          >
            <Shuffle className="mr-1.5 size-4" />
            {tP("shuffle")}
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={tA("delete")}>
                <Trash2 />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete “{name}”?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                This removes the super-playlist and its tracks. Tracks on the
                source service are not affected.
              </p>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteOpen(false)}
                  disabled={pending}
                >
                  {tA("cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  disabled={pending}
                >
                  {tA("delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
