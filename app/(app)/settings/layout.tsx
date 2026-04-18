import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");
  const tSettings = await getTranslations("settings");

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">{tSettings("title")}</p>
      </header>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <nav className="flex md:flex-col gap-1 text-sm">
          <Link
            href="/settings/account"
            className="rounded-md px-3 py-2 hover:bg-accent"
          >
            {t("account")}
          </Link>
          <Link
            href="/settings/connections"
            className="rounded-md px-3 py-2 hover:bg-accent"
          >
            {t("connections")}
          </Link>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
