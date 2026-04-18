"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProviderId } from "@/types/provider";

interface ConnectProviderCardProps {
  providerId: ProviderId;
  displayName: string;
  brandColor: string;
  connection: {
    provider: string;
    provider_user_id: string | null;
    provider_display_name: string | null;
    expires_at: string | null;
  } | null;
}

export function ConnectProviderCard({
  providerId,
  displayName,
  brandColor,
  connection,
}: ConnectProviderCardProps) {
  const t = useTranslations("settings.connections");
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const connected = Boolean(connection);
  const descKey =
    providerId === "spotify"
      ? "spotifyDesc"
      : providerId === "soundcloud"
      ? "soundcloudDesc"
      : null;

  const onConnect = () => {
    setPending(true);
    window.location.href = `/api/auth/${providerId}/login`;
  };

  const onDisconnect = async () => {
    setPending(true);
    try {
      const res = await fetch(`/api/auth/${providerId}/disconnect`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("disconnect failed");
      toast.success(`${displayName} disconnected`);
      router.refresh();
    } catch {
      toast.error(`Failed to disconnect ${displayName}`);
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 w-full" style={{ backgroundColor: brandColor }} />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{displayName}</h3>
            {descKey && (
              <p className="mt-1 text-sm text-muted-foreground">{t(descKey)}</p>
            )}
          </div>
          {connected && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              aria-label="Connected"
            >
              <Check className="size-3" />
              Connected
            </span>
          )}
        </div>

        {connected && connection?.provider_display_name && (
          <p className="text-sm">
            {t("connectedAs", { name: connection.provider_display_name })}
          </p>
        )}

        <div className="flex items-center gap-2">
          {connected ? (
            <Button
              variant="outline"
              onClick={onDisconnect}
              disabled={pending}
            >
              {t("disconnect")}
            </Button>
          ) : (
            <Button
              onClick={onConnect}
              disabled={pending}
              style={{
                backgroundColor: brandColor,
                color: "#fff",
              }}
            >
              <ExternalLink className="mr-1.5 size-4" />
              {t("connect")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
