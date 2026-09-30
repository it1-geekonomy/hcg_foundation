"use client";

import { create } from "zustand";

export type ConfirmTone = "danger" | "default";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type ConfirmState = {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
  ask: (options: ConfirmOptions) => Promise<boolean>;
  close: (result: boolean) => void;
};

export const useCmsConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  ask: (options) =>
    new Promise<boolean>((resolve) => {
      const prev = get().resolve;
      if (prev) prev(false);
      set({ open: true, options, resolve });
    }),
  close: (result) => {
    const { resolve } = get();
    set({ open: false, options: null, resolve: null });
    resolve?.(result);
  },
}));

export function cmsConfirm(options: ConfirmOptions): Promise<boolean> {
  return useCmsConfirmStore.getState().ask(options);
}
