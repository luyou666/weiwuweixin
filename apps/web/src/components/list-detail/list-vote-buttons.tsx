'use client';

/**
 * 围物为心 — 榜单级点赞/点踩按钮组件
 *
 * 直接对整个榜单投赞同票（up）或存疑票（down），影响榜单整体置信度。
 * 再次点击同一方向可取消投票，切换方向自动调整计数。
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export interface ListVoteButtonsProps {
  myVote: 'up' | 'down' | null;
  upvoteCount: number;
  downvoteCount: number;
  onVote: (direction: 'up' | 'down') => void;
}

export function ListVoteButtons({ myVote, upvoteCount, downvoteCount, onVote }: ListVoteButtonsProps) {
  const t = useTranslations('listDetail');

  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-sm)] font-[var(--font-heading)]" style={{ color: 'var(--ink-500)' }}>
        {t('voteListLabel') ?? '对此榜单的态度'}
      </span>

      <div className="flex items-center gap-md">
        {/* 点赞 */}
        <button type="button"
          onClick={() => onVote('up')}
          className={[
            'group flex items-center gap-xs px-md py-sm rounded-[var(--radius-md, 8px)] transition-all duration-200 focus:outline-none border',
            myVote === 'up'
              ? 'border-[var(--celadon)] bg-[var(--celadon-bg,rgba(127,179,163,0.12))] text-[var(--celadon)]'
              : 'border-[var(--color-border)] text-[var(--ink-400)] hover:border-[var(--celadon)] hover:text-[var(--celadon)] hover:bg-[var(--celadon-bg,rgba(127,179,163,0.06))]',
          ].join(' ')}
          aria-label={t('upvoteLabel') ?? '赞同'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill={myVote === 'up' ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            className="transition-transform duration-200 group-hover:scale-110"
          >
            <path d="M6 12V8a1 1 0 011-1h2l1.5-4a.5.5 0 01.5-.3c.8 0 1.5.7 1.5 1.5V8h3a1 1 0 011 1.1l-.8 5a1 1 0 01-1 .9H7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 8h3v7H3a1 1 0 01-1-1V9a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" fill={myVote === 'up' ? 'currentColor' : 'none'} />
          </svg>
          <span className="font-[var(--font-heading)] text-[var(--text-sm)]">
            {t('upvoteLabel') ?? '赞同'}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={upvoteCount}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-[var(--font-mono)] text-[var(--text-xs)] tabular-nums min-w-[1.5em]"
            >
              {upvoteCount}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* 点踩 */}
        <button type="button"
          onClick={() => onVote('down')}
          className={[
            'group flex items-center gap-xs px-md py-sm rounded-[var(--radius-md, 8px)] transition-all duration-200 focus:outline-none border',
            myVote === 'down'
              ? 'border-[var(--vermilion)] bg-[var(--vermilion-bg,rgba(226,85,63,0.08))] text-[var(--vermilion)]'
              : 'border-[var(--color-border)] text-[var(--ink-400)] hover:border-[var(--vermilion)] hover:text-[var(--vermilion)] hover:bg-[var(--vermilion-bg,rgba(226,85,63,0.05))]',
          ].join(' ')}
          aria-label={t('downvoteLabel') ?? '存疑'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill={myVote === 'down' ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            className="transition-transform duration-200 group-hover:scale-110 rotate-180"
          >
            <path d="M6 12V8a1 1 0 011-1h2l1.5-4a.5.5 0 01.5-.3c.8 0 1.5.7 1.5 1.5V8h3a1 1 0 011 1.1l-.8 5a1 1 0 01-1 .9H7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 8h3v7H3a1 1 0 01-1-1V9a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" fill={myVote === 'down' ? 'currentColor' : 'none'} />
          </svg>
          <span className="font-[var(--font-heading)] text-[var(--text-sm)]">
            {t('downvoteLabel') ?? '存疑'}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={downvoteCount}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-[var(--font-mono)] text-[var(--text-xs)] tabular-nums min-w-[1.5em]"
            >
              {downvoteCount}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

export default ListVoteButtons;