"use client";

import * as React from "react";
import { getPlayerController } from "@/lib/player/controller";
import { usePlayerStore } from "@/stores/player";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const controller = getPlayerController();
    const unsub = controller.subscribe((snapshot) => {
      usePlayerStore.getState().applySnapshot(snapshot);
    });
    return () => unsub();
  }, []);
  return <>{children}</>;
}
