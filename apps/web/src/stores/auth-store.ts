/**
 * Auth Store – JWT 认证状态管理
 *
 * 使用 Zustand + persist 将 JWT tokens 保存到 localStorage
 * 支持自动刷新（refreshAccessToken）和登出逻辑
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/* ============================================================
   类型
   ============================================================ */
export interface AuthUser {
  id: string;
  handle: string;
  nickname: string | null;
  avatarUrl: string | null;
  email: string;
  bio: string | null;
  isAuthenticated: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setUser: (u: AuthUser | null) => void;
  setAccessToken: (t: string | null) => void;
  setRefreshToken: (t: string | null) => void;
  setIsHydrated: (v: boolean) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

/* ============================================================
   Store 定义
   ============================================================ */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,

      setUser: (u) => set({ user: u }),
      setAccessToken: (t) => set({ accessToken: t }),
      setRefreshToken: (t) => set({ refreshToken: t }),
      setIsHydrated: (v) => set({ isHydrated: v }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isHydrated: true,
        }),

      refreshAccessToken: async () => {
        const token = get().refreshToken;
        if (!token) {
          get().logout();
          return false;
        }
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
          const res = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ refreshToken: token }),
          });
          if (!res.ok) throw new Error('Refresh failed');
          const data = await res.json();
          set({ accessToken: data.accessToken });
          if (data.user) set({ user: data.user });
          return true;
        } catch {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isHydrated: true,
          });
          return false;
        }
      },
    }),
    {
      name: 'wwx-auth',
      storage: createJSONStorage(() => sessionStorage),  // 🔒 P2: 关闭标签即清除
      onRehydrateStorage: () => (state) => {
        if (state) state.setIsHydrated(true);
      },
    },
  ),
);

