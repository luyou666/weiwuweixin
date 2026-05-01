'use client';

/**
 * 围物为心 — 紧凑版榜单投票按钮
 * 用于发现页话题聚合卡片内，只显示图标+计数
 * 投票后通过回调即时更新置信度
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { voteList } from '@/lib/api-client';

export interface CompactVoteButtonsProps {
  listId: string;
  myVote: 'up' | 'down' | null;
  upvoteCount: number;
  downvoteCount: number;
  /** 投票成功后回调，返回新的投票数据供父组件乐观更新 */
  onVoteSuccess?: (data: {
    direction: 'up' | 'down' | null;
    upvoteCount: number;
    downvoteCount: number;
  }) => void;
}

export function CompactVoteButtons({
  listId,
  myVote: initialVote,
  upvoteCount: initialUp,
  downvoteCount: initialDown,
  onVoteSuccess,
}: CompactVoteButtonsProps) {
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(initialVote);
  const [upvoteCount, setUpvoteCount] = useState(initialUp);
  const [downvoteCount, setDownvoteCount] = useState(initialDown);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return;
    setIsVoting(true);

    // 乐观更新
    let newUp = upvoteCount;
    let newDown = downvoteCount;
    let newVote: 'up' | 'down' | null = direction;

    if (myVote === direction) {
      // 取消投票
      newVote = null;
      if (direction === 'up') newUp = upvoteCount - 1;
      else newDown = downvoteCount - 1;
    } else if (myVote === null) {
      // 首次投票
      if (direction === 'up') newUp = upvoteCount + 1;
      else newDown = downvoteCount + 1;
    } else {
      // 切换方向
      if (direction === 'up') {
        newUp = upvoteCount + 1;
        newDown = downvoteCount - 1;
      } else {
        newUp = upvoteCount - 1;
        newDown = downvoteCount + 1;
      }
    }

    setMyVote(newVote);
    setUpvoteCount(newUp);
    setDownvoteCount(newDown);

    // 通知父组件（用于更新置信度）
    onVoteSuccess?.({
      direction: newVote,
      upvoteCount: newUp,
      downvoteCount: newDown,
    });

    try {
      const result = await voteList(listId, direction);
      // 用后端真实数据校正
      setMyVote(result.direction);
      setUpvoteCount(result.upvoteCount);
      setDownvoteCount(result.downvoteCount);

      onVoteSuccess?.({
        direction: result.direction,
        upvoteCount: result.upvoteCount,
        downvoteCount: result.downvoteCount,
      });
    } catch {
      // 失败回滚
      setMyVote(initialVote);
      setUpvoteCount(initialUp);
      setDownvoteCount(initialDown);
      onVoteSuccess?.({
        direction: initialVote,
        upvoteCount: initialUp,
        downvoteCount: initialDown,
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-2xs">
      {/* 赞同 */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('up'); }}
        disabled={isVoting}
        className={[
          'group flex items-center gap-3xs px-xs py-2xs rounded-[var(--radius-sm)] transition-all duration-200 border text-xs',
          myVote === 'up'
            ? 'border-[var(--celadon)] bg-[var(--celadon-bg,rgba(127,179,163,0.12))] text-[var(--celadon)]'
            : 'border-transparent text-[var(--ink-300)] hover:text-[var(--celadon)] hover:bg-[var(--celadon-bg,rgba(127,179,163,0.06))]',
        ].join(' ')}
        aria-label="赞同"
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
          'group flex items-center gap-3xs px-xs py-2xs rounded-[var(--radius-sm)] transition-all duration-200 border text-xs',
          myVote === 'down'
            ? 'border-[var(--vermilion)] bg-[var(--vermilion-bg,rgba(226,85,63,0.08))] text-[var(--vermilion)]'
            : 'border-transparent text-[var(--ink-300)] hover:text-[var(--vermilion)] hover:bg-[var(--vermilion-bg,rgba(226,85,63,0.05))]',
        ].join(' ')}
        aria-label="存疑"
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
  );
}

export default CompactVoteButtons;