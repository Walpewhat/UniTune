"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandMenu } from "./CommandMenu";
import { BottomPlayer } from "@/components/player/BottomPlayer";
import { QueuePanel } from "@/components/player/QueuePanel";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
      <BottomPlayer />
      <QueuePanel />
      <CommandMenu />
    </div>
  );
}
