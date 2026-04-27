'use client';

/**
 * 围物为心 — 增强版评论区域
 *
 * 功能：
 * - 嵌套回复（最多 2 层）
 * - 情感标签筛选（正向/中性/负向，水墨色彩编码）
 * - 时间线排列
 * - 水墨风分割线
 * - 回复编辑器
 * - "加载更多"分页
 * - Framer Motion 展开/收起动画
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  buildCommentTree,
  filterBySentiment,
  countBySentiment,
  sortCommentsByTime,
  type FlatComment,
  type CommentNode,
  type SentimentType,
} from '@weiwuweixin/shared';
import { SentimentFilter } from './sentiment-filter';

/* ============================================================
   Types
   ============================================================ */

export interface CommentData {
  id: string;
  user: string;
  avatarUrl?: string;
  content: string;
  sentiment: number;
  createdAt: string;
  parentId?: string | null;
}

export interface CommentSectionProps {
  comments: CommentData[];
  onSubmit?: (content: string) => void;
  onReply?: (parentId: string, content: string) => void;
  /** 每页显示评论数 */
  pageSize?: number;
  className?: string;
}

/* ============================================================
   水墨色彩映射
   ============================================================ */

const SENTIMENT_STYLES: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  positive: {
    label: '认同',
    emoji: '👍',
    color: '#4a8c6f',
    bg: 'rgba(127,179,163,0.1)',  // 青瓷绿
  },
  neutral: {
    label: '中立',
    emoji: '💭',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.08)',  // 墨灰
  },
  negative: {
    label: '质疑',
    emoji: '😤',
    color: '#c0392b',
    bg: 'rgba(192,57,43,0.08)',  // 朱砂红
  },
};

/* ============================================================
   水墨风分割线
   ============================================================ */

function InkDivider() {
  return (
    <div className="relative h-px my-3 w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--ink-200), var(--ink-100), transparent)',
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[-2px] w-2 h-[5px] rounded-full opacity-30"
        style={{ background: 'var(--ink-300)' }}
      />
    </div>
  );
}

/* ============================================================
   时间格式化
   ============================================================ */

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 30) return `${diffDays} 天前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
    return `${Math.floor(diffDays / 365)} 年前`;
  } catch {
    return dateStr;
  }
}

/* ============================================================
   情感标签（小标签）
   ============================================================ */

function SentimentTag({ value }: { value: number }) {
  let label: string;
  let emoji: string;
  let color: string;
  let bg: string;

  if (value > 0.3) {
    ({ label, emoji, color, bg } = SENTIMENT_STYLES.positive);
  } else if (value < -0.3) {
    ({ label, emoji, color, bg } = SENTIMENT_STYLES.negative);
  } else {
    ({ label, emoji, color, bg } = SENTIMENT_STYLES.neutral);
  }

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm, 4px)] text-[10px] font-medium whitespace-nowrap"
      style={{ color, background: bg }}
    >
      {emoji} {label}
    </span>
  );
}

/* ============================================================
   头像组件
   ============================================================ */

function Avatar({ src, name }: { src?: string; name: string }) {
  const initial = name.charAt(0);
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        style={{ border: '1px solid var(--ink-100)' }}
      />
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
      style={{
        background: 'var(--ink-50, #f5f5f5)',
        color: 'var(--ink-600, #666)',
        border: '1px solid var(--ink-100)',
      }}
    >
      {initial}
    </div>
  );
}

/* ============================================================
   单条评论 + 回复列表
   ============================================================ */

interface CommentItemProps {
  comment: CommentNode;
  depth?: number;
  onReply: (parentId: string, nickname: string) => void;
  replyingTo: string | null;
}

function CommentItem({ comment, depth = 0, onReply, replyingTo }: CommentItemProps) {
  const t = useTranslations('comment');
  const showReplies = depth === 0 && comment.replies.length > 0;

  return (
    <div className="flex gap-3">
      {/* 时间线竖线 */}
      {depth > 0 && (
        <div
          className="w-px flex-shrink-0"
          style={{ background: 'var(--ink-100, #e5e5e5)' }}
        />
      )}

      <div className="flex-1 min-w-0">
        {/* 评论卡片 */}
        <div
          className="rounded-[var(--radius-md, 8px)] p-3 mb-1"
          style={{
            background: depth > 0
              ? 'rgba(var(--ink-50, 250 250 250), 0.5)'
              : 'var(--paper, #faf9f6)',
            border: '1px solid var(--ink-50, #f5f5f5)',
          }}
        >
          {/* 头部：头像 + 昵称 + 情感标签 + 时间 */}
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar src={comment.avatarUrl} name={comment.nickname} />
            <span
              className="font-[var(--font-heading)] text-sm font-medium"
              style={{ color: 'var(--ink-900, #1a1a1a)' }}
            >
              {comment.nickname}
            </span>
            <SentimentTag value={comment.sentiment} />
            <span className="text-[10px] ml-auto" style={{ color: 'var(--ink-300, #999)' }}>
              {formatTime(comment.createdAt)}
            </span>
          </div>

          {/* 评论内容 */}
          <p
            className="text-sm leading-relaxed mb-2"
            style={{ color: 'var(--ink-700, #444)', fontFamily: 'var(--font-body)' }}
          >
            {comment.content}
          </p>

          {/* 操作栏：回复按钮 */}
          <div className="flex items-center gap-3">
            <button
              className="text-[11px] font-medium transition-colors duration-150 hover:opacity-80"
              style={{ color: 'var(--ink-400, #999)' }}
              onClick={() => onReply(comment.id, comment.nickname)}
            >
              {t('reply')}
            </button>
          </div>
        </div>

        {/* 嵌套回复（仅第一层展示） */}
        <AnimatePresence>
          {showReplies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="ml-6 mt-1 space-y-2"
            >
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onReply={onReply}
                  replyingTo={replyingTo}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================
   回复编辑器
   ============================================================ */

interface ReplyEditorProps {
  parentId: string;
  nickname: string;
  onSubmit: (parentId: string, content: string) => void;
  onCancel: () => void;
}

function ReplyEditor({ parentId, nickname, onSubmit, onCancel }: ReplyEditorProps) {
  const t = useTranslations('comment');
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(parentId, text.trim());
    setText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2 ml-11 mb-2"
    >
      <span className="text-xs" style={{ color: 'var(--ink-400)' }}>
        @{nickname}
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) =>setText(e.target.value)}
        placeholder={t('replyPlaceholder') ?? '写下回复…'}
        className="flex-1 px-2.5 py-1.5 text-sm rounded-[var(--radius-md, 8px)] border border-[var(--color-border)] bg-[var(--paper)] text-[var(--ink-900)] placeholder:text-[var(--ink-300)] outline-none focus:border-[var(--vermilion)] focus:ring-1 focus:ring-[var(--vermilion)] transition-colors"
        style={{ fontFamily: 'var(--font-body)' }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="text-xs px-2.5 py-1.5 rounded-[var(--radius-md, 8px)] font-medium transition-colors"
        style={{
          background: text.trim() ? 'var(--vermilion, #c0392b)' : 'var(--ink-100)',
          color: text.trim() ? '#fff' : 'var(--ink-400)',
        }}
      >
        {t('submitReply') ?? '回复'}
      </button>
      <button
        onClick={onCancel}
        className="text-xs"
        style={{ color: 'var(--ink-400)' }}
      >
        {t('cancel') ?? '取消'}
      </button>
    </motion.div>
  );
}

/* ============================================================
   主组件 — CommentSection
   ============================================================ */

export function CommentSection({
  comments,
  onSubmit,
  onReply,
  pageSize = 5,
  className = '',
}: CommentSectionProps) {
  const t = useTranslations('comment');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    nickname: string;
  } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 将评论数据转为 FlatComment 格式
  const flatComments: FlatComment[] = useMemo(
    () =>
      comments.map((c) => ({
        id: c.id,
        nickname: c.user,
        avatarUrl: c.avatarUrl,
        content: c.content,
        sentiment: c.sentiment,
        createdAt: c.createdAt,
        parentId: c.parentId ?? null,
      })),
    [comments],
  );

  // 构建嵌套树
  const commentTree = useMemo(() => {
    const sorted = sortCommentsByTime(flatComments);
    const filtered = filterBySentiment(sorted, sentimentFilter);
    return buildCommentTree(filtered);
  }, [flatComments, sentimentFilter]);

  // 情感统计
  const sentimentCounts = useMemo(
    () => countBySentiment(flatComments),
    [flatComments],
  );

  // 分页
  const visibleTree = commentTree.slice(0, visibleCount);
  const hasMore = visibleCount < commentTree.length;

  const handleSubmitComment = useCallback(() => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit?.(newComment.trim());
      setNewComment('');
      setIsSubmitting(false);
    }, 300);
  }, [newComment, onSubmit]);

  const handleReply = useCallback(
    (parentId: string, content: string) => {
      onReply?.(parentId, content);
      setReplyingTo(null);
    },
    [onReply],
  );

  return (
    <div className={className}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: 'var(--indigo, #5B6ABF)' }}
        />
        <h3
          className="font-[var(--font-heading)] text-[var(--text-base)]"
          style={{ color: 'var(--color-text-primary, var(--ink-900))' }}
        >
          {t('title')}
        </h3>
        <span className="text-[var(--text-xs)] text-[var(--ink-300)]">
          {comments.length}
        </span>
      </div>

      {/* 情感筛选 */}
      <div className="mb-3">
        <SentimentFilter
          value={sentimentFilter}
          onChange={setSentimentFilter}
          counts={sentimentCounts}
        />
      </div>

      {/* 评论输入框 */}
      <div
        className="mb-4 p-3 rounded-[var(--radius-md, 8px)]"
        style={{
          background: 'var(--paper, #faf9f6)',
          border: '1px solid var(--ink-50, #f5f5f5)',
        }}
      >
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('placeholder') ?? '写下你的看法…'}
            rows={2}
            className="flex-1 px-3 py-2 rounded-[var(--radius-md, 8px)] border border-[var(--color-border)] bg-[var(--paper)] text-[var(--ink-900)] placeholder:text-[var(--ink-300)] text-sm resize-none outline-none focus:border-[var(--vermilion)] focus:ring-1 focus:ring-[var(--vermilion)] transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <div className="flex flex-col justify-end">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 rounded-[var(--radius-md, 8px)] text-sm font-medium transition-colors"
              style={{
                background: newComment.trim()
                  ? 'var(--vermilion, #c0392b)'
                  : 'var(--ink-100, #eee)',
                color: newComment.trim() ? '#fff' : 'var(--ink-400)',
              }}
            >
              {isSubmitting ? '…' : (t('submit') ?? '发表')}
            </button>
          </div>
        </div>
      </div>

      {/* 回复编辑器 */}
      <AnimatePresence>
        {replyingTo && (
          <ReplyEditor
            key={replyingTo.id}
            parentId={replyingTo.id}
            nickname={replyingTo.nickname}
            onSubmit={handleReply}
            onCancel={() => setReplyingTo(null)}
          />
        )}
      </AnimatePresence>

      {/* 评论列表（时间线排列） */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleTree.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <CommentItem
                comment={comment}
                onReply={(id, nickname) =>
                  setReplyingTo({ id, nickname })
                }
                replyingTo={replyingTo?.id ?? null}
              />
              <InkDivider />
            </motion.div>
          ))}
        </AnimatePresence>

        {commentTree.length === 0 && (
          <div className="text-center py-8 text-[var(--text-sm)] text-[var(--ink-300)]">
            {t('empty') ?? '暂无评论，来发表你的看法吧'}
          </div>
        )}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount((c) => c + pageSize)}
            className="text-sm font-medium px-4 py-2 rounded-[var(--radius-md, 8px)] transition-colors"
            style={{
              color: 'var(--ink-500, #666)',
              background: 'var(--ink-50, #f5f5f5)',
              border: '1px solid var(--ink-100, #eee)',
            }}
          >
            {t('loadMore') ?? '加载更多'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CommentSection;