'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { Card, ConfidenceSeal, SkeletonInk, EmptyState } from '@weiwuweixin/ui';
import { voteList } from '@/lib/api-client';
import type { FeedList } from '@/lib/api';

/* ============================================================
   榜单瀑布流 — StickerCard 风格
   FLIP 动画排序切换
   无限滚动加载
   投票后置信度即时同步
   ============================================================ */

/** 重新计算置信度（与 enrichList 公式一致） */
function recalcListConfidence(list: FeedList, upvotes: number, downvotes: number): number {
  const scoreCount = list._count?.communityScores ?? 0;
  const totalVotes = upvotes + downvotes;
  const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;

  const base = scoreCount > 0 ? 0.2 : 0.05;
  const participationBoost = Math.min(0.4, (scoreCount / 30) * 0.2);
  const consensusBoost = totalVotes > 0 ? Math.min(0.3, voteRatio * 0.3) : 0;

  return Math.min(0.99, Math.max(0.05, base + participationBoost + consensusBoost));
}

interface ListWaterfallProps {
  lists: FeedList[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  sortKey?: string; // 变化时触发 FLIP 动画
  className?: string;
}

export function ListWaterfall({
  lists,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  sortKey,
  className = '',
}: ListWaterfallProps) {
  const t = useTranslations('explore');
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 无限滚动 IntersectionObserver
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, isLoading]);

  // 乐观置信度状态：listId → optimisticConfidence
  const [optimisticConfidences, setOptimisticConfidences] = useState<Record<string, number>>({});

  const handleVoteSuccess = useCallback((listId: string, list: FeedList, data: {
    upvoteCount: number;
    downvoteCount: number;
  }) => {
    const newConfidence = recalcListConfidence(list, data.upvoteCount, data.downvoteCount);
    setOptimisticConfidences((prev) => ({ ...prev, [listId]: newConfidence }));
  }, []);

  if (lists.length === 0 && !isLoading) {
    return (
      <EmptyState
        scene="search-empty"
        title={t('emptyTitle')}
        description={t('emptyDesc')}
        size="lg"
      />
    );
  }

  return (
    <div className={className}>
      {/* 瀑布流网格 — 双列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <AnimatePresence mode="popLayout">
          {lists.map((list, i) => (
            <StickerCard
              key={list.id}
              list={list}
              index={i}
              sortKey={sortKey}
              confidence={optimisticConfidences[list.id] ?? list.confidence}
              onVoteSuccess={(data) => handleVoteSuccess(list.id, list, data)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 加载更多 - 骨架屏 */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-lg">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonInk
              key={`skeleton-${i}`}
              variant="card"
              width="100%"
              height="180px"
            />
          ))}
        </div>
      )}

      {/* 无限滚动哨兵 */}
      {hasMore && (
        <div ref={sentinelRef} className="h-xs" aria-hidden="true" />
      )}

      {/* 没有更多数据 */}
      {!hasMore && lists.length > 0 && (
        <p className="text-center text-sm text-ink-300 mt-xl">
          {t('noMore')}
        </p>
      )}
    </div>
  );
}

/* ─── StickerCard 风格榜单卡片 ─── */
function StickerCard({
  list,
  index,
  sortKey,
  confidence,
  onVoteSuccess,
}: {
  list: FeedList;
  index: number;
  sortKey?: string;
  confidence: number;
  onVoteSuccess: (data: { upvoteCount: number; downvoteCount: number }) => void;
}) {
  const t = useTranslations('explore');

  // 使用 sortKey 作为 layoutId 前缀，触发 FLIP 动画
  const layoutId = sortKey ? `card-${sortKey}-${list.id}` : undefined;

  // 投票状态
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(null);
  const [upvoteCount, setUpvoteCount] = useState(list.upvoteCount ?? 0);
  const [downvoteCount, setDownvoteCount] = useState(list.downvoteCount ?? 0);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return;
    setIsVoting(true);

    let newUp = upvoteCount;
    let newDown = downvoteCount;
    let newVote: 'up' | 'down' | null = direction;

    if (myVote === direction) {
      newVote = null;
      if (direction === 'up') newUp = upvoteCount - 1;
      else newDown = downvoteCount - 1;
    } else if (myVote === null) {
      if (direction === 'up') newUp = upvoteCount + 1;
      else newDown = downvoteCount + 1;
    } else {
      if (direction === 'up') { newUp = upvoteCount + 1; newDown = downvoteCount - 1; }
      else { newUp = upvoteCount - 1; newDown = downvoteCount + 1; }
    }

    setMyVote(newVote);
    setUpvoteCount(newUp);
    setDownvoteCount(newDown);

    // 立即通知父组件更新置信度
    onVoteSuccess({ upvoteCount: newUp, downvoteCount: newDown });

    try {
      const result = await voteList(list.id, direction);
      setMyVote(result.direction);
      setUpvoteCount(result.upvoteCount);
      setDownvoteCount(result.downvoteCount);
      onVoteSuccess({ upvoteCount: result.upvoteCount, downvoteCount: result.downvoteCount });
    } catch {
      // 回滚
      setMyVote(null);
      setUpvoteCount(list.upvoteCount ?? 0);
      setDownvoteCount(list.downvoteCount ?? 0);
      onVoteSuccess({ upvoteCount: list.upvoteCount ?? 0, downvoteCount: list.downvoteCount ?? 0 });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div
      layout={!!sortKey}
      layoutId={layoutId}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: Math.min(index * 0.04, 0.3),
      }}
    >
      <Card interactive size="md" className="h-full">
        <div className="flex gap-md">
          {/* 置信度印章 — 投票后即时同步 */}
          <motion.div
            className="flex-shrink-0 pt-xs"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 0.4 }}
            key={`seal-${confidence}`}
          >
            <ConfidenceSeal
              confidence={confidence}
              size="sm"
              spinning={false}
            />
          </motion.div>

          {/* 内容区 */}
          <div className="flex-1 min-w-0">
            <Link href={`/list/${list.id}`}>
              <h3 className="font-[var(--font-heading)] text-lg text-ink-900 truncate hover:text-vermilion transition-colors">
                {list.title}
              </h3>
            </Link>
            <p className="text-sm text-ink-500 mt-3xs line-clamp-2">
              {list.subtitle}
            </p>

            {/* 标签 + 投票按钮 */}
            <div className="flex items-center gap-sm mt-sm">
              {/* 标签 */}
              <div className="flex flex-wrap gap-3xs flex-1 min-w-0">
                {list.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-sm py-3xs text-xs rounded-[var(--radius-md)] bg-rice text-ink-500 border border-ink-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 投票按钮 */}
              <div className="flex items-center gap-2xs flex-shrink-0">
                {/* 赞同 */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('up'); }}
                  disabled={isVoting}
                  className={[
                    'flex items-center gap-3xs px-xs py-2xs rounded-[var(--radius-sm)] transition-all duration-200 border text-xs',
                    myVote === 'up'
                      ? 'border-[var(--celadon)] bg-[var(--celadon-bg,rgba(127,179,163,0.12))] text-[var(--celadon)]'
                      : 'border-transparent text-[var(--ink-300)] hover:text-[var(--celadon)] hover:bg-[var(--celadon-bg,rgba(127,179,163,0.06))]',
                  ].join(' ')}
                  aria-label="赞同"
                  title="赞同"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill={myVote === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 12V8a1 1 0 011-1h2l1.5-4a.5.5 0 01.5-.3c.8 0 1.5.7 1.5 1.5V8h3a1 1 0 011 1.1l-.8 5a1 1 0 01-1 .9H7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 8h3v7H3a1 1 0 01-1-1V9a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" fill={myVote === 'up' ? 'currentColor' : 'none'} />
                  </svg>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={upvoteCount}
                      initial={{ y: -4, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 4, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="font-[var(--font-mono)] tabular-nums"
                    >
                      {upvoteCount}
                    </motion.span>
                  </AnimatePresence>
                </button>

                {/* 存疑 */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('down'); }}
                  disabled={isVoting}
                  className={[
                    'flex items-center gap-3xs px-xs py-2xs rounded-[var(--radius-sm)] transition-all duration-200 border text-xs',
                    myVote === 'down'
                      ? 'border-[var(--vermilion)] bg-[var(--vermilion-bg,rgba(226,85,63,0.08))] text-[var(--vermilion)]'
                      : 'border-transparent text-[var(--ink-300)] hover:text-[var(--vermilion)] hover:bg-[var(--vermilion-bg,rgba(226,85,63,0.05))]',
                  ].join(' ')}
                  aria-label="存疑"
                  title="存疑"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill={myVote === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className="rotate-180">
                    <path d="M6 12V8a1 1 0 011-1h2l1.5-4a.5.5 0 01.5-.3c.8 0 1.5.7 1.5 1.5V8h3a1 1 0 011 1.1l-.8 5a1 1 0 01-1 .9H7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 8h3v7H3a1 1 0 01-1-1V9a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" fill={myVote === 'down' ? 'currentColor' : 'none'} />
                  </svg>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={downvoteCount}
                      initial={{ y: -4, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 4, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="font-[var(--font-mono)] tabular-nums"
                    >
                      {downvoteCount}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* 元信息行 */}
            <div className="flex items-center justify-between mt-sm text-xs text-ink-300">
              <span>
                {list.author.nickname} · {list.itemCount} {t('items')} ·{' '}
                {list.viewCount} {t('views')}
              </span>
              <span>
                {new Date(list.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default ListWaterfall;