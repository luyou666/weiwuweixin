'use client';

/**
 * 围物为心 — 暗色模式切换按钮
 * 简约水墨风格：太阳 / 月亮图标
 * CSS transition 平滑过渡
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './theme-provider';

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button type="button"
      onClick={toggleTheme}
      className={[
        'relative inline-flex items-center justify-center',
        'w-9 h-9 rounded-[var(--radius-md)]',
        'border border-[var(--color-border)]',
        'bg-[var(--color-bg-elevated)]',
        'text-[var(--color-text-secondary)]',
        'hover:text-[var(--color-text-primary)]',
        'hover:border-[var(--ink-300)]',
        'transition-[color,border-color,background-color]',
        'duration-[var(--duration-normal)]',
        'cursor-pointer',
        'overflow-hidden',
        className,
      ].join(' ')}
      aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
      title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 250, damping: 15 }}
            className="flex items-center justify-center"
          >
            <SunIcon />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 250, damping: 15 }}
            className="flex items-center justify-center"
          >
            <MoonIcon />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default ThemeToggle;