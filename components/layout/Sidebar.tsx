"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  Search,
  Library,
  Heart,
  ListMusic,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Music2,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui";

interface NavItem {
  href: string;
  labelKey: "home" | "search" | "library";
  icon: React.ComponentType<{ className?: string }>;
}

const mainNav: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/search", labelKey: "search", icon: Search },
  { href: "/library", labelKey: "library", icon: Library },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const tLib = useTranslations("library");
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "flex h-full flex-col border-r bg-card/40 backdrop-blur transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2 px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label={APP_NAME}
        >
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[color:var(--color-brand-spotify)] to-[color:var(--color-brand-soundcloud)] text-white">
            <Music2 className="size-4" />
          </div>
          {!collapsed && <span>{APP_NAME}</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <Separator />

      <nav className={cn("flex flex-col gap-0.5 p-2", collapsed && "items-center")}>
        {mainNav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground",
                collapsed && "w-11 justify-center px-0",
              )}
              aria-current={active ? "page" : undefined}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <>
          <Separator />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {tLib("title")}
            </span>
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              aria-label={tLib("newPlaylist")}
            >
              <Link href="/library/playlists?new=1">
                <Plus />
              </Link>
            </Button>
          </div>
          <ScrollArea className="flex-1 px-2 pb-2">
            <div className="flex flex-col gap-0.5">
              <Link
                href="/library/liked"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  pathname === "/library/liked" &&
                    "bg-accent text-accent-foreground",
                )}
              >
                <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                  <Heart className="size-4" />
                </div>
                <span className="truncate">{t("liked")}</span>
              </Link>
              <Link
                href="/library/playlists"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground",
                  "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <div className="grid h-8 w-8 place-items-center rounded-md bg-muted">
                  <ListMusic className="size-4" />
                </div>
                <span className="truncate">{t("playlists")}</span>
              </Link>
            </div>
          </ScrollArea>
        </>
      )}

      {collapsed && <div className="flex-1" />}
    </aside>
  );
}
