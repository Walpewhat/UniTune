"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateSuperPlaylistDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const t = useTranslations("library");
  const tA = useTranslations("actions");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    try {
      const res = await fetch("/api/super-playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { id: string };
      toast.success("Playlist created");
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/playlist/${data.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("newSuperPlaylist")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sp-name">Name</Label>
            <Input
              id="sp-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sp-desc">Description</Label>
            <Input
              id="sp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={240}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {tA("cancel")}
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {tA("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
