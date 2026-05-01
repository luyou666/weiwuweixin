'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { Card, ConfidenceSeal } from '@weiwuweixin/ui';
import { voteList } from '@/lib/api-client';

/* ============================================================
   话题聚合卡片 — 同名/同类榜单合并展示
   显示合并的榜单数量
   "查看全部"展开
   投票后置信度即时同步
   ============================================================ */

export interface TopicAggregationItem {
  id: string;
  title: string;
  confidence: number;
  authorName: string;
  itemCount: number;
  tags?: string[];
  upvoteCount?: number;
  downvoteCount?: number;
  myVote?: 'up' | 'down' | null;
  /** 后端原始字段，用于重算置信度 */
  scoreCount?: number;
}

export interface TopicAggregation {
  topicId?: string;
  topicName: string;
  categoryIcon?: string;
  mergedCount: number;
  items: TopicAggregationItem[];
}

interface TopicAggregationProps {
  aggregations: TopicAggregation[];
  className?: string;
}

/**
 * 投票后重算置信度（与 enrichList / 后端 calcConfidence 保持完全一致）
 * 公式: base(0.2/0.05) + participationBoost(≤0.4) + consensusBoost(≤0.3)
 */
function recalcConfidence(item: TopicAggregationItem, upvotes: number, downvotes: number): number {
  const scoreCount = item.scoreCount ?? 0;
  const totalVotes = upvotes + downvotes;
  const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;

  const base = scoreCount > 0 ? 0.2 : 0.05;
  const participationBoost = Math.min(0.4, (scoreCount / 30) * 0.2);
  const consensusBoost = totalVotes > 0 ? Math.min(0.3, voteRatio * 0.3) : 0;

  return Math.min(0.99, Math.max(0.05, base + participationBoost + consensusBoost));
}

export function TopicAggregation({
  aggregations,
  className = '',
}: TopicAggregationProps) {
  const t = useTranslations('explore');

  if (aggregations.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="font-[var(--font-heading)] text-xl text-ink-900 mb-lg">
        {t('topicAggregation')}
      </h2>
      <div className="flex flex-col gap-lg">
        {aggregations.map((agg) => (
          <TopicCard key={agg.topicId ?? agg.topicName} aggregation={agg} />
        ))}
      </div>
    </section>
  );
}

/* ─── 单个话题聚合卡片 ─── */
function TopicCard({ aggregation }: { aggregation: TopicAggregation }) {
  const t = useTranslations('explore');
  const [expanded, setExpanded] = useState(false);
  const { topicName, categoryIcon, mergedCount, items } = aggregation;

  // 每个条目的乐观状态：confidence / upvoteCount / downvoteCount / myVote
  const [itemStates, setItemStates] = useState(() =>
    items.map((item) => ({
      confidence: item.confidence,
      upvoteCount: item.upvoteCount ?? 0,
      downvoteCount: item.downvoteCount ?? 0,
      myVote: item.myVote ?? null as 'up' | 'down' | null,
    }))
  );

  const handleVoteSuccess = useCallback((index: number, data: {
    direction: 'up' | 'down' | null;
    upvoteCount: number;
    downvoteCount: number;
  }) => {
    setItemStates((prev) => {
      const next = [...prev];
      const item = items[index];
      const newConfidence = recalcConfidence(item, data.upvoteCount, data.downvoteCount);
      next[index] = {
        confidence: newConfidence,
        upvoteCount: data.upvoteCount,
        downvoteCount: data.downvoteCount,
        myVote: data.direction,
      };
      return next;
    });
  }, [items]);

  const displayItems = expanded ? items : items.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Card interactive={false} className="overflow-hidden">
        {/* 话题头部 */}
        <div className="flex items-center gap-sm mb-md">
          <span className="text-2xl">{categoryIcon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-[var(--font-heading)] text-lg text-ink-900 truncate">
              {topicName}
            </h3>
            <p className="text-xs text-ink-500">
              {t('mergedCount', { count: mergedCount })}
            </p>
          </div>

          {/* 合并数量徽章 */}
          <motion.span
            className="inline-flex items-center justify-center min-w-[24px] h-6 px-xs rounded-[var(--radius-md)] bg-celadon/15 text-celadon-dark text-xs font-semibold"
            whileHover={{ scale: 1.05 }}
          >
            {mergedCount}
          </motion.span>
        </div>

        {/* 合并榜单列表 */}
        <div className="flex flex-col gap-sm">
          <AnimatePresence>
            {displayItems.map((item, i) => {
              const state = itemStates[i] ?? { confidence: item.confidence, upvoteCount: 0, downvoteCount: 0, myVote: null };
              return (
                <div key={item.id} className="flex items-center gap-sm">
                  {/* 置信度印章 — 投票后即时同步 */}
                  <motion.div
                    className="flex-shrink-0"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.4 }}
                    key={`seal-${state.confidence}`}
                  >
                    <ConfidenceSeal confidence={state.confidence} size="sm" spinning={false} />
                  </motion.div>

                  {/* 中间内容 */}
                  <Link href={`/list/${item.id}`} className="flex-1 min-w-0 block">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.05 }}
                      className="flex items-center gap-sm p-sm rounded-[var(--radius-md)] bg-rice/60 hover:bg-rice transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-900 truncate">{item.title}</p>
                        <p className="text-xs text-ink-500">
                          {item.authorName} · {item.itemCount} {t('items')}
                        </p>
                      </div>

                      {/* 标签 */}
                      <div className="flex gap-3xs overflow-hidden">
                        {(item.tags ?? []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-xs py-3xs text-xs rounded-[var(--radius-sm)] bg-rice text-ink-500 border border-ink-100 whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </Link>

                  {/* 投票按钮 — 赞同/存疑 */}
                  <CompactVoteButtonsInline
                    listId={item.id}
                    myVote={state.myVote}
                    upvoteCount={state.upvoteCount}
                    downvoteCount={state.downvoteCount}
                    onVoteSuccess={(data) => handleVoteSuccess(i, data)}
                  />
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 查看全部 / 收起 */}
        {items.length > 2 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-md w-full text-center text-sm text-indigo hover:text-indigo-light hover:-translate-y-px active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            {expanded ? t('collapse') : t('viewAll')}
          </button>
        )}
      </Card>
    </motion.div>
  );
}

/* ─── 紧凑内联投票按钮 ─── */
function CompactVoteButtonsInline({
  listId,
  myVote: initialVote,
  upvoteCount: initialUp,
  downvoteCount: initialDown,
  onVoteSuccess,
}: {
  listId: string;
  myVote: 'up' | 'down' | null;
  upvoteCount: number;
  downvoteCount: number;
  onVoteSuccess: (data: { direction: 'up' | 'down' | null; upvoteCount: number; downvoteCount: number }) => void;
}) {
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(initialVote);
  const [upvoteCount, setUpvoteCount] = useState(initialUp);
  const [downvoteCount, setDownvoteCount] = useState(initialDown);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return;
    setIsVoting(true);

    // 乐观计算新值
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
    onVoteSuccess({ direction: newVote, upvoteCount: newUp, downvoteCount: newDown });

    try {
      const result = await voteList(listId, direction);
      setMyVote(result.direction);
      setUpvoteCount(result.upvoteCount);
      setDownvoteCount(result.downvoteCount);
      onVoteSuccess({
        direction: result.direction,
        upvoteCount: result.upvoteCount,
        downvoteCount: result.downvoteCount,
      });
    } catch {
      // 回滚
      setMyVote(initialVote);
      setUpvoteCount(initialUp);
      setDownvoteCount(initialDown);
      onVoteSuccess({ direction: initialVote, upvoteCount: initialUp, downvoteCount: initialDown });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* 赞同 */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('up'); }}
        disabled={isVoting}
        className={[
          'flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 border',
          myVote === 'up'
            ? 'border-[var(--celadon)] bg-[var(--celadon-bg,rgba(127,179,163,0.12))] text-[var(--celadon)]'
            : 'border-transparent text-[var(--ink-300)] hover:border-[var(--celadon)] hover:text-[var(--celadon)]',
        ].join(' ')}
        aria-label="赞同"
        title="赞同"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill={myVote === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M6 12V8a1 1 0 011-1h2l1.5-4a.5.5 0 01.5-.3c.8 0 1.5.7 1.5 1.5V8h3a1 1 0 011 1.1l-.8 5a1 1 0 01-1 .9H7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 8h3v7H3a1 1 0 01-1-1V9a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" fill={myVote === 'up' ? 'currentColor' : 'none'} />
        </svg>
      </button>

      {/* 存疑 */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('down'); }}
        disabled={isVoting}
        className={[
          'flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 border',
          myVote === 'down'
            ? 'border-[var(--vermilion)] bg-[var(--vermilion-bg,rgba(226,85,63,0.08))] text-[var(--vermilion)]'
            : 'border-transparent text-[var(--ink-300)] hover:border-[var(--vermilion)] hover:text-[var(--vermilion)]',
        ].join(' ')}
        aria-label="存疑"
        title="存疑"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill={myVote === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className="rotate-180">
          <path d="M6 12V8a1 1 0 011-1h2l1.5-4a.5.5 0 01.5-.3c.8 0 1.5.7 1.5 1.5V8h3a1 1 0 011 1.1l-.8 5a1 1 0 01-1 .9H7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 8h3v7H3a1 1 0 01-1-1V9a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" fill={myVote === 'down' ? 'currentColor' : 'none'} />
        </svg>
      </button>
    </div>
  );
}

export default TopicAggregation;