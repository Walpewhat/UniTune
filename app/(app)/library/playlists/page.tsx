import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Plus, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerSupabase } from "@/lib/supabase/server";
import { CreateSuperPlaylistDialog } from "@/components/playlist/CreateSuperPlaylistDialog";

export default async function PlaylistsPage() {
  const t = await getTranslations("library");
  const supabase = await getServerSupabase();
  const { data: rows } = await supabase
    .from("super_playlists")
    .select("id, name, description, cover_path, updated_at")
    .order("updated_at", { ascending: false });

  const playlists = rows ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("tabs.playlists")}
        </h2>
        <CreateSuperPlaylistDialog>
          <Button>
            <Plus className="mr-1.5 size-4" />
            {t("newSuperPlaylist")}
          </Button>
        </CreateSuperPlaylistDialog>
      </div>

      {playlists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {t("emptyPlaylists")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {playlists.map((p) => (
            <Link
              key={p.id}
              href={`/playlist/${p.id}`}
              className="group space-y-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                {p.cover_path ? (
                  <Image
                    src={p.cover_path}
                    alt=""
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ListMusic className="size-8" />
                  </div>
                )}
              </div>
              <p className="truncate text-sm font-medium group-hover:underline">
                {p.name}
              </p>
              {p.description && (
                <p className="truncate text-xs text-muted-foreground">
                  {p.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
