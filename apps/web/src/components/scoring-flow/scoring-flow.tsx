'use client';

/* ============================================================
   围物为心 — 沉浸式打分流程主组件
   管理打分阶段：维度选择 → 逐条目打分 → 完成
   ============================================================ */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Dimension } from '@weiwuweixin/scoring';
import { DimensionChoice } from './dimension-choice';
import { SingleItemScoring } from './single-item-scoring';
import { ScoringProgress } from './scoring-progress';
import { ScoringComplete } from './scoring-complete';

/* ── 类型 ── */
export interface ScoringListItem {
  id: string;
  name: string;
}

export interface ScoringListData {
  id: string;
  title: string;
  author: { id: string; nickname: string };
  items: ScoringListItem[];
  authorDimensions: Dimension[];
  standardDimensions: Dimension[];
  authorScores: Record<string, Record<string, number>>;
}

type Phase = 'dimension-choice' | 'scoring' | 'complete';

/* ── 背景渐变随进度变化 ── */
function getBackgroundGradient(progress: number): string {
  // 从宣纸色渐变到微红再回到沉稳色
  const r = Math.round(251 - progress * 26);
  const g = Math.round(247 - progress * 47);
  const b = Math.round(240 - progress * 20);
  const r2 = Math.round(243 - progress * 30);
  const g2 = Math.round(236 - progress * 50);
  const b2 = Math.round(222 - progress * 30);
  return `radial-gradient(ellipse at 50% 30%, rgb(${r},${g},${b}) 0%, rgb(${r2},${g2},${b2}) 100%)`;
}

export function ScoringFlow({ list }: { list: ScoringListData }) {
  const t = useTranslations('scoring');

  /* ── 流程阶段 ── */
  const [phase, setPhase] = useState<Phase>('dimension-choice');

  /* ── 维度模式 ── */
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [dimMode, setDimMode] = useState<'author' | 'standard' | null>(null);

  /* ── 当前条目索引 ── */
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ── 打分数据：Record<itemId, Record<dimId, score>> ── */
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});

  /* ── 反刷分计时 ── */
  const startTimeRef = useRef<number>(0);
  const [durationMs, setDurationMs] = useState(0);
  const [penalized, setPenalized] = useState(false);

  /* ── 同好权重 ── */
  const [likeWeight, setLikeWeight] = useState<number | null>(null);

  /* ── 进度 ── */
  const progress = useMemo(() => {
    if (phase === 'dimension-choice') return 0;
    if (phase === 'complete') return 1;
    return list.items.length > 0 ? currentIndex / list.items.length : 0;
  }, [phase, currentIndex, list.items.length]);

  /* ── 维度选择确认 ── */
  const handleDimensionChoice = useCallback(
    (mode: 'author' | 'standard') => {
      setDimMode(mode);
      setDimensions(mode === 'author' ? list.authorDimensions : list.standardDimensions);
      startTimeRef.current = Date.now();
      setPhase('scoring');
    },
    [list],
  );

  /* ── 设置单项某维度分 ── */
  const setItemScore = useCallback(
    (itemId: string, dimId: string, score: number) => {
      setScores((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] ?? {}),
          [dimId]: score,
        },
      }));
    },
    [],
  );

  /* ── 下一个/上一个条目 ── */
  const goNext = useCallback(() => {
    if (currentIndex < list.items.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, list.items.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  /* ── 完成打分 ── */
  const handleFinish = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    setDurationMs(elapsed);

    // 反刷分：<3秒 → 降权
    if (elapsed < 3000) {
      setPenalized(true);
    }

    setPhase('complete');
  }, []);

  /* ── 计算共识度 ── */
  const consensus = useMemo(() => {
    if (dimMode !== 'author') return null;

    // 只在沿用作者维度时计算共识度
    let totalDiff = 0;
    let count = 0;

    for (const item of list.items) {
      const myScores = scores[item.id];
      const authorScore = list.authorScores[item.id];
      if (!myScores || !authorScore) continue;

      for (const dim of list.authorDimensions) {
        const mine = myScores[dim.id] ?? 0;
        const theirs = authorScore[dim.id] ?? 0;
        totalDiff += Math.abs(mine - theirs);
        count++;
      }
    }

    if (count === 0) return 0;

    // 最大差异 = count * 100，共识度 = 1 - (总差异 / 最大差异)
    const maxDiff = count * 100;
    return Math.max(0, Math.min(1, 1 - totalDiff / maxDiff));
  }, [dimMode, scores, list]);

  /* ── 当前条目 ── */
  const currentItem = list.items[currentIndex] ?? null;

  return (
    <div
      className="relative min-h-screen transition-colors duration-700"
      style={{ background: getBackgroundGradient(progress) }}
    >
      {/* ── 顶部信息栏 ── */}
      <header className="sticky top-0 z-20 px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(251,247,240,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-3">
          <h1
            className="font-[var(--font-heading)] truncate"
            style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}
          >
            {list.title}
          </h1>
          <span
            className="text-[var(--text-xs)] px-2 py-0.5 rounded-full"
            style={{ color: 'var(--ink-500)', background: 'var(--rice)' }}
          >
            {list.author.nickname}
          </span>
        </div>
        {phase === 'scoring' && (
          <span
            className="text-[var(--text-sm)] font-[var(--font-mono)]"
            style={{ color: 'var(--ink-500)' }}
          >
            {t('flow.itemOf', { current: currentIndex + 1, total: list.items.length })}
          </span>
        )}
      </header>

      {/* ── 进度条 ── */}
      {phase !== 'dimension-choice' && <ScoringProgress progress={progress} />}

      {/* ── 内容区 ── */}
      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <AnimatePresence mode="wait">
          {phase === 'dimension-choice' && (
            <motion.div
              key="dimension-choice"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-lg px-6"
            >
              <DimensionChoice
                authorDimensions={list.authorDimensions}
                standardDimensions={list.standardDimensions}
                authorName={list.author.nickname}
                onChoose={handleDimensionChoice}
              />
            </motion.div>
          )}

          {phase === 'scoring' && currentItem && (
            <motion.div
              key={`item-${currentItem.id}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-lg px-6"
            >
              <SingleItemScoring
                item={currentItem}
                dimensions={dimensions}
                scores={scores[currentItem.id] ?? {}}
                onScoreChange={(dimId, value) => setItemScore(currentItem.id, dimId, value)}
                onPrev={currentIndex > 0 ? goPrev : undefined}
                onNext={currentIndex < list.items.length - 1 ? goNext : undefined}
                onFinish={handleFinish}
                isLast={currentIndex === list.items.length - 1}
                currentIndex={currentIndex}
                totalItems={list.items.length}
              />
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full max-w-lg px-6"
            >
              <ScoringComplete
                consensus={consensus}
                durationMs={durationMs}
                penalized={penalized}
                likeWeight={likeWeight}
                onLikeWeightChange={setLikeWeight}
                listId={list.id}
                listTitle={list.title}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}