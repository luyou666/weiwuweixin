/**
 * Toast Store — 全局 toast 通知管理
 *
 * 轻量 Zustand store，任何组件都可以触发 toast。
 * Toast 渲染组件在 layout 中全局注入。
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  /** 显示一条 toast，3秒后自动消失 */
  show: (message: string, type?: ToastType) => void;
  /** 移除指定 toast */
  dismiss: (id: string) => void;
  /** 快捷：成功提示 */
  success: (message: string) => void;
  /** 快捷：错误提示 */
  error: (message: string) => void;
  /** 快捷：信息提示 */
  info: (message: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message, type = 'info') => {
    const id = `toast-${++counter}-${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  success: (message) => {
    const store = useToastStore.getState();
    store.show(message, 'success');
  },

  error: (message) => {
    const store = useToastStore.getState();
    store.show(message, 'error');
  },

  info: (message) => {
    const store = useToastStore.getState();
    store.show(message, 'info');
  },
}));
