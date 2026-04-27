'use client';

/**
 * 围物为心 — 条目评分详情弹窗
 * 展示某一条目的各维度分数、共识度等详细信息
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, ConfidenceSeal } from '@weiwuweixin/ui';
import { useTranslations } from 'next-intl';
import type { RankingItem } from './ranking-table';

/* ============================================================
   Types
   ============================================================ */

export interface ScoreDetailDialogProps {
  item: RankingItem | null;
  open: boolean;
  onClose: () => void;
}

/* ============================================================
   维度分数行
   ============================================================ */

function DimensionRow({ name, score, maxScore = 10 }: { name: string; score: number; maxScore?: number }) {
  const pct = Math.min((score / maxScore) * 100, 100);

  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span
        className="text-[var(--text-sm)] min-w-[80px]"
        style={{ color: 'var(--ink-700)' }}
      >
        {name}
      </span>
      <div className="flex-1 h-[6px] rounded-[var(--radius-pill, 999px)] overflow-hidden" style={{ background: 'var(--rice)' }}>
        <motion.div
          className="h-full rounded-[var(--radius-pill, 999px)]"
          style={{ background: 'var(--vermilion)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
      <span
        className="font-[var(--font-mono)] font-semibold text-[var(--text-sm)] min-w-[32px] text-right"
        style={{ color: 'var(--ink-900)' }}
      >
        {score.toFixed(1)}
      </span>
    </div>
  );
}

/* ============================================================
   ScoreDetailDialog 主组件
   ============================================================ */

export function ScoreDetailDialog({ item, open, onClose }: ScoreDetailDialogProps) {
  const t = useTranslations('listDetail');

  if (!item) return null;

  const confidenceNormalized = item.confidence !== undefined
    ? Math.min(Math.max(item.confidence / 100, 0), 1)
    : 0.5;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 弹窗主体 */}
          <motion.div
            className="fixed inset-x-4 top-[10vh] z-50 mx-auto max-w-md"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <Card interactive={false} textured size="lg">
              {/* 头部：条目名 + 关闭 */}
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="font-[var(--font-heading)] text-[var(--text-lg)]"
                  style={{ color: 'var(--ink-900)' }}
                >
                  {item.name}
                </h2>
                <button
                  onClick={onClose}
                  className="text-[var(--ink-300)] hover:text-[var(--ink-900)] transition-colors text-lg leading-none p-1"
                >
                  ✕
                </button>
              </div>

              {/* 综合分 + 共识度 */}
              <div className="flex items-center gap-4 mb-4 p-3 rounded-[var(--radius-md, 8px)]" style={{ background: 'var(--rice)' }}>
                <div className="text-center flex-1">
                  <div
                    className="font-[var(--font-mono)] font-bold text-[var(--text-2xl, 1.5rem)]"
                    style={{ color: 'var(--vermilion)' }}
                  >
                    {item.overallScore.toFixed(1)}
                  </div>
                  <div className="text-[var(--text-xs)] text-[var(--ink-500)]">
                    {t('overallScore') ?? '综合分'}
                  </div>
                </div>
                {item.confidence !== undefined && (
                  <div className="flex-1 flex flex-col items-center">
                    <ConfidenceSeal confidence={confidenceNormalized} size="sm" spinning={false} />
                    <div className="text-[var(--text-xs)] text-[var(--ink-500)] mt-1">
                      {t('confidence')}
                    </div>
                  </div>
                )}
              </div>

              {/* 各维度分数 */}
              <div>
                <h3 className="font-[var(--font-heading)] text-[var(--text-sm)] text-[var(--ink-700)] mb-2">
                  {t('dimensionScores') ?? '维度评分'}
                </h3>
                {item.dimensions.map((dim) => (
                  <DimensionRow key={dim.name} name={dim.name} score={dim.score} />
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={onClose}>
                  {t('close') ?? '关闭'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ScoreDetailDialog;