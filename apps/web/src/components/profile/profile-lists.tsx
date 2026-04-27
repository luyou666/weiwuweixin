'use client';

import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card, ConfidenceSeal } from '@weiwuweixin/ui';
import type { FeedList } from '@/lib/mock-data';
import type { ProfileSortMode } from '@/lib/api';

/* ============================================================
   ProfileLists — 个人榜单列表
   FLIP 动画排序切换 + 排序标签
   ============================================================ */

interface ProfileListsProps {
  lists: FeedList[];
  sortMode: ProfileSortMode;
  onSortChange: (mode: ProfileSortMode) => void;
}

const SORT_OPTIONS: { key: ProfileSortMode; labelKey: string }[] = [
  { key: 'consensus', labelKey: 'sortConsensus' },
  { key: 'hot', labelKey: 'sortHot' },
  { key: 'time', labelKey: 'sortTime' },
];

export function ProfileLists({ lists, sortMode, onSortChange }: ProfileListsProps) {
  const t = useTranslations('profile');

  return (
    <div>
      {/* ─── 排序标签 ─── */}
      <div className="flex gap-sm mb-lg">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSortChange(opt.key)}
            className={[
              'px-md py-xs rounded-md text-sm font-medium transition-colors',
              sortMode === opt.key
                ? 'bg-ink-900 text-paper'
                : 'bg-rice text-ink-500 hover:bg-ink-100',
            ].join(' ')}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>

      {/* ─── 榜单卡片列表（FLIP动画） ─── */}
      <LayoutGroup>
        <div className="grid grid-cols-1 gap-lg">
          <AnimatePresence mode="popLayout">
            {lists.map((list, i) => (
              <ProfileListCard
                key={list.id}
                list={list}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}

/* ─── 单个榜单卡片 ─── */
function ProfileListCard({ list, index }: { list: FeedList; index: number }) {
  const t = useTranslations('home');

  return (
    <motion.div
      layout
      layoutId={`profile-list-${list.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 25 },
        opacity: { duration: 0.25, delay: index * 0.04 },
        y: { type: 'spring', stiffness: 200, damping: 20, delay: index * 0.04 },
      }}
    >
      <Card interactive size="md" className="flex gap-md">
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
          <h3 className="font-heading text-lg text-ink-900 truncate">
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
                className="inline-block px-sm py-3xs text-xs rounded-md bg-rice text-ink-500 border border-ink-100"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 元信息行 */}
          <div className="flex items-center justify-between mt-sm text-xs text-ink-300">
            <span>
              {list.itemCount} {t('items')} · {list.voteCount} 人参与
            </span>
            <span>
              {new Date(list.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}