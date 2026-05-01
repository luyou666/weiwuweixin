'use client';

/* ============================================================
   围物为心 — 他人打分页 /list/[id]/score
   沉浸式打分体验：一次一屏，维度选择 + 同好按钮 + 反刷分
   数据从真实 API 加载
   ============================================================ */

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ScoringFlow, type ScoringListData } from '@/components/scoring-flow/scoring-flow';
import type { Dimension } from '@weiwuweixin/scoring';
import { fetchListById, type ListDetail } from '@/lib/api';

/* ── 将 API 响应转为 ScoringFlow 所需格式 ── */
function adaptListToScoring(list: ListDetail): ScoringListData {
  /* 所有维度都作为"作者维度"；"标准维度"暂用固定通用维度 */
  const authorDimensions: Dimension[] = list.dimensions.map((d) => ({
    id: d.id,
    name: d.name,
    weight: d.weight,
    scale: d.scale ?? 100,
  }));

  const standardDimensions: Dimension[] = [
    { id: 'sd-practicality', name: '实用性', weight: 1, scale: 100 },
    { id: 'sd-beauty', name: '美感', weight: 1, scale: 100 },
    { id: 'sd-innovation', name: '创新性', weight: 1, scale: 100 },
    { id: 'sd-accessibility', name: '易获得性', weight: 1, scale: 100 },
    { id: 'sd-durability', name: '耐久度', weight: 1, scale: 100 },
  ];

  /* 将 items[].authorScores 转换为 Record<itemId, Record<dimId, value>> */
  const authorScores: Record<string, Record<string, number>> = {};
  for (const item of list.items) {
    const itemScores: Record<string, number> = {};
    for (const s of item.authorScores) {
      itemScores[s.dimensionId] = s.value;
    }
    authorScores[item.id] = itemScores;
  }

  return {
    id: list.id,
    title: list.title,
    author: { id: list.author.id, nickname: list.author.nickname },
    items: list.items.map((i) => ({ id: i.id, name: i.name })),
    authorDimensions,
    standardDimensions,
    authorScores,
  };
}

export default function ScorePage() {
  const params = useParams();
  const listId = params.id as string;
  const t = useTranslations('scoring');

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['list', listId],
    queryFn: () => fetchListById(listId),
    enabled: !!listId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <p className="text-[var(--ink-500)]">{t('guide')}</p>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--paper)' }}>
        <p className="text-[var(--vermilion)]">加载失败</p>
        <button type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded bg-[var(--ink-900)] text-white"
        >
          重试
        </button>
      </div>
    );
  }

  const scoringData = adaptListToScoring(list);

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <ScoringFlow list={scoringData} />
    </div>
  );
}