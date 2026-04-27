'use client';

/**
 * 围物为心 — 作者打分 评分矩阵组件
 * 条目 × 维度 矩阵，每格一个 Slider
 * 行标题 → 条目名, 列标题 → 维度名
 * 水墨贴纸风，横向滚动友好
 */

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@weiwuweixin/ui';
import type { Item, Dimension } from '@weiwuweixin/scoring';
import { useScoringStore } from '../stores/scoring-store';

/* ============================================================
   Props
   ============================================================ */
export interface ScoringMatrixProps {
  /** 待评分条目列表 */
  items: Item[];
  /** 评分维度列表 */
  dimensions: Dimension[];
  /** 是否只读（查看模式） */
  readOnly?: boolean;
  /** 自定义类名 */
  className?: string;
}

/* ============================================================
   综合分预览计算
   ============================================================ */
function computeRowTotal(
  itemId: string,
  dimensions: Dimension[],
  authorScores: Record<string, Record<string, number>>,
): number {
  const dimScores = authorScores[itemId] ?? {};
  let weightedSum = 0;
  let totalWeight = 0;

  for (const dim of dimensions) {
    const score = dimScores[dim.id] ?? 0;
    const scale = dim.scale ?? 100;
    const normalized = (score / scale) * 100; // 归一化到100分制
    weightedSum += normalized * dim.weight;
    totalWeight += dim.weight;
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
}

/* ============================================================
   综合分小印章
   ============================================================ */
function ScoreBadge({ percentage }: { percentage: number }) {
  const hasScore = percentage > 0;
  const color = hasScore ? 'var(--vermilion)' : 'var(--ink-300)';
  const display = hasScore ? percentage.toFixed(1) : '—';

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-w-[56px] gap-0.5"
      initial={{ scale: 0.9, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
    >
      <span
        className="font-[var(--font-heading)] font-bold leading-none"
        style={{ fontSize: 'var(--text-lg)', color }}
      >
        {display}
      </span>
      <span
        className="text-[var(--text-xs)] leading-none opacity-60"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        综合分
      </span>
    </motion.div>
  );
}

/* ============================================================
   ScoringMatrix 主组件
   ============================================================ */
export function ScoringMatrix({
  items,
  dimensions,
  readOnly = false,
  className = '',
}: ScoringMatrixProps) {
  const authorScores = useScoringStore((s) => s.authorScores);
  const setScore = useScoringStore((s) => s.setScore);

  /* 每列最小宽度（根据维度名长度自适应） */
  const colMinWidth = useMemo(() => {
    const maxNameLen = Math.max(...dimensions.map((d) => d.name.length), 4);
    return Math.max(140, maxNameLen * 16 + 40);
  }, [dimensions]);

  const handleChange = useCallback(
    (itemId: string, dimensionId: string, value: number) => {
      if (!readOnly) {
        setScore(itemId, dimensionId, value);
      }
    },
    [readOnly, setScore],
  );

  return (
    <div className={`weiwu-scoring-matrix w-full ${className}`}>
      {/* 横向滚动容器 */}
      <div className="overflow-x-auto overflow-y-visible -mx-2 px-2 scrollbar-thin scrollbar-thumb-[var(--ink-200)] scrollbar-track-transparent">
        <div
          className="relative min-w-fit"
          style={{ minWidth: `${colMinWidth * dimensions.length + 180}px` }}
        >
          {/* ── 矩阵表头 ── */}
          <div className="sticky top-0 z-10 flex items-end pb-2">
            {/* 行标题占位 */}
            <div className="flex-shrink-0 w-[100px]" />

            {/* 维度列标题 */}
            {dimensions.map((dim, colIdx) => (
              <div
                key={dim.id}
                className="flex-shrink-0 px-2 text-center"
                style={{ minWidth: `${colMinWidth}px` }}
              >
                <motion.div
                  className="inline-flex flex-col items-center gap-0.5"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIdx * 0.05, type: 'spring', stiffness: 200, damping: 18 }}
                >
                  <span
                    className="font-[var(--font-heading)] text-[var(--color-text-primary)]"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    {dim.name}
                  </span>
                  <span
                    className="text-[var(--text-xs)] opacity-50"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {dim.weight}权重 · {dim.scale ?? 100}分制
                  </span>
                </motion.div>
              </div>
            ))}

            {/* 综合分列标题 */}
            <div className="flex-shrink-0 w-[70px] text-center">
              <span
                className="font-[var(--font-heading)] text-[var(--text-xs)] opacity-50"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                综合
              </span>
            </div>
          </div>

          {/* ── 矩阵行 ── */}
          <AnimatePresence mode="popLayout">
            {items.map((item, rowIdx) => {
              const rowTotal = computeRowTotal(item.id, dimensions, authorScores);

              return (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-2 py-3 border-b border-[var(--color-border)] last:border-b-0"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{
                    delay: rowIdx * 0.04,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                >
                  {/* 行标题 — 条目名 */}
                  <div
                    className="flex-shrink-0 w-[100px] pr-2"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <div
                      className="text-[var(--text-sm)] text-[var(--color-text-primary)] font-semibold truncate"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                  </div>

                  {/* 各维度打分 Slider */}
                  {dimensions.map((dim) => {
                    const currentValue = authorScores[item.id]?.[dim.id] ?? 0;
                    const scale = dim.scale ?? 100;

                    return (
                      <div
                        key={dim.id}
                        className="flex-shrink-0 px-2"
                        style={{ minWidth: `${colMinWidth}px` }}
                      >
                        <Slider
                          value={currentValue}
                          min={0}
                          max={scale}
                          step={1}
                          size="sm"
                          onChange={(v: number) => handleChange(item.id, dim.id, v)}
                          disabled={readOnly}
                          showLabel={false}
                          inkEffect={!readOnly}
                          accentColor={currentValue > 0 ? 'var(--vermilion)' : 'var(--ink-300)'}
                        />
                        {/* 当前分数标注 */}
                        <div
                          className="text-center mt-1 font-[var(--font-mono)] text-[var(--text-xs)]"
                          style={{
                            color: currentValue > 0 ? 'var(--vermilion)' : 'var(--ink-300)',
                          }}
                        >
                          {currentValue}/{scale}
                        </div>
                      </div>
                    );
                  })}

                  {/* 综合分预览 */}
                  <div className="flex-shrink-0 w-[70px] flex justify-center">
                    <ScoreBadge percentage={rowTotal} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ScoringMatrix;