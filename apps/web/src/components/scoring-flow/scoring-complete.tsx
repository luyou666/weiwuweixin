'use client';

/* ============================================================
   围物为心 — 打分完成页
   展示「您与作者的共识度」+ 印章效果 + 同好按钮
   反刷分警告
   ============================================================ */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@weiwuweixin/ui';
import { RaporButton } from './rapor-button';

interface ScoringCompleteProps {
  /** 共识度 0-1（仅沿用作者维度时有值） */
  consensus: number | null;
  /** 打分用时（毫秒） */
  durationMs: number;
  /** 是否被降权 */
  penalized: boolean;
  /** 同好权重（保留接口，后续可用于展示） */
  likeWeight: number | null;
  onLikeWeightChange: (w: number) => void;
  listId: string;
  listTitle: string;
}

/** 共识度等级 */
function getConsensusLabel(value: number): string {
  if (value >= 0.9) return '深契';
  if (value >= 0.75) return '确然';
  if (value >= 0.5) return '初聚';
  if (value >= 0.25) return '微识';
  return '存疑';
}

function getConsensusColor(value: number): string {
  if (value >= 0.9) return 'var(--celadon-dark)';
  if (value >= 0.75) return 'var(--celadon)';
  if (value >= 0.5) return 'var(--apricot)';
  if (value >= 0.25) return 'var(--apricot-dark)';
  return 'var(--ink-300)';
}

export function ScoringComplete({
  consensus,
  durationMs,
  penalized,
  // likeWeight is reserved for future display use
  onLikeWeightChange,
  listId,
  listTitle,
}: ScoringCompleteProps) {
  const t = useTranslations('scoring.complete');
  const [showStamp, setShowStamp] = useState(false);
  const [stampPhase, setStampPhase] = useState<'drop' | 'stamp' | 'reveal' | 'done'>('drop');

  const durationSec = (durationMs / 1000).toFixed(1);

  /* ── 印章动画序列 ── */
  useEffect(() => {
    setShowStamp(true);
    setStampPhase('drop');

    const timers = [
      setTimeout(() => setStampPhase('stamp'), 600),
      setTimeout(() => setStampPhase('reveal'), 1000),
      setTimeout(() => setStampPhase('done'), 2000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  /* ── 印章动画变体 ── */
  const stampVariants = {
    drop: {
      y: -150,
      rotate: -12,
      scale: 1,
      opacity: 0,
    },
    stamp: {
      y: 0,
      rotate: 0,
      scale: 1.08,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 400, damping: 18 },
    },
    reveal: {
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 },
    },
    done: {
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
    },
  };

  /* ── 墨迹扩散 ── */
  const inkVariants = {
    drop: { scale: 0, opacity: 0 },
    stamp: { scale: 1.2, opacity: 0.5, transition: { duration: 0.3 } },
    reveal: { scale: 1, opacity: 0.3, transition: { duration: 0.4 } },
    done: { scale: 1, opacity: 0.2 },
  };

  const router = useRouter();
  const handleBack = useCallback(() => {
    router.push(`/list/${listId}`);
  }, [router, listId]);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* ── 印章 + 墨滴动画 ── */}
      <AnimatePresence>
        {showStamp && (
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            {/* 墨迹扩散 */}
            <motion.div
              className="absolute"
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(226,85,63,0.15) 0%, rgba(226,85,63,0.03) 50%, transparent 70%)',
              }}
              animate={inkVariants[stampPhase]}
              initial={{ scale: 0, opacity: 0 }}
            />

            {/* 印章主体 */}
            <motion.div
              className="relative flex items-center justify-center"
              style={{ width: 96, height: 96 }}
              animate={stampVariants[stampPhase]}
              initial={{ y: -150, rotate: -12, opacity: 0 }}
            >
              {/* 外框 */}
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  border: '4px solid var(--vermilion)',
                  transform: 'rotate(2deg)',
                }}
              />
              {/* 内框 */}
              <div
                className="absolute rounded"
                style={{
                  inset: 6,
                  border: '2px solid var(--vermilion)',
                  borderRadius: 4,
                  backgroundColor: 'rgba(226,85,63,0.06)',
                }}
              />
              {/* 印文 */}
              <span
                className="relative font-[var(--font-heading)] font-bold"
                style={{
                  fontSize: 36,
                  color: 'var(--vermilion)',
                }}
              >
                心
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 完成标题 ── */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <h2
          className="font-[var(--font-heading)] font-bold mb-2"
          style={{ fontSize: 'var(--text-2xl)', color: 'var(--ink-900)' }}
        >
          {t('title')}
        </h2>
        <p
          className="text-[var(--text-sm)]"
          style={{ color: 'var(--ink-500)' }}
        >
          {listTitle}
        </p>
      </motion.div>

      {/* ── 统计卡片 ── */}
      <motion.div
        className="flex gap-6 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {/* 用时 */}
        <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl"
          style={{ background: 'var(--rice)', border: '1px solid var(--ink-100)' }}
        >
          <span className="font-[var(--font-mono)] font-bold"
            style={{ fontSize: 'var(--text-xl)', color: penalized ? 'var(--warning)' : 'var(--ink-900)' }}
          >
            {durationSec}
          </span>
          <span className="text-[var(--text-xs)]" style={{ color: 'var(--ink-500)' }}>
            {t('duration')}（{t('seconds')}）
          </span>
        </div>

        {/* 共识度（仅沿用作者维度时显示） */}
        {consensus !== null && (
          <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl"
            style={{ background: 'var(--rice)', border: '1px solid var(--ink-100)' }}
          >
            <span
              className="font-[var(--font-mono)] font-bold"
              style={{ fontSize: 'var(--text-xl)', color: getConsensusColor(consensus) }}
            >
              {Math.round(consensus * 100)}%
            </span>
            <span className="text-[var(--text-xs)]" style={{ color: 'var(--ink-500)' }}>
              {t('consensus')}
            </span>
            <span
              className="text-[var(--text-xs)] font-[var(--font-heading)] font-semibold px-2 py-0.5 rounded"
              style={{
                color: getConsensusColor(consensus),
                background: 'var(--paper)',
              }}
            >
              {getConsensusLabel(consensus)}
            </span>
          </div>
        )}
      </motion.div>

      {/* ── 降权警告 ── */}
      <AnimatePresence>
        {penalized && (
          <motion.div
            className="px-4 py-2 rounded-lg text-[var(--text-sm)]"
            style={{
              color: 'var(--warning)',
              background: 'rgba(226,165,63,0.1)',
              border: '1px solid rgba(226,165,63,0.3)',
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 1.2 }}
          >
            {t('penaltyWarning')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 同好按钮 ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <RaporButton onWeightChange={onLikeWeightChange} />
      </motion.div>

      {/* ── 返回按钮 ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
      >
        <Button size="md" onClick={handleBack}>
          {t('backToList')}
        </Button>
      </motion.div>
    </div>
  );
}