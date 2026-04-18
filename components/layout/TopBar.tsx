"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Search, User, LogOut, Settings, Command as CommandIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useUIStore } from "@/stores/ui";

function isMac() {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.platform);
}

export function TopBar() {
  const router = useRouter();
  const t = useTranslations("nav");
  const tSearch = useTranslations("search");
  const tSettings = useTranslations("settings.account");
  const { supabase, user } = useSupabase();
  const openCommand = useUIStore((s) => s.setCommandMenuOpen);
  const [mac, setMac] = React.useState(false);

  React.useEffect(() => {
    setMac(isMac());
  }, []);

  const handleSignOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [supabase, router]);

  const initials = React.useMemo(() => {
    const name = user?.user_metadata?.full_name || user?.email || "U";
    return name
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s[0]?.toUpperCase())
      .join("") || "U";
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.forward()}
          aria-label="Forward"
        >
          <ChevronRight />
        </Button>
      </div>

      <button
        onClick={() => openCommand(true)}
        className="group ml-2 flex h-9 flex-1 max-w-md items-center gap-2 rounded-full border bg-muted/40 px-4 text-sm text-muted-foreground transition hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left truncate">{tSearch("placeholder")}</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          {mac ? <CommandIcon className="size-3" /> : <span>Ctrl</span>}
          <span>K</span>
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Profile menu"
            >
              <Avatar className="size-8">
                {user?.user_metadata?.avatar_url ? (
                  <AvatarImage
                    src={user.user_metadata.avatar_url}
                    alt=""
                  />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">
              {user?.email || "Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/account">
                <User className="mr-2 size-4" />
                {t("account")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/connections">
                <Settings className="mr-2 size-4" />
                {t("connections")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 size-4" />
              {tSettings("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
