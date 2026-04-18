"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Search, Library, Heart, Settings, Plug, Music } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui";

export function CommandMenu() {
  const router = useRouter();
  const t = useTranslations("nav");
  const tSearch = useTranslations("search");
  const open = useUIStore((s) => s.commandMenuOpen);
  const setOpen = useUIStore((s) => s.setCommandMenuOpen);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const [value, setValue] = React.useState("");

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const submitSearch = () => {
    if (!value.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={value}
        onValueChange={setValue}
        placeholder={tSearch("placeholder")}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            e.preventDefault();
            submitSearch();
          }
        }}
      />
      <CommandList>
        <CommandEmpty>{tSearch("hint")}</CommandEmpty>
        {value.trim() && (
          <CommandGroup heading={tSearch("placeholder")}>
            <CommandItem onSelect={submitSearch}>
              <Search className="mr-2 size-4" />
              {`"${value.trim()}"`}
            </CommandItem>
          </CommandGroup>
        )}
        <CommandGroup heading={t("home")}>
          <CommandItem onSelect={() => go("/")}>
            <Home className="mr-2 size-4" />
            {t("home")}
          </CommandItem>
          <CommandItem onSelect={() => go("/search")}>
            <Search className="mr-2 size-4" />
            {t("search")}
          </CommandItem>
          <CommandItem onSelect={() => go("/library")}>
            <Library className="mr-2 size-4" />
            {t("library")}
          </CommandItem>
          <CommandItem onSelect={() => go("/library/liked")}>
            <Heart className="mr-2 size-4" />
            {t("liked")}
          </CommandItem>
          <CommandItem onSelect={() => go("/library/playlists")}>
            <Music className="mr-2 size-4" />
            {t("playlists")}
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading={t("settings")}>
          <CommandItem onSelect={() => go("/settings/connections")}>
            <Plug className="mr-2 size-4" />
            {t("connections")}
          </CommandItem>
          <CommandItem onSelect={() => go("/settings/account")}>
            <Settings className="mr-2 size-4" />
            {t("account")}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
