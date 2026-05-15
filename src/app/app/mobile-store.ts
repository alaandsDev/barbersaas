import { create } from "zustand";

type State = {
  mobileOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useMobileMenu = create<State>((set) => ({
  mobileOpen: false,
  open: () => set({ mobileOpen: true }),
  close: () => set({ mobileOpen: false }),
  toggle: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
}));
