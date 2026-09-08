import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  slug?: string | null;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setSession: (payload: { accessToken: string; user: AuthUser }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setSession: ({ accessToken, user }) =>
        set({
          accessToken,
          user,
          isAuthenticated: true,
        }),
      clearSession: () =>
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "hcg-admin-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
