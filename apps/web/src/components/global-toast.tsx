'use client';

/**
 * GlobalToast — 全局 toast 渲染组件
 *
 * 在 root layout 中注入一次，监听 toastStore 并渲染所有活跃 toast。
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/stores/toast-store';

const COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-emerald-900/90',
    border: 'border-emerald-400/30',
    icon: '✓',
  },
  error: {
    bg: 'bg-ink-900/95',
    border: 'border-vermilion/30',
    icon: '✕',
  },
  info: {
    bg: 'bg-ink-800/95',
    border: 'border-vermilion-light/30',
    icon: 'ℹ',
  },
};

export function GlobalToast() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const c = COLORS[toast.type] ?? COLORS.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto px-5 py-2.5 rounded-xl shadow-xl ${c.bg} border ${c.border} backdrop-blur-xl text-sm font-medium text-paper flex items-center gap-2 cursor-pointer`}
              onClick={() => dismiss(toast.id)}
            >
              <span className="text-base">{c.icon}</span>
              {toast.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
