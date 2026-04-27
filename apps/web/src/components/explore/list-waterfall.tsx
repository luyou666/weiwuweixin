'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { Card, ConfidenceSeal, SkeletonInk, EmptyState } from '@weiwuweixin/ui';
import type { FeedList } from '@/lib/mock-data';

/* ============================================================
   榜单瀑布流 — StickerCard 风格
   FLIP 动画排序切换
   无限滚动加载
   ============================================================ */

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
}: {
  list: FeedList;
  index: number;
  sortKey?: string;
}) {
  const t = useTranslations('explore');

  // 使用 sortKey 作为 layoutId 前缀，触发 FLIP 动画
  const layoutId = sortKey ? `card-${sortKey}-${list.id}` : undefined;

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
      <Link href={`/list/${list.id}`}>
        <Card interactive size="md" className="h-full">
          <div className="flex gap-md">
            {/* 置信度印章 */}
            <div className="flex-shrink-0 pt-xs">
              <ConfidenceSeal
                confidence={list.confidence}
                size="sm"
                spinning={false}
              />
            </div>

            {/* 内容区 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-[var(--font-heading)] text-lg text-ink-900 truncate">
                {list.title}
              </h3>
              <p className="text-sm text-ink-500 mt-3xs line-clamp-2">
                {list.subtitle}
              </p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-3xs mt-sm">
                {list.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-sm py-3xs text-xs rounded-[var(--radius-md)] bg-rice text-ink-500 border border-ink-100"
                  >
                    {tag}
                  </span>
                ))}
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
      </Link>
    </motion.div>
  );
}

export default ListWaterfall;