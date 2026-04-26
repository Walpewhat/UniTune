import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heart, ListMusic, Disc3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listConnectionsForCurrentUser } from "@/lib/providers/connections";

export default async function LibraryIndexPage() {
  const t = await getTranslations("library");
  const tNav = await getTranslations("nav");
  const connections = await listConnectionsForCurrentUser();
  const spotifyConnected = connections.some((c) => c.provider === "spotify");

  const items = [
    {
      href: "/library/liked",
      label: tNav("liked"),
      icon: Heart,
      desc: t("emptyLiked"),
    },
    ...(spotifyConnected
      ? [
          {
            href: "/library/spotify-liked",
            label: t("spotifyLikedTitle"),
            icon: Heart,
            desc: t("spotifyLikedDesc"),
            accent: "#1db954",
          },
        ]
      : []),
    {
      href: "/library/playlists",
      label: tNav("playlists"),
      icon: ListMusic,
      desc: t("emptyPlaylists"),
    },
    {
      href: "/library/albums",
      label: tNav("albums"),
      icon: Disc3,
      desc: "",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ href, label, icon: Icon, desc, accent }) => (
        <Link key={href} href={href}>
          <Card className="h-full transition hover:bg-accent/40">
            <CardContent className="flex flex-col gap-3 p-6">
              <div
                className="grid h-12 w-12 place-items-center rounded-lg"
                style={
                  accent
                    ? { backgroundColor: `${accent}22`, color: accent }
                    : undefined
                }
              >
                <Icon className={accent ? "size-5" : "size-5"} />
              </div>
              <div>
                <p className="text-base font-semibold">{label}</p>
                {desc && (
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
