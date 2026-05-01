'use client';

/**
 * 围物为心 — 情感筛选组件
 *
 * 三个按钮：正向（青瓷绿）/ 全部（墨灰）/ 负向（朱砂红淡化）
 * 计数气泡 + 选中态水墨下划线
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { SentimentType } from '@weiwuweixin/shared';

/* ============================================================
   水墨色板
   ============================================================ */

const SENTIMENT_COLORS: Record<SentimentType | 'all', { text: string; bg: string; border: string; active: string }> = {
  positive: {
    text: '#4a8c6f',
    bg: 'rgba(127,179,163,0.12)',
    border: 'rgba(127,179,163,0.3)',
    active: '#7fb3a3', // 青瓷绿
  },
  neutral: {
    text: '#6b7280',
    bg: 'rgba(107,114,128,0.08)',
    border: 'rgba(107,114,128,0.2)',
    active: '#9ca3af', // 墨灰
  },
  negative: {
    text: '#c0392b',
    bg: 'rgba(192,57,43,0.08)',
    border: 'rgba(192,57,43,0.2)',
    active: '#d4736e', // 朱砂红淡化
  },
  all: {
    text: '#6b7280',
    bg: 'rgba(107,114,128,0.08)',
    border: 'rgba(107,114,128,0.2)',
    active: '#9ca3af',
  },
};

const LABELS: Record<SentimentType | 'all', { zh: string; en: string }> = {
  positive: { zh: '正向', en: 'Positive' },
  neutral: { zh: '中性', en: 'Neutral' },
  negative: { zh: '负向', en: 'Negative' },
  all: { zh: '全部', en: 'All' },
};

/* ============================================================
   Props
   ============================================================ */

export interface SentimentFilterProps {
  /** 当前选中值 */
  value: SentimentType | 'all';
  /** 变更回调 */
  onChange: (value: SentimentType | 'all') => void;
  /** 各情感计数 */
  counts: { positive: number; neutral: number; negative: number; all: number };
  className?: string;
}

/* ============================================================
   组件
   ============================================================ */

export function SentimentFilter({
  value,
  onChange,
  counts,
  className = '',
}: SentimentFilterProps) {
  const t = useTranslations('comment');

  const options: (SentimentType | 'all')[] = ['all', 'positive', 'negative'];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="radiogroup"
      aria-label={t('sentimentFilter')}
    >
      {options.map((option) => {
        const colors = SENTIMENT_COLORS[option];
        const isSelected = value === option;
        const count = counts[option === 'all' ? 'all' : option in counts ? option : 'all'] ?? 0;

        return (
          <button type="button"
            key={option}
            onClick={() => onChange(option)}
            className="relative px-3 py-1.5 rounded-[var(--radius-md, 8px)] text-sm font-medium transition-all duration-200"
            style={{
              color: isSelected ? colors.text : 'var(--ink-500)',
              background: isSelected ? colors.bg : 'transparent',
              border: `1px solid ${isSelected ? colors.border : 'transparent'}`,
              fontFamily: 'var(--font-body)',
            }}
            role="radio"
            aria-checked={isSelected}
          >
            {t(option === 'all' ? 'filterAll' : option === 'positive' ? 'filterPositive' : 'filterNegative')}
            {/* 计数气泡 */}
            <span
              className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-medium rounded-full px-1"
              style={{
                background: isSelected ? colors.active : 'var(--ink-100)',
                color: isSelected ? '#fff' : 'var(--ink-600)',
              }}
            >
              {count}
            </span>
            {/* 选中态水墨下划线 */}
            {isSelected && (
              <motion.div
                layoutId="sentiment-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                style={{ background: colors.active }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SentimentFilter;