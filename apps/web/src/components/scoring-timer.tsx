'use client';

/**
 * 围物为心 — 90秒沉浸打分计时器
 * 圆形进度环 + 「保护主观性」原则：不催促，最后10秒柔和提醒
 * 到时自动提交
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================================
   Props
   ============================================================ */
export interface ScoringTimerProps {
  /** 总时长（秒），默认 90 */
  duration?: number;
  /** 是否自动开始 */
  autoStart?: boolean;
  /** 到时回调 */
  onExpire?: () => void;
  /** 自定义类名 */
  className?: string;
}

/* ============================================================
   常量
   ============================================================ */
const CIRCLE_RADIUS = 54;
const STROKE_WIDTH = 6;
const SIZE = 140;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/* ============================================================
   ScoringTimer 组件
   ============================================================ */
export function ScoringTimer({
  duration = 90,
  autoStart = true,
  onExpire,
  className = '',
}: ScoringTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasExpired, setHasExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  /* ── 计时逻辑 ── */
  useEffect(() => {
    if (!isRunning || hasExpired) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setHasExpired(true);
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, hasExpired]);

  /* ── 统计数据 ── */
  const progress = remaining / duration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  /* ── 进度弧线端点坐标 ── */
  const endAngleDeg = progress * 360 - 90;
  const endAngleRad = (endAngleDeg * Math.PI) / 180;
  const dotX = CENTER + CIRCLE_RADIUS * Math.cos(endAngleRad);
  const dotY = CENTER + CIRCLE_RADIUS * Math.sin(endAngleRad);

  /* ── 色彩与文案阶段 ── */
  const isSoftWarning = remaining <= 10 && remaining > 0 && !hasExpired;
  const phase = hasExpired
    ? 'expired'
    : isSoftWarning
      ? 'soft-warning'
      : remaining <= 30
        ? 'calm'
        : 'flow';

  const phaseColors: Record<string, { ring: string; text: string; glow: string }> = {
    flow: {
      ring: 'var(--ink-500)',
      text: 'var(--ink-700)',
      glow: 'transparent',
    },
    calm: {
      ring: 'var(--celadon)',
      text: 'var(--ink-700)',
      glow: 'transparent',
    },
    'soft-warning': {
      ring: 'var(--amber)',
      text: 'var(--amber)',
      glow: 'rgba(212, 167, 83, 0.12)',
    },
    expired: {
      ring: 'var(--ink-300)',
      text: 'var(--ink-400)',
      glow: 'transparent',
    },
  };

  const colors = phaseColors[phase];
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  /* ── 柔和提醒文案 ── */
  const reminderText = hasExpired
    ? null
    : isSoftWarning
      ? '再斟酌片刻'
      : null;

  /* ── 刻度线数据 ── */
  const tickMarks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const outerR = CIRCLE_RADIUS + 16;
    const innerR = CIRCLE_RADIUS + 12;
    return {
      x1: CENTER + innerR * Math.cos(rad),
      y1: CENTER + innerR * Math.sin(rad),
      x2: CENTER + outerR * Math.cos(rad),
      y2: CENTER + outerR * Math.sin(rad),
    };
  });

  return (
    <div
      className={`weiwu-scoring-timer relative flex flex-col items-center justify-center ${className}`}
    >
      {/* 圆形进度环 */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* 底层光晕（柔和提醒时出现） */}
        <AnimatePresence>
          {isSoftWarning && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: colors.glow }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="relative z-10"
          aria-label={`剩余 ${remaining} 秒`}
        >
          {/* 外圈装饰刻度（水墨风格） */}
          {tickMarks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="var(--ink-200)"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}

          {/* 轨道底色 */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={STROKE_WIDTH}
            opacity="0.3"
          />

          {/* 进度弧线 */}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={colors.ring}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ transition: 'stroke 0.6s ease' }}
          />

          {/* 进度端点装饰圆点 */}
          {remaining > 0 && progress > 0.02 && (
            <circle
              cx={dotX}
              cy={dotY}
              r={STROKE_WIDTH / 2 + 1}
              fill={colors.ring}
              opacity="0.9"
              style={{ transition: 'fill 0.6s ease' }}
            />
          )}
        </svg>

        {/* 中央文字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <AnimatePresence mode="wait">
            {hasExpired ? (
              <motion.div
                key="expired"
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              >
                {/* 印章图标 */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                  style={{
                    background: 'var(--ink-100)',
                    border: '2px solid var(--ink-300)',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10L8 14L16 6"
                      stroke="var(--ink-500)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span
                  className="text-[var(--text-xs)] font-[var(--font-heading)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  已自动提交
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="timer"
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span
                  className="font-[var(--font-heading)] font-bold tabular-nums leading-none"
                  style={{
                    fontSize: 'var(--text-2xl)',
                    color: colors.text,
                    transition: 'color 0.6s ease',
                  }}
                >
                  {displayTime}
                </span>
                <AnimatePresence>
                  {reminderText && (
                    <motion.span
                      className="text-[var(--text-xs)] mt-1 font-[var(--font-heading)]"
                      style={{ color: 'var(--amber)' }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    >
                      {reminderText}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 时间已到 提示 Banner */}
      <AnimatePresence>
        {hasExpired && (
          <motion.div
            className="mt-3 px-4 py-2 rounded-[var(--radius-md)] text-center"
            style={{
              background: 'var(--ink-50)',
              border: '1px solid var(--color-border)',
            }}
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <span
              className="text-[var(--text-sm)] font-[var(--font-heading)]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              时间已到，已自动提交
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ScoringTimer;