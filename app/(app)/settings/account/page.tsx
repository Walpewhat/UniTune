import { getTranslations } from "next-intl/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { AccountSettingsForm } from "@/components/connections/AccountSettingsForm";

export default async function AccountPage() {
  const t = await getTranslations("settings.account");
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      </header>

      <div className="space-y-2 rounded-lg border p-5">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {t("email")}
        </p>
        <p className="text-sm">{user?.email ?? "—"}</p>
      </div>

      <AccountSettingsForm />
    </div>
  );
}
