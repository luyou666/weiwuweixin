'use client';

/**
 * useRequireAuth — 登录检查 hook
 *
 * 返回一个 checkAuth 函数，调用时检查用户是否已登录。
 * 未登录则显示 toast 提示并返回 false，已登录返回 true。
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useToastStore } from '@/stores/toast-store';
import { useTranslations } from 'next-intl';

export function useRequireAuth() {
  const t = useTranslations('auth');
  const toast = useToastStore((s) => s.info);

  const requireAuth = useCallback((): boolean => {
    const { user } = useAuthStore.getState();
    if (!user?.isAuthenticated) {
      toast(t('loginRequired') ?? '登录后继续操作');
      return false;
    }
    return true;
  }, [t, toast]);

  return requireAuth;
}
