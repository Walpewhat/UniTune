import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isSupportedLocale } from "./config";
import type { Locale } from "@/lib/constants";

export const LOCALE_COOKIE = "unitune.locale";

function pickFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const tags = header.split(",").map((part) => part.split(";")[0]!.trim());
  for (const tag of tags) {
    const base = tag.slice(0, 2).toLowerCase();
    if (isSupportedLocale(base)) return base;
  }
  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const headerLocale = pickFromAcceptLanguage(
    headerStore.get("accept-language"),
  );

  const locale: Locale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : (headerLocale ?? defaultLocale);

  const messages = (await import(`@/messages/${locale}.json`)).default;
  return { locale, messages };
});
