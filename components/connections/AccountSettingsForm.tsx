"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { SUPPORTED_LOCALES } from "@/lib/constants";

const LOCALE_COOKIE = "unitune.locale";

export function AccountSettingsForm() {
  const t = useTranslations("settings.account");
  const router = useRouter();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const { supabase } = useSupabase();

  const setLocale = (next: string) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.refresh();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded-lg border p-5">
        <Label className="text-xs font-medium uppercase text-muted-foreground">
          {t("language")}
        </Label>
        <div className="flex gap-2">
          {SUPPORTED_LOCALES.map((l) => (
            <Button
              key={l}
              variant={locale === l ? "default" : "outline"}
              size="sm"
              onClick={() => setLocale(l)}
            >
              {l.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-5">
        <Label className="text-xs font-medium uppercase text-muted-foreground">
          {t("theme")}
        </Label>
        <div className="flex gap-2">
          {(["system", "light", "dark"] as const).map((o) => (
            <Button
              key={o}
              variant={theme === o ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(o)}
            >
              {t(`themeOptions.${o}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-5">
        <Button variant="outline" onClick={signOut}>
          {t("signOut")}
        </Button>
      </div>
    </div>
  );
}
