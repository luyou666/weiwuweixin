'use client';

/* ============================================================
   围物为心 — 同好按钮（长按压感）
   长按 0.3–2 秒，压感映射为 0–1 的 like_weight
   ============================================================ */

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface RaporButtonProps {
  onWeightChange: (weight: number) => void;
  disabled?: boolean;
}

/** 最短按压 300ms，最长 2000ms 映射到 0–1 */
const MIN_PRESS_MS = 300;
const MAX_PRESS_MS = 2000;

export function RaporButton({ onWeightChange, disabled }: RaporButtonProps) {
  const t = useTranslations('scoring.complete');
  const [isPressed, setIsPressed] = useState(false);
  const [weight, setWeight] = useState(0);
  const pressStartRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const committedRef = useRef(false);

  /* ── 按压中持续更新 weight ── */
  const updateWeight = useCallback(() => {
    const elapsed = Date.now() - pressStartRef.current;
    const raw = Math.min(1, Math.max(0, (elapsed - MIN_PRESS_MS) / (MAX_PRESS_MS - MIN_PRESS_MS)));
    setWeight(raw);
    onWeightChange(raw);

    if (elapsed < MAX_PRESS_MS) {
      rafRef.current = requestAnimationFrame(updateWeight);
    }
  }, [onWeightChange]);

  /* ── 按下开始 ── */
  const handlePressStart = useCallback(() => {
    if (disabled) return;
    committedRef.current = false;
    pressStartRef.current = Date.now();
    setIsPressed(true);
    setWeight(0);
    onWeightChange(0);
    rafRef.current = requestAnimationFrame(updateWeight);
  }, [disabled, onWeightChange, updateWeight]);

  /* ── 松开结束 ── */
  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    // 只有超过最小按压时间才生效
    const elapsed = Date.now() - pressStartRef.current;
    if (elapsed >= MIN_PRESS_MS) {
      committedRef.current = true;
    } else {
      setWeight(0);
      onWeightChange(0);
    }
  }, [onWeightChange]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ── 按钮 ── */}
      <motion.button
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-shadow select-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        `}
        style={{
          border: `3px solid ${weight > 0 ? 'var(--vermilion)' : 'var(--ink-100)'}`,
          backgroundColor: weight > 0
            ? `rgba(226,85,63,${0.05 + weight * 0.15})`
            : 'transparent',
          boxShadow: isPressed
            ? `0 0 ${20 + weight * 30}px rgba(226,85,63,${0.2 + weight * 0.3})`
            : 'none',
        }}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
      >
        {/* 墨滴脉冲动画 */}
        <AnimatePresence>
          {isPressed && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '2px solid var(--vermilion)',
                opacity: 0.4,
              }}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* 心形 / 共鸣文字 */}
        <span
          className="font-[var(--font-heading)] font-bold relative z-10"
          style={{
            fontSize: 'var(--text-2xl)',
            color: weight > 0 ? 'var(--vermilion)' : 'var(--ink-300)',
            transition: 'color 0.3s ease',
          }}
        >
          心
        </span>
      </motion.button>

      {/* ── 压感指示器 ── */}
      <div className="flex flex-col items-center gap-1">
        {weight > 0 && (
          <motion.div
            className="h-1.5 w-24 rounded-full overflow-hidden"
            style={{ background: 'var(--ink-100)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--vermilion)' }}
              animate={{ width: `${weight * 100}%` }}
              transition={{ duration: 0.05 }}
            />
          </motion.div>
        )}

        <span
          className="text-[var(--text-xs)]"
          style={{ color: 'var(--ink-500)' }}
        >
          {isPressed ? t('likeActive') : t('likeHint')}
        </span>

        {committedRef.current && weight > 0 && (
          <motion.span
            className="font-[var(--font-mono)] text-[var(--text-xs)]"
            style={{ color: 'var(--vermilion)' }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {weight.toFixed(2)}
          </motion.span>
        )}
      </div>
    </div>
  );
}