'use client';

/* ============================================================
   围物为心 — 单条目打分卡片
   一屏一个条目，每维度滑杆评分
   ============================================================ */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Slider, Button } from '@weiwuweixin/ui';
import type { Dimension } from '@weiwuweixin/scoring';

interface SingleItemScoringProps {
  item: { id: string; name: string };
  dimensions: Dimension[];
  scores: Record<string, number>;
  onScoreChange: (dimId: string, value: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onFinish: () => void;
  isLast: boolean;
  currentIndex: number;
  totalItems: number;
}

export function SingleItemScoring({
  item,
  dimensions,
  scores,
  onScoreChange,
  onPrev,
  onNext,
  onFinish,
  isLast,
  currentIndex,
  totalItems,
}: SingleItemScoringProps) {
  const t = useTranslations('scoring.flow');

  const handleSliderChange = useCallback(
    (dimId: string, value: number) => {
      onScoreChange(dimId, value);
    },
    [onScoreChange],
  );

  /* ── 综合分 ── */
  const avgScore = (() => {
    const vals = dimensions.map((d) => scores[d.id] ?? 0);
    const total = vals.reduce((a, b) => a + b, 0);
    return dimensions.length > 0 ? Math.round(total / dimensions.length) : 0;
  })();

  return (
    <div className="flex flex-col gap-6 py-8">
      {/* ── 条目名 + 综合分印章 ── */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2
            className="font-[var(--font-heading)] font-bold"
            style={{ fontSize: 'var(--text-3xl)', color: 'var(--ink-900)' }}
          >
            {item.name}
          </h2>
          <p
            className="mt-1 text-[var(--text-xs)]"
            style={{ color: 'var(--ink-300)' }}
          >
            {t('skipHint')}
          </p>
        </div>

        {/* 综合分小印章 */}
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          key={avgScore}
        >
          <div
            className="relative w-16 h-16 flex items-center justify-center rounded-lg"
            style={{
              border: `3px solid ${avgScore > 0 ? 'var(--vermilion)' : 'var(--ink-100)'}`,
              transform: 'rotate(2deg)',
            }}
          >
            <div
              className="absolute inset-1 rounded"
              style={{
                border: `1.5px solid ${avgScore > 0 ? 'var(--vermilion)' : 'var(--ink-100)'}`,
                backgroundColor: avgScore > 0 ? 'rgba(226,85,63,0.06)' : 'transparent',
              }}
            />
            <span
              className="relative font-[var(--font-heading)] font-bold"
              style={{
                fontSize: 'var(--text-xl)',
                color: avgScore > 0 ? 'var(--vermilion)' : 'var(--ink-300)',
              }}
            >
              {avgScore || '—'}
            </span>
          </div>
          <span
            className="mt-1 text-[var(--text-xs)]"
            style={{ color: 'var(--ink-300)' }}
          >
            综合分
          </span>
        </motion.div>
      </motion.div>

      {/* ── 墨滴晕开装饰线 ── */}
      <motion.div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--ink-100) 20%, var(--ink-100) 80%, transparent 100%)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      />

      {/* ── 维度滑杆 ── */}
      <div className="flex flex-col gap-5">
        {dimensions.map((dim, dimIndex) => {
          const currentValue = scores[dim.id] ?? 0;
          const scale = dim.scale ?? 100;

          return (
            <motion.div
              key={dim.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.1 + dimIndex * 0.06,
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className="flex flex-col gap-2"
            >
              {/* 维度名 + 当前分数 */}
              <div className="flex items-center justify-between">
                <span
                  className="font-[var(--font-heading)] font-medium"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--ink-700)',
                  }}
                >
                  {dim.name}
                </span>
                <span
                  className="font-[var(--font-mono)]"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: currentValue > 0 ? 'var(--vermilion)' : 'var(--ink-300)',
                  }}
                >
                  {currentValue} / {scale}
                </span>
              </div>

              {/* 滑杆 */}
              <Slider
                value={currentValue}
                min={0}
                max={scale}
                step={1}
                size="md"
                onChange={(v: number) => handleSliderChange(dim.id, v)}
                showLabel={false}
                inkEffect
                accentColor={currentValue > 0 ? 'var(--vermilion)' : 'var(--ink-300)'}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ── 导航按钮 ── */}
      <motion.div
        className="flex items-center justify-between pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + dimensions.length * 0.06 }}
      >
        <div className="flex gap-3">
          {onPrev && (
            <Button size="md" onClick={onPrev}>
              {t('prevItem')}
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {/* 条目指示点 */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: totalItems }, (_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: i === currentIndex
                    ? 'var(--vermilion)'
                    : i < currentIndex
                      ? 'var(--celadon)'
                      : 'var(--ink-100)',
                  transform: i === currentIndex ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {isLast ? (
            <Button size="md" onClick={onFinish}>
              {t('finish')}
            </Button>
          ) : (
            onNext && (
              <Button size="md" onClick={onNext}>
                {t('nextItem')}
              </Button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}