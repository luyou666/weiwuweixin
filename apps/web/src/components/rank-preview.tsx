'use client';

/**
 * 围物为心 — 实时排名预览 (增强版)
 * 使用 @weiwuweixin/scoring 的 compute 方法实时计算排名
 * Framer Motion FLIP 动画驱动条目排名变化
 * 增强功能：
 *   - 排名号缩放脉冲（上升 1→1.3→1，下降 1→0.8→1）
 *   - 新条目进入 scale + opacity 动画
 *   - 分数变化数值动画
 *   - 前三名印泥风格徽章
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Card } from '@weiwuweixin/ui';
import type { Item, Dimension, ScoredItem } from '@weiwuweixin/scoring';
import { useScoringStore } from '../stores/scoring-store';

/* ============================================================
   Props
   ============================================================ */
export interface RankPreviewProps {
  /** 待排名条目 */
  items: Item[];
  /** 评分维度 */
  dimensions: Dimension[];
  /** 自定义类名 */
  className?: string;
}

/* ============================================================
   印泥风格印章徽章（前三名）
   ============================================================ */
function SealBadge({ rank }: { rank: number }) {
  /* 朱砂/金/青 三印色 */
  const sealColors: Record<number, { bg: string; border: string; text: string; shadow: string }> = {
    1: {
      bg: 'var(--vermilion)',
      border: 'var(--vermilion-dark)',
      text: '#FFFFFF',
      shadow: '0 2px 6px rgba(226, 85, 63, 0.4)',
    },
    2: {
      bg: 'var(--gold)',
      border: 'var(--gold-dark)',
      text: '#FFFFFF',
      shadow: '0 2px 6px rgba(196, 151, 59, 0.35)',
    },
    3: {
      bg: 'var(--celadon)',
      border: 'var(--celadon-dark)',
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
        width: 36,
        height: 36,
        borderRadius: 4,
        background: config.bg,
        border: `2px solid ${config.border}`,
        color: config.text,
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-sm)',
        fontWeight: 700,
        boxShadow: config.shadow,
        /* 印章质感：轻微内阴影 + 纹理 */
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 印章纹理噪点层 */}
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
   排名号码装饰（含缩放脉冲动画）
   ============================================================ */
function RankNumber({
  rank,
  previousRank,
}: {
  rank: number;
  previousRank: number | undefined;
}) {
  const isTop3 = rank <= 3;

  /* 排名变化方向：上升 vs 下降 */
  const direction = useMemo(() => {
    if (previousRank === undefined) return 'new';
    if (previousRank > rank) return 'up';    // 数字变小 = 排名上升
    if (previousRank < rank) return 'down';  // 数字变大 = 排名下降
    return 'same';
  }, [rank, previousRank]);

  const topColors = ['var(--vermilion)', 'var(--gold)', 'var(--celadon)'];
  const color = isTop3 ? topColors[rank - 1] : 'var(--ink-300)';

  /* 前三名使用印泥印章风格 */
  if (isTop3) {
    return (
      <motion.div
        key={`seal-${rank}`}
        initial={
          direction === 'new' ? { scale: 0.8, opacity: 0 } : { scale: 1 }
        }
        animate={
          direction === 'up' ? { scale: [1, 1.3, 1], opacity: 1 } :
          direction === 'down' ? { scale: [1, 0.8, 1], opacity: 1 } :
          direction === 'new' ? { scale: 1, opacity: 1 } :
          { scale: 1, opacity: 1 }
        }
        transition={{
          duration: direction === 'same' ? 0 : 0.5,
          type: direction === 'same' ? 'tween' : 'spring',
          stiffness: 350,
          damping: 15,
          times: direction === 'up' || direction === 'down' ? [0, 0.4, 1] : undefined,
        }}
      >
        <SealBadge rank={rank} />
      </motion.div>
    );
  }

  /* 普通排名号 */
  return (
    <motion.div
      key={`rank-${rank}`}
      className="flex-shrink-0 flex items-center justify-center rounded-full"
      style={{
        width: 32,
        height: 32,
        background: 'var(--rice)',
        border: '1px solid var(--color-border)',
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'bold',
        color,
      }}
      initial={
        direction === 'new' ? { scale: 0.8, opacity: 0 } : { scale: 1 }
      }
      animate={
        direction === 'up' ? { scale: [1, 1.3, 1], opacity: 1 } :
        direction === 'down' ? { scale: [1, 0.8, 1], opacity: 1 } :
        direction === 'new' ? { scale: 1, opacity: 1 } :
        { scale: 1, opacity: 1 }
      }
      transition={{
        duration: direction === 'same' ? 0 : 0.5,
        type: 'spring',
        stiffness: 350,
        damping: 15,
      }}
    >
      {rank}
    </motion.div>
  );
}

/* ============================================================
   分数数值动画组件
   ============================================================ */
function AnimatedScore({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(score);
  const prevScoreRef = useRef(score);

  useEffect(() => {
    const prevScore = prevScoreRef.current;
    if (prevScore === score) return;

    const duration = 400; // ms
    const startTime = performance.now();
    let rafId: number;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = prevScore + (score - prevScore) * eased;
      setDisplayScore(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    prevScoreRef.current = score;

    return () => cancelAnimationFrame(rafId);
  }, [score]);

  return (
    <span
      className="font-[var(--font-mono)] font-bold tabular-nums min-w-[40px] text-right"
      style={{
        fontSize: 'var(--text-sm)',
      }}
    >
      {displayScore.toFixed(1)}
    </span>
  );
}

/* ============================================================
   综合分柱状条
   ============================================================ */
function ScoreBar({ score, rank }: { score: number; rank: number }) {
  const barColor = rank <= 3
    ? ['var(--vermilion)', 'var(--gold)', 'var(--celadon)'][rank - 1]
    : 'var(--ink-300)';

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className="h-[6px] rounded-[var(--radius-pill)] overflow-hidden flex-1"
        style={{ background: 'var(--rice)' }}
      >
        <motion.div
          className="h-full rounded-[var(--radius-pill)]"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: rank * 0.04 }}
        />
      </div>
      <AnimatedScore score={score} />
    </div>
  );
}

/* ============================================================
   RankPreview 主组件
   ============================================================ */
export function RankPreview({
  items,
  dimensions,
  className = '',
}: RankPreviewProps) {
  const authorScores = useScoringStore((s) => s.authorScores);
  const algorithmId = useScoringStore((s) => s.algorithmId);
  const getRankedItems = useScoringStore((s) => s.getRankedItems);

  /* 追踪上一轮排名，用于判断升降 */
  const prevRanksRef = useRef<Record<string, number>>({});
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});

  /* 通过 store 的 getRankedItems 实时计算排名 */
  const rankedItems: ScoredItem[] = useMemo(() => {
    return getRankedItems(items, dimensions);
  }, [items, dimensions, authorScores, algorithmId, getRankedItems]);

  /* 是否有任何打分 */
  const hasAnyScore = useMemo(() => {
    return Object.keys(authorScores).some((itemId) =>
      Object.values(authorScores[itemId]).some((v) => v > 0),
    );
  }, [authorScores]);

  /* 排名变化时更新 prevRanks */
  useEffect(() => {
    const currentRanks: Record<string, number> = {};
    rankedItems.forEach((item) => {
      currentRanks[item.item.id] = item.rank;
    });
    setPrevRanks(prevRanksRef.current);
    prevRanksRef.current = currentRanks;
  }, [rankedItems]);

  /* 追踪条目 ID 集合变化（新条目检测） */
  const prevItemIdsRef = useRef<Set<string>>(new Set());
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(rankedItems.map((i) => i.item.id));
    const actuallyNew = new Set<string>();
    currentIds.forEach((id) => {
      if (!prevItemIdsRef.current.has(id)) {
        actuallyNew.add(id);
      }
    });
    setNewItemIds(actuallyNew);
    prevItemIdsRef.current = currentIds;
  }, [rankedItems]);

  if (rankedItems.length === 0) {
    return null;
  }

  return (
    <div className={`weiwu-rank-preview ${className}`}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: 'var(--vermilion)' }}
        />
        <h3
          className="font-[var(--font-heading)] text-[var(--text-base)] text-[var(--color-text-primary)]"
        >
          实时排名
        </h3>
        {hasAnyScore && (
          <motion.span
            className="text-[var(--text-xs)] px-2 py-0.5 rounded-[var(--radius-sm)] font-[var(--font-heading)]"
            style={{
              background: 'var(--vermilion)15',
              color: 'var(--vermilion)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            实时更新中
          </motion.span>
        )}
      </div>

      {/* 排名列表 — FLIP 动画 */}
      <LayoutGroup>
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {rankedItems.map((scored) => {
              const isNew = newItemIds.has(scored.item.id);
              const previousRank = prevRanks[scored.item.id];

              return (
                <motion.div
                  key={scored.item.id}
                  layout
                  layoutId={`rank-${scored.item.id}`}
                  initial={
                    isNew
                      ? { opacity: 0, scale: 0.85, y: 16 }
                      : { opacity: 0, x: -8 }
                  }
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 8 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 350, damping: 30 },
                    opacity: { duration: 0.2 },
                    scale: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                >
                  <Card
                    size="sm"
                    interactive={false}
                    textured={false}
                    className="flex items-center gap-3 !py-2.5 !px-3"
                  >
                    {/* 排名号 — 带缩放脉冲 */}
                    <RankNumber
                      rank={scored.rank}
                      previousRank={previousRank}
                    />

                    {/* 条目名 + 综合分 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-[var(--font-heading)] text-[var(--text-sm)] text-[var(--color-text-primary)] truncate"
                        >
                          {scored.item.name}
                        </span>
                      </div>
                      <ScoreBar score={scored.totalScore} rank={scored.rank} />
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

export default RankPreview;