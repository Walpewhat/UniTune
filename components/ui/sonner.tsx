"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme = "system" } = useTheme();
  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-card text-foreground border-border shadow-lg rounded-xl",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      position="bottom-center"
      closeButton
      richColors
    />
  );
}
