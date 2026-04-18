import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/constants";
import type { Locale } from "@/lib/constants";

export const locales = SUPPORTED_LOCALES;
export const defaultLocale: Locale = DEFAULT_LOCALE;

export function isSupportedLocale(x: unknown): x is Locale {
  return typeof x === "string" && (locales as readonly string[]).includes(x);
}
