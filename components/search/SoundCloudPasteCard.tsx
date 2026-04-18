"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Cloud, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { useQueueStore } from "@/stores/queue";
import { trackFromSoundcloudOEmbed } from "@/lib/providers/soundcloud/client";

const SC_RE = /^https?:\/\/(www\.|m\.)?soundcloud\.com\/[^\s]+/i;

export function SoundCloudPasteCard() {
  const t = useTranslations("search.soundcloud");
  const { playTrack } = usePlayer();
  const enqueue = useQueueStore((s) => s.enqueue);
  const [url, setUrl] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!SC_RE.test(url)) {
      toast.error("Paste a valid SoundCloud URL");
      return;
    }
    setPending(true);
    try {
      const track = await trackFromSoundcloudOEmbed(url);
      enqueue(track);
      await playTrack(track);
      setUrl("");
      toast.success(`Added: ${track.title}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add track");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="border-[color:var(--color-brand-soundcloud)]/30">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Cloud className="size-4 text-[color:var(--color-brand-soundcloud)]" />
          <h3 className="font-semibold">{t("title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("placeholder")}
            inputMode="url"
            autoComplete="off"
          />
          <Button type="submit" disabled={pending || !url.trim()}>
            <Plus className="mr-1 size-4" />
            {t("add")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
