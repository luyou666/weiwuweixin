/**
 * 围物为心 — 用户状态 Store
 *
 * 首次访问时在 localStorage 生成 uuid 作为 deviceId，
 * 存入 Zustand store，供 API client 使用。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEVICE_ID_KEY = 'wwx-device-id';

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export interface UserState {
  deviceId: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  setNickname: (nickname: string) => void;
  setAvatarUrl: (avatarUrl: string) => void;
  setBio: (bio: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      deviceId: '',
      nickname: '',
      avatarUrl: '',
      bio: '',
      setNickname: (nickname) => set({ nickname }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      setBio: (bio) => set({ bio }),
    }),
    {
      name: 'wwx-user',
    },
  ),
);

/**
 * 确保 deviceId 已写入 store（修复首次访问时 onRehydrateStorage state 为 null 的问题）。
 * 应在客户端根组件的 useEffect 里调用一次。
 */
export function ensureDeviceId() {
  if (typeof window === 'undefined') return;
  const id = getOrCreateDeviceId();
  if (useUserStore.getState().deviceId !== id) {
    useUserStore.setState({ deviceId: id });
  }
}