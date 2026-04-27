'use client';

/**
 * 围物为心 — 社区评分概览
 * - 参与人数
 * - 评分分布图占位
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@weiwuweixin/ui';
import { useTranslations } from 'next-intl';

/* ============================================================
   Types
   ============================================================ */

export interface CommunityScoresProps {
  participantCount: number;
  averageAgreement: number; // 0-1
  /** 评分分布 — 每个分数段的人数 */
  scoreDistribution?: { label: string; count: number; color?: string }[];
  className?: string;
}

/* ============================================================
   分布条
   ============================================================ */

function DistributionBar({
  label,
  count,
  maxCount,
  color,
}: {
  label: string;
  count: number;
  maxCount: number;
  color: string;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--ink-500)] w-8 text-right font-[var(--font-mono)]">
        {label}
      </span>
      <div className="flex-1 h-4 rounded-[var(--radius-sm, 4px)] overflow-hidden" style={{ background: 'var(--rice)' }}>
        <motion.div
          className="h-full rounded-[var(--radius-sm, 4px)]"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
      <span className="text-[10px] font-[var(--font-mono)] text-[var(--ink-500)] min-w-[24px] text-right">
        {count}
      </span>
    </div>
  );
}

/* ============================================================
   CommunityScores 主组件
   ============================================================ */

export function CommunityScores({
  participantCount,
  averageAgreement,
  scoreDistribution,
  className = '',
}: CommunityScoresProps) {
  const t = useTranslations('listDetail');

  // 默认评分分布
  const distribution = scoreDistribution ?? [
    { label: '9-10', count: Math.round(participantCount * 0.35), color: 'var(--vermilion)' },
    { label: '7-8', count: Math.round(participantCount * 0.28), color: 'var(--celadon)' },
    { label: '5-6', count: Math.round(participantCount * 0.2), color: 'var(--indigo, #5B6ABF)' },
    { label: '3-4', count: Math.round(participantCount * 0.12), color: 'var(--apricot, #E8A849)' },
    { label: '0-2', count: Math.round(participantCount * 0.05), color: 'var(--ink-200)' },
  ];

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  // 共识度百分比
  const agreementPct = Math.round(averageAgreement * 100);

  return (
    <div className={className}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: 'var(--apricot, #E8A849)' }}
        />
        <h3
          className="font-[var(--font-heading)] text-[var(--text-base)]"
          style={{ color: 'var(--color-text-primary, var(--ink-900))' }}
        >
          {t('communityScores') ?? '社区评分'}
        </h3>
      </div>

      <Card interactive={false} textured size="md">
        {/* 参与概览 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div
              className="font-[var(--font-mono)] font-bold text-[var(--text-xl, 1.25rem)]"
              style={{ color: 'var(--vermilion)' }}
            >
              {participantCount}
            </div>
            <div className="text-[var(--text-xs)] text-[var(--ink-500)]">
              {t('voteCount')}
            </div>
          </div>
          <div
            className="w-px h-8"
            style={{ background: 'var(--color-border)' }}
          />
          <div className="text-center flex-1">
            <div
              className="font-[var(--font-mono)] font-bold text-[var(--text-xl, 1.25rem)]"
              style={{ color: 'var(--celadon)' }}
            >
              {agreementPct}%
            </div>
            <div className="text-[var(--text-xs)] text-[var(--ink-500)]">
              {t('confidence')}
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="w-full h-px mb-3" style={{ background: 'var(--color-border)' }} />

        {/* 评分分布 */}
        <div className="text-[var(--text-xs)] text-[var(--ink-500)] mb-2">
          {t('scoreDistribution') ?? '评分分布'}
        </div>
        <div className="space-y-1.5">
          {distribution.map((d) => (
            <DistributionBar
              key={d.label}
              label={d.label}
              count={d.count}
              maxCount={maxCount}
              color={d.color ?? "var(--ink-300)"}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

export default CommunityScores;