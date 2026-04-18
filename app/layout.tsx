import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { PlayerProvider } from "@/components/providers/PlayerProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getServerSupabase } from "@/lib/supabase/server";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — All your music, one app`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "UniTune unifies Spotify and SoundCloud into one elegant, cross-platform music player.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const supabase = await getServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryProvider>
              <SupabaseProvider initialSession={session}>
                <TooltipProvider delayDuration={200}>
                  <PlayerProvider>{children}</PlayerProvider>
                </TooltipProvider>
              </SupabaseProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
