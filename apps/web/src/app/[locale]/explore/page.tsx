'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo } from 'react';
import { LoadingState, ErrorState, EmptyState } from '@weiwuweixin/ui';
import { fetchExploreLists, fetchTopicAggregations } from '@/lib/api';
import type { SortMode } from '@/lib/api';
import { EXPLORE_CATEGORIES } from '@/lib/mock-data';
import { CategoryTabs } from '@/components/explore/category-tabs';
import { SearchBar } from '@/components/explore/search-bar';
import { SortSwitcher } from '@/components/explore/sort-switcher';
import { TopicAggregation } from '@/components/explore/topic-aggregation';
import { ListWaterfall } from '@/components/explore/list-waterfall';

/* ============================================================
   发现页 /explore — 围物为心
   顶部分类浏览标签
   排序切换（多样性优先/高共识度/最新创建）
   搜索框
   话题聚合区域
   榜单瀑布流卡片列表
   ============================================================ */

export default function ExplorePage() {
  const t = useTranslations('explore');
  const tm = useTranslations('microcopy');

  // ─── 状态 ───
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('diversity');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // ─── 数据获取 ───
  const { data: listsData, isLoading: listsLoading, isError: listsError, refetch } = useQuery({
    queryKey: ['explore-lists', selectedCategories, sortMode, searchQuery, page],
    queryFn: () =>
      fetchExploreLists({
        categories: selectedCategories,
        sort: sortMode,
        query: searchQuery,
        page,
        pageSize: 8,
      }),
  });

  const { data: aggregations = [] } = useQuery({
    queryKey: ['topic-aggregations', selectedCategories, searchQuery],
    queryFn: () =>
      fetchTopicAggregations({
        categories: selectedCategories,
        query: searchQuery,
      }),
  });

  // ─── 事件处理 ───
  const handleCategoriesChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((mode: SortMode) => {
    setSortMode(mode);
    setPage(1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (listsData?.hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [listsData?.hasMore]);

  return (
    <main className="min-h-screen paper-texture">
      {/* ─── Hero 区域 ─── */}
      <section className="ink-wash relative flex flex-col items-center pt-3xl pb-xl px-lg text-center overflow-hidden">
        {/* 水墨晕染装饰 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 30%, var(--indigo) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, var(--celadon) 0%, transparent 40%)',
            opacity: 0.06,
          }}
        />

        <motion.h1
          className="ink-title relative z-10 text-3xl md:text-4xl font-bold tracking-wider mb-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {t('title')}
        </motion.h1>

        <motion.p
          className="relative z-10 text-base md:text-lg text-ink-500 max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 }}
        >
          {t('subtitle')}
        </motion.p>
      </section>

      {/* ─── 工具栏区域 ─── */}
      <section className="max-w-4xl mx-auto px-lg -mt-md relative z-10">
        <div className="flex flex-col gap-lg">
          {/* 搜索框 */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            recentSearches={[]} // TODO: 从 localStorage 获取
            hotSearches={['华语专辑', '京都红叶', '独立游戏', '前端框架', '推理小说']} // mock
            placeholder={t('searchPlaceholder')}
          />

          {/* 分类 + 排序 */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md">
            <CategoryTabs
              categories={EXPLORE_CATEGORIES}
              selected={selectedCategories}
              onChange={handleCategoriesChange}
            />
            <SortSwitcher
              value={sortMode}
              onChange={handleSortChange}
            />
          </div>
        </div>
      </section>

      {/* ─── 话题聚合区域 ─── */}
      {aggregations.length > 0 && !searchQuery && (
        <section className="max-w-4xl mx-auto px-lg mt-xl">
          <TopicAggregation aggregations={aggregations} />
        </section>
      )}

      {/* ─── 榜单瀑布流 ─── */}
      <section className="max-w-4xl mx-auto px-lg pb-3xl mt-xl">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="font-[var(--font-heading)] text-xl text-ink-900">
            {searchQuery ? t('searchResults') : t('allLists')}
          </h2>
          {listsData && (
            <span className="text-sm text-ink-500">
              {t('listCount', { count: listsData.lists.length })}
            </span>
          )}
        </div>

        {/* ─── 加载态 ─── */}
        {listsLoading && (
          <LoadingState
            message={tm('loadingState')}
            showSkeletonAfter={3000}
            skeletonColumns={2}
            skeletonRows={3}
          />
        )}

        {/* ─── 错误态 ─── */}
        {listsError && (
          <ErrorState
            title={t('errorTitle')}
            description={t('errorDesc')}
            onRetry={() => refetch()}
            retryLabel={tm('retryBtn')}
          />
        )}

        {/* ─── 内容态 ─── */}
        {listsData && listsData.lists.length > 0 && (
          <ListWaterfall
            lists={listsData.lists}
            isLoading={listsLoading}
            hasMore={listsData.hasMore}
            onLoadMore={handleLoadMore}
            sortKey={`${sortMode}-${selectedCategories.join(',')}`}
          />
        )}

        {/* ─── 空态 ─── */}
        {listsData && listsData.lists.length === 0 && !listsLoading && (
          <EmptyState
            scene="search-empty"
            title={t('emptyTitle')}
            description={t('emptyDesc')}
            size="lg"
          />
        )}
      </section>
    </main>
  );
}