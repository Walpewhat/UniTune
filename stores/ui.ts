"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  commandMenuOpen: boolean;
  setSidebarCollapsed(v: boolean): void;
  toggleSidebar(): void;
  setCommandMenuOpen(v: boolean): void;
  toggleCommandMenu(): void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandMenuOpen: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandMenuOpen: (v) => set({ commandMenuOpen: v }),
      toggleCommandMenu: () =>
        set((s) => ({ commandMenuOpen: !s.commandMenuOpen })),
    }),
    { name: "unitune.ui", partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }) },
  ),
);
