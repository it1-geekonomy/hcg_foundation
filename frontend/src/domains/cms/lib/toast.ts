"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  items: ToastItem[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: string) => void;
};

export const useCmsToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, tone = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((s) => ({
      items: [...s.items, { id, message: message.trim() || "Something went wrong", tone }],
    }));
    window.setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    }, 4200);
  },
  dismiss: (id) =>
    set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export const cmsToast = {
  success: (message: string) => useCmsToastStore.getState().push(message, "success"),
  error: (message: string) => useCmsToastStore.getState().push(message, "error"),
  info: (message: string) => useCmsToastStore.getState().push(message, "info"),
};
