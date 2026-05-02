'use client';

/**
 * 围物为心 — 榜单详情页 /list/[id]
 * 展示排名 + 共识度 + 评论 + 社区分数
 * 数据从真实 API 获取
 * 
 * Design: Monopo London — black on white, massive editorial typography,
 * generous white space, no cards, scroll reveals.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Card, Button, ConfidenceSeal } from '@weiwuweixin/ui';
import { useTranslations } from 'next-intl';
import { fetchListById, fetchComments, postComment } from '@/lib/api';
import type { ListDetail, CommentItem as ApiCommentItem } from '@/lib/api';
import { voteList, getListVoteStatus } from '@/lib/api-client';
import { RankingTable } from '@/components/list-detail/ranking-table';
import type { RankingItem } from '@/components/list-detail/ranking-table';
import { ConfidencePanel } from '@/components/list-detail/confidence-panel';
import { CommentSection } from '@/components/list-detail/comment-section';
import type { CommentData } from '@/components/list-detail/comment-section';
import { CommunityScores } from '@/components/list-detail/community-scores';
import { ScoreDetailDialog } from '@/components/list-detail/score-detail-dialog';
import { ListVoteButtons } from '@/components/list-detail/list-vote-buttons';

/* ============================================================
   工具函数 — 将 API 响应转为组件所需格式
   ============================================================ */

/** 计算条目综合分（authorScores 按维度权重加权平均） */
function computeOverallScore(
  item: ListDetail['items'][0],
  dimensions: ListDetail['dimensions'],
): number {
  const scores = item.authorScores;
  if (scores.length === 0 || dimensions.length === 0) return 0;

  const weightSum = dimensions.reduce((s, d) => s + d.weight, 0);
  if (weightSum === 0) return 0;

  let total = 0;
  for (const dim of dimensions) {
    const score = scores.find(s => s.dimensionId === dim.id);
    total += (score?.value ?? 0) * dim.weight;
  }
  return Math.round((total / weightSum) * 10) / 10;
}

/** 计算条目置信度（communityScores 平均） */
function computeItemConfidence(item: ListDetail['items'][0]): number {
  if (item.communityScores.length === 0) return 0;
  const avg = item.communityScores.reduce((s, c) => s + c.confidence, 0) / item.communityScores.length;
  return Math.round(avg * 100);
}

/** 将 API 数据转为 RankingItem[] */
function toRankingItems(list: ListDetail): RankingItem[] {
  return list.items.map(item => ({
    id: item.id,
    name: item.name,
    overallScore: computeOverallScore(item, list.dimensions),
    dimensions: list.dimensions.map(dim => {
      const score = item.authorScores.find(s => s.dimensionId === dim.id);
      return {
        name: dim.name,
        score: score?.value ?? 0,
      };
    }),
    confidence: computeItemConfidence(item),
  }));
}

/** 将 API CommentItem 转为 CommentData[] */
function toComments(apiComments: ApiCommentItem[]): CommentData[] {
  return apiComments.map(c => ({
    id: c.id,
    user: c.author.nickname,
    avatarUrl: c.author.avatarUrl ?? undefined,
    content: c.content,
    sentiment: c.sentiment,
    createdAt: c.createdAt.split('T')[0],
  }));
}

/** 计算榜单整体置信度 — 优先使用后端计算值（0-1），降级取 communityScores 平均 */
function computeListConfidence(list: ListDetail): number {
  // 后端已计算探索页一致置信度（0-1，与话题聚合/瀑布流同公式）
  if (list.confidence != null && list.confidence > 0) {
    return list.confidence; // 0-1 小数
  }
  // 降级：从 communityScores 简单平均
  if (list.communityScores.length === 0) return 0;
  const avg = list.communityScores.reduce((s, c) => s + c.confidence, 0) / list.communityScores.length;
  return avg; // 也是 0-1
}

/* ============================================================
   Scroll-reveal wrapper — Monopo staggered entrance
   ============================================================ */

function RevealSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   主页面
   ============================================================ */

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('listDetail');
  const queryClient = useQueryClient();

  const listId = params.id as string;

  // ─── 数据获取 ───
  const { data: listData, isLoading, isError, refetch } = useQuery<ListDetail>({
    queryKey: ['list-detail', listId],
    queryFn: () => fetchListById(listId),
    enabled: !!listId,
  });

  // ─── 榜单级投票状态 ───
  const { data: voteData } = useQuery({
    queryKey: ['list-vote', listId],
    queryFn: () => getListVoteStatus(listId),
    enabled: !!listId,
  });

  const [myVote, setMyVote] = useState<'up' | 'down' | null>(voteData?.direction ?? null);
  const [upvoteCount, setUpvoteCount] = useState(listData?.upvoteCount ?? 0);
  const [downvoteCount, setDownvoteCount] = useState(listData?.downvoteCount ?? 0);
  // 乐观更新置信度：投票后立即响应当前投票变化，后端数据回来后自动覆盖
  const [optimisticConfidence, setOptimisticConfidence] = useState<number | null>(null);
  // 🦌 阿鹿赫尔战队 — 关注 & 同好 交互状态
  const [followed, setFollowed] = useState(false);
  const [allied, setAllied] = useState(false);
  const [followAnim, setFollowAnim] = useState(false);
  const [allyAnim, setAllyAnim] = useState(false);

  // 当 API 数据到达时同步状态（包括回滚乐观更新）
  React.useEffect(() => {
    if (listData) {
      setUpvoteCount(listData.upvoteCount);
      setDownvoteCount(listData.downvoteCount);
      // 后端真实数据到达后，清除乐观估算
      setOptimisticConfidence(null);
    }
  }, [listData]);

  React.useEffect(() => {
    if (voteData) {
      setMyVote(voteData.direction);
    }
  }, [voteData]);

  // 投票 mutation
  const voteMutation = useMutation({
    mutationFn: (direction: 'up' | 'down') => voteList(listId, direction),
    onSuccess: (result) => {
      setMyVote(result.direction);
      setUpvoteCount(result.upvoteCount);
      setDownvoteCount(result.downvoteCount);
      // 乐观更新置信度：根据新投票数即时估算（0-1，与 enrichList 同公式）
      const newUpvote = result.upvoteCount;
      const newDownvote = result.downvoteCount;
      const newTotal = newUpvote + newDownvote;
      const voteRatio = newTotal > 0 ? newUpvote / newTotal : 0;
      const scoreCount = listData?.communityScores?.length ?? 0;
      const base = scoreCount > 0 ? 0.2 : 0.05;
      const participationBoost = Math.min(0.4, (scoreCount / 30) * 0.2);
      const consensusBoost = newTotal > 0 ? Math.min(0.3, voteRatio * 0.3) : 0;
      const optimistic = Math.min(0.99, Math.max(0.05, base + participationBoost + consensusBoost));
      setOptimisticConfidence(optimistic);
      // 刷新榜单详情以获取最新置信度
      queryClient.invalidateQueries({ queryKey: ['list-detail', listId] });
    },
  });

  const handleListVote = useCallback((direction: 'up' | 'down') => {
    voteMutation.mutate(direction);
  }, [voteMutation]);

  // ─── 评论数据（独立 API） ───
  const { data: commentsData } = useQuery({
    queryKey: ['list-comments', listId],
    queryFn: () => fetchComments(listId),
    enabled: !!listId,
  });

  const comments: CommentData[] = useMemo(
    () => commentsData?.data ? toComments(commentsData.data) : [],
    [commentsData],
  );

  // 评论 mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) => postComment(listId, content),
    onSuccess: () => {
      // 刷新评论列表
      queryClient.invalidateQueries({ queryKey: ['list-comments', listId] });
    },
  });

  // 评分详情弹窗
  const [detailItem, setDetailItem] = useState<RankingItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleItemClick = useCallback((item: RankingItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  const handleCommentSubmit = useCallback((content: string) => {
    commentMutation.mutate(content);
  }, [commentMutation]);

  // 排名条目
  const rankingItems: RankingItem[] = useMemo(
    () => listData ? toRankingItems(listData) : [],
    [listData],
  );

  // 置信度 — 优先使用乐观更新值（投票后立即响应），否则用后端真实值（0-1）
  const confidence = optimisticConfidence ?? (listData ? computeListConfidence(listData) : 0);
  // ConfidencePanel 内部期望 0-100，传递时乘以 100

  // 共识度 params — 优先使用后端 scoring 引擎返回的真实参数
  // 投票后乐观更新 voteConsensus
  const confidenceParams = useMemo(
    () => {
      const baseParams = listData?.confidenceParams
        ? {
            N: listData.confidenceParams.N,
            tau: listData.confidenceParams.tau,
            sentiment: listData.confidenceParams.sentiment,
            daysSinceLastVote: listData.confidenceParams.daysSinceLastVote,
            voteConsensus: listData.confidenceParams.voteConsensus ?? listData.voteConsensus ?? 0,
          }
        : {
            N: listData?.stats?.community?.totalVotes ?? 0,
            tau: listData?.stats?.community?.avgConfidence ?? 0,
            sentiment: 0.5,
            daysSinceLastVote: 5,
            voteConsensus: listData?.voteConsensus ?? 0,
          };

      // 投票后乐观更新 voteConsensus
      if (optimisticConfidence !== null) {
        const newTotal = upvoteCount + downvoteCount;
        return {
          ...baseParams,
          voteConsensus: newTotal > 0 ? upvoteCount / newTotal : 0,
        };
      }
      return baseParams;
    },
    [listData, optimisticConfidence, upvoteCount, downvoteCount],
  );

  // ─── 加载态 ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-black border-t-transparent mx-auto mb-6" />
          <p className="text-black/40 text-sm tracking-wider uppercase">
            {t('loading') ?? '加载中...'}
          </p>
        </div>
      </div>
    );
  }

  // ─── 错误态 ───
  if (isError || !listData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-black text-xl font-light mb-4">
            {t('errorTitle') ?? '加载失败'}
          </p>
          <p className="text-black/40 text-sm mb-8">
            {t('errorDesc') ?? '无法获取榜单数据'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest border border-black text-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            {t('retry') ?? '重试'}
          </button>
        </div>
      </div>
    );
  }

  const itemCount = listData.items.length;
  const participantCount = listData.stats.community.totalVotes;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ─── 顶部导航：Monopo 极简细线 header ─── */}
      <header
        className="fixed top-0 inset-x-0 z-50 bg-white"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-[1440px] mx-auto px-10 md:px-20 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-black/30 hover:text-black transition-colors duration-300"
            aria-label="返回"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">{t('backToList') ?? '返回'}</span>
          </button>

          <span className="text-[10px] uppercase tracking-[0.2em] text-black/20 font-light">
            {t('listDetail') ?? '榜单详情'}
          </span>

          {/* Spacer for balance */}
          <div className="w-16" />
        </div>
      </header>

      {/* ─── Hero 区：Monopo 杂志式大标题 ─── */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-10 md:px-20">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Massive editorial headline */}
            <h1
              className="text-[clamp(2.5rem,6vw,4.75rem)] font-normal leading-[1.05] tracking-[-0.02em] max-w-4xl"
              style={{ fontFamily: 'var(--font-heading), Inter, Helvetica, sans-serif' }}
            >
              {listData.title}
            </h1>

            {/* Subtitle — provocative single line */}
            {listData.subtitle && (
              <p
                className="mt-8 text-base md:text-lg font-light text-black/40 max-w-xl leading-relaxed"
                style={{ fontFamily: 'var(--font-heading), Inter, Helvetica, sans-serif' }}
              >
                {listData.subtitle}
              </p>
            )}

            {/* Author + Stats — understated, separated by generous space */}
            <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white bg-black"
                >
                  {listData.author.nickname.charAt(0)}
                </div>
                <span className="text-sm font-light text-black/60">
                  {listData.author.nickname}
                </span>
              </div>

              {/* Thin divider */}
              <span className="hidden sm:block w-px h-5 bg-black/10" />

              {/* Stats */}
              <div className="flex items-center gap-6 text-xs uppercase tracking-wider text-black/30">
                <span>
                  {itemCount} {t('itemCount') ?? '项'}
                </span>
                <span>
                  {participantCount} {t('voteCount') ?? '参与'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        confidence >= 0.6 ? '#7FB3A3' : '#E8A849',
                    }}
                  />
                  共识 {(confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 投票区：轻量，融入 hero 底部 ─── */}
      <section className="pb-16 md:pb-20 px-10 md:px-20">
        <div className="max-w-[1440px] mx-auto">
          <RevealSection delay={0.15}>
            <div className="border-t border-black/5 pt-10 max-w-xl">
              <ListVoteButtons
                myVote={myVote}
                upvoteCount={upvoteCount}
                downvoteCount={downvoteCount}
                onVote={handleListVote}
              />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── 滚动指示器 ─── */}
      <div className="px-10 md:px-20 pb-8">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-[10px] uppercase tracking-[0.3em] text-black/15"
          >
            ↓ {t('scrollDown') ?? '向下浏览'}
          </motion.div>
        </div>
      </div>

      {/* ─── 排名 + 侧栏：Monopo 编辑式两列布局 ─── */}
      <section className="pb-32 px-10 md:px-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* 左列：排名 */}
            <div className="flex-1 min-w-0">
              <RevealSection delay={0.1}>
                <RankingTable
                  items={rankingItems}
                  onItemClick={handleItemClick}
                />
              </RevealSection>
            </div>

            {/* 右列：共识度 + 社区 + 评论 */}
            <div className="lg:w-[360px] flex-shrink-0">
              <div className="space-y-20">
                <RevealSection delay={0.25}>
                  <ConfidencePanel
                    params={confidenceParams}
                    overrideValue={confidence * 100}
                  />
                </RevealSection>

                <RevealSection delay={0.35}>
                  <CommunityScores
                    participantCount={participantCount}
                    averageAgreement={listData.stats.community.avgConfidence}
                  />
                </RevealSection>

                <RevealSection delay={0.45}>
                  <CommentSection
                    comments={comments}
                    onSubmit={handleCommentSubmit}
                  />
                </RevealSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 底部操作栏：Monopo 极简固定栏 ─── */}
      <motion.footer
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.5 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-[1440px] mx-auto px-10 md:px-20 h-14 flex items-center justify-between">
          {/* Left actions */}
          <div className="flex items-center gap-4">
            {/* Export — 突出显示，这是最重要的操作之一 */}
            <Link href={`/list/${listId}/export`}>
              <motion.span
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] font-medium text-black/60 hover:text-black transition-colors duration-300 cursor-pointer px-2.5 py-1 -mx-2.5 -my-1 rounded-sm hover:bg-black/[0.04]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <path d="M7 1v8M3 6l4 4 4-4M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('exportShareCard') ?? '导出'}
              </motion.span>
            </Link>

            {/* Ally button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setAllied(v => !v);
                setAllyAnim(true);
                setTimeout(() => setAllyAnim(false), 1500);
              }}
              className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors duration-300 ${
                allied
                  ? 'text-black font-medium'
                  : 'text-black/20 hover:text-black/50'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={allied ? 'allied' : 'ally'}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {allied ? '🤝' : '🤝'}
                </motion.span>
              </AnimatePresence>
              {allied
                ? (t('findAlly') ?? '同好')
                : (t('findAlly') ?? '同好')}
            </motion.button>

            {/* Ally toast */}
            <AnimatePresence>
              {allyAnim && (
                <motion.span
                  initial={{ opacity: 0, y: 10, x: '-50%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="fixed bottom-20 left-1/2 z-50 px-4 py-2 bg-black text-white text-xs rounded pointer-events-none"
                >
                  {allied ? '🤝 已找到同好！' : '已取消同好'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Follow button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFollowed(v => !v);
              setFollowAnim(true);
              setTimeout(() => setFollowAnim(false), 1500);
            }}
            className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors duration-300 ${
              followed
                ? 'text-black font-medium'
                : 'text-black/20 hover:text-black/50'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={followed ? 'followed' : 'follow'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {followed ? '★' : '☆'}
              </motion.span>
            </AnimatePresence>
            {followed
              ? (t('followList') ?? '关注')
              : (t('followList') ?? '关注')}
          </motion.button>

          {/* Follow toast */}
          <AnimatePresence>
            {followAnim && (
              <motion.span
                initial={{ opacity: 0, y: 10, x: '-50%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed bottom-20 left-1/2 z-50 px-4 py-2 bg-black text-white text-xs rounded pointer-events-none"
              >
                {followed ? '★ 已关注此榜单！' : '已取消关注'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.footer>

      {/* ─── 评分详情弹窗 ─── */}
      <ScoreDetailDialog
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* 底部占位 — 防止操作栏遮挡 */}
      <div className="h-14" />
    </div>
  );
}
