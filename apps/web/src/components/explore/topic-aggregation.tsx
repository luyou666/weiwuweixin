'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Card, ConfidenceSeal } from '@weiwuweixin/ui';

/* ============================================================
   话题聚合卡片 — 同名/同类榜单合并展示
   显示合并的榜单数量
   "查看全部"展开
   ============================================================ */

export interface TopicAggregationItem {
  id: string;
  title: string;
  confidence: number;
  authorName: string;
  itemCount: number;
  tags: string[];
}

export interface TopicAggregation {
  topicId: string;
  topicName: string;
  categoryIcon: string;
  mergedCount: number;
  items: TopicAggregationItem[];
}

interface TopicAggregationProps {
  aggregations: TopicAggregation[];
  className?: string;
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
          <TopicCard key={agg.topicId} aggregation={agg} />
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
            {displayItems.map((item, i) => (
              <Link key={item.id} href={`/list/${item.id}`}>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: i * 0.05 }}
                  className="flex items-center gap-sm p-sm rounded-[var(--radius-md)] bg-rice/60 hover:bg-rice transition-colors"
                >
                  {/* 置信度印章 */}
                  <div className="flex-shrink-0">
                    <ConfidenceSeal confidence={item.confidence} size="sm" spinning={false} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-900 truncate">{item.title}</p>
                    <p className="text-xs text-ink-500">
                      {item.authorName} · {item.itemCount} {t('items')}
                    </p>
                  </div>

                  {/* 标签 */}
                  <div className="flex gap-3xs overflow-hidden">
                    {item.tags.slice(0, 2).map((tag) => (
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
            ))}
          </AnimatePresence>
        </div>

        {/* 查看全部 / 收起 */}
        {items.length > 2 && (
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="mt-md w-full text-center text-sm text-indigo hover:text-indigo-light transition-colors cursor-pointer"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {expanded ? t('collapse') : t('viewAll')}
          </motion.button>
        )}
      </Card>
    </motion.div>
  );
}

export default TopicAggregation;