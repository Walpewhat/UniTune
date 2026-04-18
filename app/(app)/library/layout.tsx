import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("library");
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <header className="mb-6 flex flex-wrap items-center gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <nav className="flex gap-1 text-sm">
          <Link
            href="/library/liked"
            className="rounded-md px-3 py-1.5 hover:bg-accent"
          >
            {t("tabs.liked")}
          </Link>
          <Link
            href="/library/playlists"
            className="rounded-md px-3 py-1.5 hover:bg-accent"
          >
            {t("tabs.playlists")}
          </Link>
          <Link
            href="/library/albums"
            className="rounded-md px-3 py-1.5 hover:bg-accent"
          >
            {t("tabs.albums")}
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
