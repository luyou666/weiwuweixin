'use client';

/* ============================================================
   围物为心 — 维度选择组件
   选择「沿用作者维度」或「标准五维共鸣」
   ============================================================ */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Dimension } from '@weiwuweixin/scoring';
import { Button } from '@weiwuweixin/ui';

type DimMode = 'author' | 'standard';

interface DimensionChoiceProps {
  authorDimensions: Dimension[];
  standardDimensions: Dimension[];
  authorName: string;
  onChoose: (mode: DimMode) => void;
}

export function DimensionChoice({
  authorDimensions,
  standardDimensions,
  authorName,
  onChoose,
}: DimensionChoiceProps) {
  const t = useTranslations('scoring.dimensionChoice');
  const [selected, setSelected] = useState<DimMode | null>(null);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* ── 标题 ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2
          className="font-[var(--font-heading)] font-bold mb-3"
          style={{ fontSize: 'var(--text-2xl)', color: 'var(--ink-900)' }}
        >
          {t('title')}
        </h2>
        <p
          className="font-[var(--font-body)]"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}
        >
          {t('guide')}
        </p>
      </motion.div>

      {/* ── 两个选项卡片 ── */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* 沿用作者维度 */}
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setSelected('author')}
          className={`
            flex-1 p-6 rounded-xl border-2 text-left transition-all
            ${selected === 'author'
              ? 'border-[var(--vermilion)] shadow-lg'
              : 'border-[var(--ink-100)] hover:border-[var(--ink-300)]'
            }
          `}
          style={{
            background: selected === 'author'
              ? 'linear-gradient(135deg, rgba(226,85,63,0.06) 0%, rgba(226,85,63,0.02) 100%)'
              : 'var(--paper)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            {/* 印章风格图标 */}
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded text-[var(--text-sm)] font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--vermilion)',
                border: '2px solid var(--vermilion)',
              }}
            >
              承
            </span>
            <h3
              className="font-[var(--font-heading)] font-semibold"
              style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}
            >
              {t('authorDims')}
            </h3>
          </div>
          <p
            className="mb-4"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}
          >
            {t('authorDimsDesc')}
          </p>
          <div className="flex flex-wrap gap-2">
            {authorDimensions.map((dim) => (
              <span
                key={dim.id}
                className="px-2 py-1 rounded-md text-[var(--text-xs)]"
                style={{
                  background: 'var(--rice)',
                  color: 'var(--ink-700)',
                  border: '1px solid var(--ink-100)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {dim.name}
              </span>
            ))}
          </div>
          <p
            className="mt-3 text-[var(--text-xs)]"
            style={{ color: 'var(--ink-300)' }}
          >
            {authorName} 的维度
          </p>
        </motion.button>

        {/* 标准五维共鸣 */}
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          onClick={() => setSelected('standard')}
          className={`
            flex-1 p-6 rounded-xl border-2 text-left transition-all
            ${selected === 'standard'
              ? 'border-[var(--celadon)] shadow-lg'
              : 'border-[var(--ink-100)] hover:border-[var(--ink-300)]'
            }
          `}
          style={{
            background: selected === 'standard'
              ? 'linear-gradient(135deg, rgba(127,179,163,0.08) 0%, rgba(127,179,163,0.02) 100%)'
              : 'var(--paper)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded text-[var(--text-sm)] font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--celadon-dark)',
                border: '2px solid var(--celadon)',
              }}
            >
              共
            </span>
            <h3
              className="font-[var(--font-heading)] font-semibold"
              style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}
            >
              {t('standardDims')}
            </h3>
          </div>
          <p
            className="mb-4"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}
          >
            {t('standardDimsDesc')}
          </p>
          <div className="flex flex-wrap gap-2">
            {standardDimensions.map((dim) => (
              <span
                key={dim.id}
                className="px-2 py-1 rounded-md text-[var(--text-xs)]"
                style={{
                  background: 'var(--rice)',
                  color: 'var(--ink-700)',
                  border: '1px solid var(--ink-100)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {dim.name}
              </span>
            ))}
          </div>
        </motion.button>
      </div>

      {/* ── 开始按钮 ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          disabled={!selected}
          onClick={() => selected && onChoose(selected)}
          className="min-w-[200px]"
        >
          {t('start')}
        </Button>
      </motion.div>
    </div>
  );
}