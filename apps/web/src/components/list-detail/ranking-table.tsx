'use client';

/**
 * 围物为心 — 排名表格组件（带 FLIP 动画）
 * 展示条目名 + 综合分 + 各维度分 + 共识度标签
 * 复用 rank-preview.tsx 的 FLIP 动画与印泥风格
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Card } from '@weiwuweixin/ui';
import { useTranslations } from 'next-intl';

/* ============================================================
   Types
   ============================================================ */

export interface RankingItem {
  id: string;
  name: string;
  overallScore: number;
  dimensions: { name: string; score: number }[];
  confidence?: number;
}

export interface RankingTableProps {
  items: RankingItem[];
  onItemClick?: (item: RankingItem) => void;
  className?: string;
}

/* ============================================================
   印泥风格印章徽章（前三名）
   ============================================================ */

function SealBadge({ rank }: { rank: number }) {
  const sealColors: Record<number, { bg: string; border: string; text: string; shadow: string }> = {
    1: {
      bg: 'var(--vermilion)',
      border: 'var(--vermilion-dark, var(--vermilion))',
      text: '#FFFFFF',
      shadow: '0 2px 6px rgba(226, 85, 63, 0.4)',
    },
    2: {
      bg: 'var(--gold, #C4973B)',
      border: 'var(--gold-dark, #B08930)',
      text: '#FFFFFF',
      shadow: '0 2px 6px rgba(196, 151, 59, 0.35)',
    },
    3: {
      bg: 'var(--celadon)',
      border: 'var(--celadon-dark, var(--celadon))',
      text: '#FFFFFF',
      shadow: '0 2px 6px rgba(127, 179, 163, 0.35)',
    },
  };

  const config = sealColors[rank];
  if (!config) return null;

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center"
      style={{
        width: 32,
        height: 32,
        borderRadius: 4,
        background: config.bg,
        border: `2px solid ${config.border}`,
        color: config.text,
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        boxShadow: config.shadow,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23fff' opacity='0.08'/%3E%3C/svg%3E") repeat`,
          borderRadius: 'inherit',
        }}
      />
      <span className="relative z-10">{rank}</span>
    </div>
  );
}

/* ============================================================
   综合分柱状条
   ============================================================ */

function ScoreBar({ score, rank }: { score: number; rank: number }) {
  const barColor = rank <= 3
    ? ['var(--vermilion)', 'var(--gold, #C4973B)', 'var(--celadon)'][rank - 1]
    : 'var(--ink-300)';

  const pct = Math.min((score / 10) * 100, 100);

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className="h-[5px] rounded-[var(--radius-pill, 999px)] overflow-hidden flex-1"
        style={{ background: 'var(--rice)' }}
      >
        <motion.div
          className="h-full rounded-[var(--radius-pill, 999px)]"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: rank * 0.04 }}
        />
      </div>
      <span
        className="font-[var(--font-mono)] font-bold tabular-nums min-w-[36px] text-right"
        style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary, var(--ink-900))' }}
      >
        {score.toFixed(1)}
      </span>
    </div>
  );
}

/* ============================================================
   共识度标签
   ============================================================ */

function ConfidenceTag({ value }: { value: number }) {
  const t = useTranslations('confidence');

  let label: string;
  let color: string;
  let bg: string;

  if (value < 20) {
    label = t('doubtful');
    color = 'var(--ink-300)';
    bg = 'var(--rice)';
  } else if (value < 40) {
    label = t('emerging');
    color = 'var(--apricot, #E8A849)';
    bg = 'var(--apricot-bg, rgba(232,168,73,0.1))';
  } else if (value < 60) {
    label = t('forming');
    color = 'var(--indigo, #5B6ABF)';
    bg = 'var(--indigo-bg, rgba(91,106,191,0.1))';
  } else if (value < 80) {
    label = t('settled');
    color = 'var(--celadon)';
    bg = 'var(--celadon-bg, rgba(127,179,163,0.1))';
  } else {
    label = t('deepAccord');
    color = 'var(--vermilion)';
    bg = 'var(--vermilion-bg, rgba(226,85,63,0.1))';
  }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm, 4px)] text-[var(--text-xs)] font-[var(--font-heading)] whitespace-nowrap"
      style={{ color, background: bg as string, border: `1px solid ${color}33` }}
    >
      {label} {Math.round(value)}
    </span>
  );
}

/* ============================================================
   维度分数迷你条
   ============================================================ */

function DimensionScores({ dimensions }: { dimensions: { name: string; score: number }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {dimensions.map((dim) => (
        <span
          key={dim.name}
          className="inline-flex items-center gap-1 text-[10px] text-[var(--ink-500)]"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ink-200)' }} />
          {dim.name}
          <span className="font-[var(--font-mono)] font-semibold text-[var(--ink-700)]">
            {dim.score.toFixed(1)}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   RankingTable 主组件
   ============================================================ */

export function RankingTable({ items, onItemClick, className = '' }: RankingTableProps) {
  const t = useTranslations('listDetail');
  // 按综合分降序排列
  const sorted = useMemo(
    () => [...items].sort((a, b) => b.overallScore - a.overallScore),
    [items],
  );

  return (
    <div className={className}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: 'var(--vermilion)' }}
        />
        <h3
          className="font-[var(--font-heading)] text-[var(--text-base)]"
          style={{ color: 'var(--color-text-primary, var(--ink-900))' }}
        >
          {t('ranking')}
        </h3>
        <span className="text-[var(--text-xs)] text-[var(--ink-300)]">
          {sorted.length} {t('itemCount')}
        </span>
      </div>

      {/* 排名列表 — FLIP 动画 */}
      <LayoutGroup>
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {sorted.map((item, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;

              return (
                <motion.div
                  key={item.id}
                  layout
                  layoutId={`detail-rank-${item.id}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 350, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  onClick={() => onItemClick?.(item)}
                  className="cursor-pointer"
                >
                  <Card
                    size="sm"
                    interactive={false}
                    textured={false}
                    className="flex items-center gap-3 !py-2.5 !px-3"
                  >
                    {/* 排名号 */}
                    {isTop3 ? (
                      <SealBadge rank={rank} />
                    ) : (
                      <div
                        className="flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{
                          width: 32,
                          height: 32,
                          background: 'var(--rice)',
                          border: '1px solid var(--color-border)',
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'bold',
                          color: 'var(--ink-300)',
                        }}
                      >
                        {rank}
                      </div>
                    )}

                    {/* 条目名 + 综合分 + 维度 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="font-[var(--font-heading)] text-[var(--text-sm)] truncate"
                          style={{ color: 'var(--color-text-primary, var(--ink-900))' }}
                        >
                          {item.name}
                        </span>
                        {item.confidence !== undefined && (
                          <ConfidenceTag value={item.confidence} />
                        )}
                      </div>
                      <ScoreBar score={item.overallScore} rank={rank} />
                      {item.dimensions.length > 0 && (
                        <DimensionScores dimensions={item.dimensions} />
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}

export default RankingTable;