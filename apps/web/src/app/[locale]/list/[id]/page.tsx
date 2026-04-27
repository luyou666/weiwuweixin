'use client';

/**
 * 围物为心 — 榜单详情页 /list/[id]
 * 展示排名 + 共识度 + 评论 + 社区分数
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, ConfidenceSeal } from '@weiwuweixin/ui';
import { computeConfidence } from '@weiwuweixin/scoring';
import { useTranslations } from 'next-intl';
import { RankingTable } from '@/components/list-detail/ranking-table';
import type { RankingItem } from '@/components/list-detail/ranking-table';
import { ConfidencePanel } from '@/components/list-detail/confidence-panel';
import { CommentSection } from '@/components/list-detail/comment-section';
import type { CommentData } from '@/components/list-detail/comment-section';
import { CommunityScores } from '@/components/list-detail/community-scores';
import { ScoreDetailDialog } from '@/components/list-detail/score-detail-dialog';

/* ============================================================
   Mock 数据
   ============================================================ */

const mockListDetail = {
  id: 'demo-list-1',
  title: '2024年度最佳前端框架',
  subtitle: '基于开发体验、生态成熟度、性能表现三个维度',
  author: { nickname: '码上花开', avatar: null },
  algorithmId: 'weighted-mean',
  confidence: 72,
  items: [
    { id: '1', name: 'React', overallScore: 8.7, dimensions: [{ name: '开发体验', score: 9.2 }, { name: '生态', score: 9.5 }, { name: '性能', score: 7.4 }], confidence: 85 },
    { id: '2', name: 'Vue', overallScore: 8.5, dimensions: [{ name: '开发体验', score: 9.0 }, { name: '生态', score: 8.8 }, { name: '性能', score: 7.7 }], confidence: 80 },
    { id: '3', name: 'Svelte', overallScore: 8.3, dimensions: [{ name: '开发体验', score: 9.4 }, { name: '生态', score: 6.8 }, { name: '性能', score: 8.7 }], confidence: 58 },
    { id: '4', name: 'Angular', overallScore: 7.8, dimensions: [{ name: '开发体验', score: 6.5 }, { name: '生态', score: 8.2 }, { name: '性能', score: 8.7 }], confidence: 72 },
    { id: '5', name: 'Solid', overallScore: 7.6, dimensions: [{ name: '开发体验', score: 8.0 }, { name: '生态', score: 5.5 }, { name: '性能', score: 9.3 }], confidence: 35 },
    { id: '6', name: 'Astro', overallScore: 7.4, dimensions: [{ name: '开发体验', score: 8.8 }, { name: '生态', score: 6.0 }, { name: '性能', score: 7.4 }], confidence: 42 },
    { id: '7', name: 'HTMX', overallScore: 6.9, dimensions: [{ name: '开发体验', score: 7.5 }, { name: '生态', score: 5.0 }, { name: '性能', score: 8.2 }], confidence: 28 },
    { id: '8', name: 'Qwik', overallScore: 6.5, dimensions: [{ name: '开发体验', score: 7.0 }, { name: '生态', score: 4.2 }, { name: '性能', score: 8.3 }], confidence: 18 },
  ],
  communityScores: { participantCount: 38, averageAgreement: 0.65 },
  comments: [
    { id: 'c1', user: '山高水长', content: 'React 生态确实无敌，但性能方面确实还有优化空间', sentiment: 0.6, createdAt: '2024-03-15' },
    { id: 'c2', user: '晚风轻吟', content: 'Vue 的开发体验很丝滑，特别是组合式 API', sentiment: 0.8, createdAt: '2024-03-16' },
    { id: 'c3', user: '石破天惊', content: 'Svelte 的性能表现惊艳，但生态还需要成长', sentiment: 0.3, createdAt: '2024-03-18' },
    { id: 'c4', user: '云中漫步', content: 'Angular 在大型项目中还是有它的优势', sentiment: 0.5, createdAt: '2024-03-20' },
    { id: 'c5', user: '月影星河', content: 'Solid 的细粒度响应式确实先进，只是社区还小', sentiment: 0.4, createdAt: '2024-03-22' },
    { id: 'c6', user: '落笔生花', content: 'HTMX 的理念很棒，回归 Web 本质', sentiment: 0.2, createdAt: '2024-04-01' },
  ] as CommentData[],
};

/* ============================================================
   主页面
   ============================================================ */

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('listDetail');

  const listId = params.id as string;

  // Mock 数据 — 实际项目走 API
  const listData = mockListDetail;

  // 评论 — 本地状态管理（mock 场景下简单追加）
  const [comments, setComments] = useState<CommentData[]>(listData.comments);

  // 评分详情弹窗
  const [detailItem, setDetailItem] = useState<RankingItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleItemClick = useCallback((item: RankingItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  const handleCommentSubmit = useCallback((content: string) => {
    const newComment: CommentData = {
      id: `c-${Date.now()}`,
      user: '我',
      content,
      sentiment: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setComments((prev) => [newComment, ...prev]);
  }, []);

  // 排名条目
  const rankingItems: RankingItem[] = useMemo(
    () => listData.items.map((item) => ({
      id: item.id,
      name: item.name,
      overallScore: item.overallScore,
      dimensions: item.dimensions,
      confidence: item.confidence,
    })),
    [listData.items],
  );

  // 共识度 params — 从 mock 数据推算
  const confidenceParams = useMemo(
    () => ({
      N: listData.communityScores.participantCount,
      tau: listData.communityScores.averageAgreement,
      sentiment: 0.5,
      daysSinceLastVote: 5,
    }),
    [listData.communityScores],
  );

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* ─── 顶部导航 ─── */}
      <header
        className="sticky top-0 z-sticky backdrop-blur-sm"
        style={{
          background: 'var(--paper)',
          opacity: 0.95,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-lg py-sm flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="font-[var(--font-heading)] text-[var(--text-base)] hover:text-[var(--vermilion)] transition-colors"
            style={{ color: 'var(--ink-900)' }}
          >
            ← {t('backToList') ?? '返回'}
          </button>
          <h1 className="font-[var(--font-heading)] text-[var(--text-base)]" style={{ color: 'var(--ink-700)' }}>
            {t('listDetail') ?? '榜单详情'}
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* ─── 主内容区 ─── */}
      <main className="max-w-4xl mx-auto px-lg py-lg">
        {/* ─── 榜单头部 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="mb-xl"
        >
          <Card interactive={false} textured size="lg">
            {/* 封面装饰条 */}
            <div
              className="h-2 rounded-[var(--radius-pill, 999px)] mb-lg"
              style={{
                background: 'linear-gradient(90deg, var(--vermilion), var(--celadon), var(--indigo, #5B6ABF))',
              }}
            />

            <h1
              className="font-[var(--font-heading)] text-[var(--text-2xl, 1.5rem)] mb-1"
              style={{ color: 'var(--ink-900)' }}
            >
              {listData.title}
            </h1>
            {listData.subtitle && (
              <p
                className="text-[var(--text-sm)] mb-4"
                style={{ color: 'var(--ink-500)' }}
              >
                {listData.subtitle}
              </p>
            )}

            {/* 作者 + 统计 */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* 头像 */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-[var(--font-heading)] text-[var(--text-xs)]"
                  style={{
                    background: 'var(--vermilion)',
                    color: 'var(--paper)',
                  }}
                >
                  {listData.author.nickname.charAt(0)}
                </div>
                <span className="text-[var(--text-sm)] font-medium" style={{ color: 'var(--ink-900)' }}>
                  {listData.author.nickname}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[var(--text-xs)]" style={{ color: 'var(--ink-500)' }}>
                <span>{listData.items.length} {t('itemCount')}</span>
                <span>{listData.communityScores.participantCount} {t('voteCount')}</span>
                <span className="inline-flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: listData.confidence >= 60 ? 'var(--celadon)' : 'var(--apricot, #E8A849)' }}
                  />
                  {t('confidence')} {listData.confidence}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ─── 两列布局：排名 + 侧栏 ─── */}
        <div className="flex flex-col lg:flex-row gap-lg">
          {/* 左列：排名表格 */}
          <div className="flex-1 min-w-0">
                  <RankingTable
                    items={rankingItems}
                    onItemClick={handleItemClick}
                    onVote={(itemId, direction) => {
                      // 模拟投票 — 在实际项目中调用 API
                      console.log(`Vote ${direction} on item ${itemId}`);
                    }}
                  />
          </div>

          {/* 右列：共识度 + 社区评分 + 评论 */}
          <div className="lg:w-[340px] flex-shrink-0 space-y-lg">
            {/* 共识度面板 */}
            <ConfidencePanel
              params={confidenceParams}
              overrideValue={listData.confidence}
            />

            {/* 社区评分概览 */}
            <CommunityScores
              participantCount={listData.communityScores.participantCount}
              averageAgreement={listData.communityScores.averageAgreement}
            />

            {/* 评论区 */}
            <CommentSection
              comments={comments}
              onSubmit={handleCommentSubmit}
            />
          </div>
        </div>
      </main>

      {/* ─── 底部操作栏 ─── */}
      <motion.footer
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25, delay: 0.3 }}
        className="fixed bottom-0 inset-x-0 z-sticky backdrop-blur-sm"
        style={{
          background: 'var(--paper)',
          opacity: 0.97,
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-lg py-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => router.push(`/list/${listId}/export`)}>
              📷 {t('exportShareCard') ?? '导出分享卡'}
            </Button>
            <Button size="sm" onClick={() => { /* TODO: 同好功能 */ }}>
              🤝 {t('findAlly') ?? '同好'}
            </Button>
          </div>
          <Button size="sm" onClick={() => { /* TODO: 关注功能 */ }}>
            ⭐ {t('followList') ?? '关注榜单'}
          </Button>
        </div>
      </motion.footer>

      {/* ─── 评分详情弹窗 ─── */}
      <ScoreDetailDialog
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* 底部占位 — 防止操作栏遮挡 */}
      <div className="h-16" />
    </div>
  );
}