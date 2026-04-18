import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heart, ListMusic, Disc3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function LibraryIndexPage() {
  const t = await getTranslations("library");
  const tNav = await getTranslations("nav");
  const items = [
    { href: "/library/liked", label: tNav("liked"), icon: Heart, desc: t("emptyLiked") },
    { href: "/library/playlists", label: tNav("playlists"), icon: ListMusic, desc: t("emptyPlaylists") },
    { href: "/library/albums", label: tNav("albums"), icon: Disc3, desc: "" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ href, label, icon: Icon, desc }) => (
        <Link key={href} href={href}>
          <Card className="h-full transition hover:bg-accent/40">
            <CardContent className="flex flex-col gap-3 p-6">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-muted">
                <Icon className="size-5" />
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
