import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { APP_NAME } from "@/lib/constants";
import { getServerSupabase } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const t = await getTranslations("auth.login");

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card/80 shadow-xl p-8 backdrop-blur">
      <div className="mb-6 text-center space-y-2">
        <div className="text-2xl font-bold tracking-tight">{APP_NAME}</div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <LoginForm />
    </div>
  );
}
