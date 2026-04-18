import { getTranslations } from "next-intl/server";
import { listProviders } from "@/lib/providers/registry";
import { listConnectionsForCurrentUser } from "@/lib/providers/connections";
import { ConnectProviderCard } from "@/components/connections/ConnectProviderCard";

export default async function ConnectionsPage() {
  const t = await getTranslations("settings.connections");
  const connections = await listConnectionsForCurrentUser();
  const byProvider = new Map(connections.map((c) => [c.provider, c]));
  const providers = listProviders();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((p) => (
          <ConnectProviderCard
            key={p.id}
            providerId={p.id}
            displayName={p.displayName}
            brandColor={p.brandColor}
            connection={byProvider.get(p.id) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
