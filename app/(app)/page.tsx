import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listConnectionsForCurrentUser } from "@/lib/providers/connections";
import { listProviders } from "@/lib/providers/registry";
import { HomeFeed } from "@/components/home/HomeFeed";

function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const connections = await listConnectionsForCurrentUser();
  const connectedIds = new Set(connections.map((c) => c.provider));
  const providers = listProviders();
  const hasConnection = connections.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-8">
      <header>
        <p className="text-sm text-muted-foreground">
          {t(`greeting.${greetingKey()}`)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("sections.continueListening")}
        </h1>
      </header>

      {!hasConnection ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <Plug className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-medium">{t("emptyConnected")}</h2>
            </div>
            <Button asChild>
              <Link href="/settings/connections">{t("connectButton")}</Link>
            </Button>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {providers.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs"
                  style={{ borderColor: `${p.brandColor}55` }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: p.brandColor }}
                  />
                  {p.displayName}
                  {connectedIds.has(p.id) && (
                    <span className="text-muted-foreground">· connected</span>
                  )}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <HomeFeed />
      )}
    </div>
  );
}
