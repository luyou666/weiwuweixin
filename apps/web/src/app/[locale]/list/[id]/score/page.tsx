'use client';

/* ============================================================
   围物为心 — 他人打分页 /list/[id]/score
   沉浸式打分体验：一次一屏，维度选择 + 同好按钮 + 反刷分
   ============================================================ */

import React from 'react';
import { useParams } from 'next/navigation';
import { ScoringFlow } from '@/components/scoring-flow/scoring-flow';

/* ── Mock 数据（后续替换为 API） ── */
const mockScoringList = {
  id: 'demo-list-1',
  title: '2024年度最佳前端框架',
  author: { id: 'u-author', nickname: '码上花开' },
  items: [
    { id: 'item-1', name: 'React' },
    { id: 'item-2', name: 'Vue' },
    { id: 'item-3', name: 'Svelte' },
    { id: 'item-4', name: 'Solid' },
    { id: 'item-5', name: 'Angular' },
    { id: 'item-6', name: 'Astro' },
    { id: 'item-7', name: 'Next.js' },
    { id: 'item-8', name: 'Nuxt' },
    { id: 'item-9', name: 'Remix' },
    { id: 'item-10', name: 'Qwik' },
  ],
  authorDimensions: [
    { id: 'ad-1', name: '开发体验', weight: 1, scale: 100 },
    { id: 'ad-2', name: '生态成熟度', weight: 1, scale: 100 },
    { id: 'ad-3', name: '性能表现', weight: 1, scale: 100 },
  ],
  standardDimensions: [
    { id: 'sd-1', name: '实用性', weight: 1, scale: 100 },
    { id: 'sd-2', name: '美感', weight: 1, scale: 100 },
    { id: 'sd-3', name: '创新性', weight: 1, scale: 100 },
    { id: 'sd-4', name: '易获得性', weight: 1, scale: 100 },
    { id: 'sd-5', name: '耐久度', weight: 1, scale: 100 },
  ],
  // 作者对每个条目的打分（用于计算共识度）
  authorScores: {
    'item-1': { 'ad-1': 85, 'ad-2': 95, 'ad-3': 70 },
    'item-2': { 'ad-1': 90, 'ad-2': 85, 'ad-3': 80 },
    'item-3': { 'ad-1': 92, 'ad-2': 40, 'ad-3': 95 },
    'item-4': { 'ad-1': 88, 'ad-2': 30, 'ad-3': 93 },
    'item-5': { 'ad-1': 60, 'ad-2': 90, 'ad-3': 55 },
    'item-6': { 'ad-1': 85, 'ad-2': 50, 'ad-3': 90 },
    'item-7': { 'ad-1': 80, 'ad-2': 88, 'ad-3': 75 },
    'item-8': { 'ad-1': 82, 'ad-2': 78, 'ad-3': 77 },
    'item-9': { 'ad-1': 78, 'ad-2': 45, 'ad-3': 82 },
    'item-10': { 'ad-1': 88, 'ad-2': 20, 'ad-3': 96 },
  } as Record<string, Record<string, number>>,
};

export default function ScorePage() {
  const params = useParams();
  const listId = params.id as string;

  // TODO: 根据 listId 从 API 加载榜单数据
  void listId;

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <ScoringFlow list={mockScoringList} />
    </div>
  );
}