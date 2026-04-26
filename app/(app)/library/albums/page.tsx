import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function AlbumsPage() {
  const t = await getTranslations("library");
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">
        {t("tabs.albums")}
      </h2>
      <Card className="border-dashed">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Saved albums will appear here after you follow them on Spotify.
        </CardContent>
      </Card>
    </section>
  );
}
