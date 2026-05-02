'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { LoadingState, ErrorState, EmptyState } from '@weiwuweixin/ui';
import {
  fetchExploreLists,
  fetchTopicAggregations,
  fetchHotSearches,
  EXPLORE_CATEGORIES,
} from '@/lib/api';
import type { SortMode, FeedList, TopicAggregation } from '@/lib/api';

/* ============================================================
   围物为心 EXPLORE — Monopo London v5
   设计参考: monopo.london/work
   DNA:
   - 纯白底 #FFFFFF, 黑字, 朱红点缀 (仅hover)
   - 巨型 Hero 标题 (75-170px, weight 400)
   - 全排版优先: 零圆角 零阴影 零渐变
   - 过滤器: 12px/800/uppercase/1.8px tracking/无边框无背景
   - 卡片: border-t 分割线 + 编号系统
   - 克制: 每卡片只保留 标题+作者+置信度
   ============================================================ */

const EASE = [0.165, 0.84, 0.44, 1] as const;
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const STYLE = { fontFamily: FONT };

/* ─── Helpers ─── */

function confMeta(c: number) {
  if (c >= 0.6) return { t: '高共识', hex: '#059669' };
  if (c >= 0.35) return { t: '讨论中', hex: '#D97706' };
  return { t: '初期', hex: '#DC2626' };
}

function useInViewOnce(margin = '-40px') {
  const ref = useRef<HTMLDivElement>(null);
  const [hit, setHit] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHit(true); o.disconnect(); } },
      { rootMargin: margin },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [margin]);
  return { ref, hit };
}

/* ─── 1. Search Bar ─── */

function SearchBar({
  value, onChange, onSearch, placeholder,
}: {
  value: string; onChange: (v: string) => void;
  onSearch: (q: string) => void; placeholder: string;
}) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 border border-black/[0.08]
                    hover:border-black/[0.2] focus-within:border-black/[0.3]
                    transition-colors duration-300">
      <svg width="16" height="16" viewBox="0 0 16 16"
        className="shrink-0 opacity-20 group-focus-within:opacity-35 transition-opacity">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="currentColor"/>
      </svg>
      <input
        className="flex-1 bg-transparent text-sm text-black placeholder:text-black/22
                   outline-none font-light tracking-wide"
        style={STYLE}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSearch(value); }}
      />
      {value && (
        <button type="button" onClick={() => { onChange(''); onSearch(''); }}
          className="text-black/20 hover:text-black/60 transition-colors text-lg leading-none">
          ×
        </button>
      )}
    </div>
  );
}

/* ─── 2. Filter Tabs (Monopo: pure typography, no bg/border) ─── */

function FilterTabs<T extends string>({
  items, active, onChange,
}: {
  items: { key: T; label: string }[];
  active: T; onChange: (k: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 md:gap-10">
      {items.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className="text-xs uppercase pb-[2px] transition-all duration-300"
          style={{
            ...STYLE,
            color: active === key ? '#000' : 'rgba(0,0,0,0.25)',
            borderBottom: active === key ? '2px solid #000' : '2px solid transparent',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─── 3. Category Bar ─── */

function CategoryBar({
  cats, sel, onChange,
}: {
  cats: { id: string; label: string }[];
  sel: string[]; onChange: (s: string[]) => void;
}) {
  const toggle = (id: string) =>
    sel.includes(id) ? onChange(sel.filter(s => s !== id)) : onChange([...sel, id]);

  return (
    <div className="flex flex-wrap gap-5 md:gap-8">
      {cats.map(c => {
        const on = sel.includes(c.id);
        return (
          <button key={c.id} type="button" onClick={() => toggle(c.id)}
            className="text-xs uppercase pb-[2px] transition-all duration-300"
            style={{
              ...STYLE,
              color: on ? '#000' : 'rgba(0,0,0,0.25)',
              borderBottom: on ? '2px solid #000' : '2px solid transparent',
            }}>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── 4. Topic Chip (Monopo: typographic, no pill) ─── */

function TopicChip({
  agg, active, onClick,
}: {
  agg: TopicAggregation; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs uppercase pb-[2px] transition-all duration-300"
      style={{
        ...STYLE,
        letterSpacing: '1.2px',
        color: active ? '#000' : 'rgba(0,0,0,0.35)',
        borderBottom: active ? '2px solid #000' : '2px solid transparent',
      }}
    >
      {agg.topicName}{' '}
      <span className="ml-1.5 text-[10px]" style={{ color: active ? '#000' : 'rgba(0,0,0,0.2)' }}>
        {agg.mergedCount}
      </span>
    </button>
  );
}

/* ─── 5. Topic Section ─── */

function TopicSection({ aggregations }: { aggregations: TopicAggregation[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-5 md:gap-8 mb-8">
        {aggregations.slice(0, 10).map(agg => (
          <TopicChip
            key={agg.topicName}
            agg={agg}
            active={active === agg.topicName}
            onClick={() => setActive(active === agg.topicName ? null : agg.topicName)}
          />
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/[0.06] pt-8 pb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(aggregations.find(a => a.topicName === active)?.items ?? [])
                  .slice(0, 4)
                  .map((item, i) => {
                    const cm = confMeta(item.confidence ?? 0);
                    return (
                      <Link key={item.id || i} href={`/list/${item.id}`}
                        className="group block">
                        <div className="p-5 transition-all duration-400">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-black/25"
                              style={STYLE}>
                              {item.itemCount ?? 0} 项
                            </span>
                            <span className="text-[10px] font-semibold tracking-wide"
                              style={{ color: cm.hex, fontFamily: FONT }}>
                              {cm.t}
                            </span>
                          </div>
                          <h3 className="text-base font-medium text-black leading-snug
                                         group-hover:text-[#E2553F] transition-colors duration-300
                                         line-clamp-2"
                            style={STYLE}>
                            {item.title}
                          </h3>
                          <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center
                                          gap-4 text-[10px] text-black/25"
                            style={STYLE}>
                            <span>{item.authorName ?? '?'}</span>
                            <span>↑ {item.upvoteCount ?? 0}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 6. List Card ─── */

function ListCard({ list, index }: { list: FeedList; index: number }) {
  const { ref, hit } = useInViewOnce();
  const cm = confMeta(list.confidence ?? 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={hit ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay: (index % 8) * 0.04 }}
    >
      <Link href={`/list/${list.id}`} className="group block h-full">
        <div className="h-full p-6 md:p-8 flex flex-col
                        transition-all duration-400">
          {/* Cover image */}
          {list.coverUrl && (
            <div className="mb-5 -mx-6 md:-mx-8 -mt-6 md:-mt-8 overflow-hidden">
              <img src={list.coverUrl} alt={list.title}
                className="w-full aspect-[16/9] object-cover brightness-[0.92]
                           group-hover:brightness-100 transition-all duration-500" />
            </div>
          )}
          {/* Top: index + confidence — Monopo numbering system */}
          <div className="flex items-start justify-between mb-5">
            <span className="text-[22px] font-thin text-black/12 tracking-tighter"
              style={STYLE}>
              {(index + 1).toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold"
              style={{ color: cm.hex, fontFamily: FONT }}>
              {cm.t} · {Math.round((list.confidence ?? 0) * 100)}%
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg md:text-xl font-light text-black leading-tight
                        group-hover:text-[#E2553F] transition-colors duration-300
                        mb-5 line-clamp-2"
            style={STYLE}>
            {list.title}
          </h3>

          {/* Dimensions (compact) */}
          {list.dimensions && list.dimensions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {list.dimensions.slice(0, 3).map(d => (
                <span key={d.id ?? d.name}
                  className="text-[10px] text-black/35 tracking-wide"
                  style={STYLE}>
                  {typeof d === 'string' ? d : d.name}
                </span>
              ))}
              {list.dimensions.length > 3 && (
                <span className="text-[10px] text-black/20" style={STYLE}>
                  +{list.dimensions.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-black/[0.04] flex items-center
                          justify-between text-[10px] tracking-wide text-black/22"
            style={STYLE}>
            <div className="flex items-center gap-4">
              <span>{list.author?.nickname ?? '?'}</span>
              <span>{list.itemCount ?? list._count?.items ?? 0} 项</span>
            </div>
            <div className="flex items-center gap-3">
              <span>↑ {list.upvoteCount ?? 0}</span>
              <span>Σ {list._count?.communityScores ?? 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   EXPLORE PAGE — Monopo London v5
   ═══════════════════════════════════════════════════ */

const sortOpts: { key: SortMode; label: string }[] = [
  { key: 'diversity', label: '多样性' },
  { key: 'consensus', label: '高共识' },
  { key: 'newest', label: '最新' },
];

const catOpts = EXPLORE_CATEGORIES.map(c => ({ id: c.id, label: c.label }));

export default function ExplorePage() {
  // ─── Force pure white body bg ───
  useEffect(() => {
    const orig = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#FFFFFF';
    return () => { document.body.style.backgroundColor = orig; };
  }, []);
  const t = useTranslations('explore');
  const tm = useTranslations('microcopy');

  const [selCats, setSelCats] = useState<string[]>([]);
  const [sort, setSort] = useState<SortMode>('diversity');
  const [query, setQuery] = useState('');
  const [raw, setRaw] = useState('');

  // ── Infinite Scroll ──
  const {
    data: inf,
    isLoading: listLoad,
    isError: listErr,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['explore-lists', selCats, sort, query],
    queryFn: ({ pageParam = 1 }) =>
      fetchExploreLists({
        categories: selCats, sort, query, page: pageParam, pageSize: 8,
      }),
    getNextPageParam: (lp: any) => (lp.page ?? 1) + (lp.hasMore ? 1 : 0) > (lp.page ?? 1)
      ? (lp.page ?? 1) + 1 : undefined,
    initialPageParam: 1,
  });

  // flatten with de-duplication
  const seen = useRef<Set<string>>(new Set());
  const merged = useMemo(() => {
    seen.current.clear();
    const all: FeedList[] = [];
    for (const p of inf?.pages ?? []) {
      for (const L of p.lists ?? []) {
        if (!seen.current.has(L.id)) {
          seen.current.add(L.id);
          all.push(L);
        }
      }
    }
    return all;
  }, [inf]);

  const total = merged.length;

  // ── Topic Aggregations ──
  const { data: aggs = [] } = useQuery({
    queryKey: ['topic-agg', selCats, query],
    queryFn: () => fetchTopicAggregations({ categories: selCats, query }),
    enabled: !query,
    staleTime: 60_000,
  });

  // ── Hot Searches (only when empty) ──
  const { data: hot = [] } = useQuery({
    queryKey: ['hot-searches'],
    queryFn: fetchHotSearches,
    enabled: !query && selCats.length === 0,
    staleTime: 120_000,
  });

  const hSearch = useCallback((q: string) => setQuery(q), []);
  const hCat = useCallback((s: string[]) => setSelCats(s), []);
  const hSort = useCallback((m: SortMode) => setSort(m), []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <main style={{ backgroundColor: '#FFFFFF', fontFamily: FONT }}>

        {/* ═══ Hero ═══ */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16
                           pt-24 md:pt-36 pb-10 md:pb-18">

          {/* Micro label row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex items-center gap-3 mb-8 md:mb-12"
          >
            <span className="text-[10px] uppercase tracking-[0.35em] text-black/20"
              style={STYLE}>
              EXPLORE · 发现
            </span>
            <span className="w-14 h-px bg-black/[0.06]" />
            <span className="text-[10px] text-black/10" style={STYLE}>
              {listLoad ? '...' : `${total} 个榜单`}
            </span>
          </motion.div>

          {/* H1 — Monopo scale */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: EASE, delay: 0.1 }}
            className="text-[clamp(52px,9vw,170px)] text-black font-thin leading-[0.86]
                       tracking-tighter"
            style={STYLE}
          >
            {t('title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="text-sm md:text-base text-black/28 max-w-lg leading-relaxed mt-5 md:mt-8"
            style={STYLE}
          >
            {t('subtitle')}
          </motion.p>

          {/* Search + Controls */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-7 md:mt-10 space-y-6"
          >
            <SearchBar
              value={raw}
              onChange={setRaw}
              onSearch={hSearch}
              placeholder={t('searchPlaceholder')}
            />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <CategoryBar cats={catOpts} sel={selCats} onChange={hCat} />
              <FilterTabs items={sortOpts} active={sort} onChange={hSort} />
            </div>
          </motion.div>
        </section>

        {/* ═══ Divider ═══ */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="border-t border-black/[0.06]" />
        </div>

        {/* ═══ States ═══ */}
        {listLoad && (
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-40">
            <LoadingState message={tm('loadingState')}
              showSkeletonAfter={2000} skeletonColumns={2} skeletonRows={4} />
          </div>
        )}
        {listErr && (
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-40">
            <ErrorState title={t('errorTitle')} description={t('errorDesc')}
              onRetry={() => refetch()} retryLabel={tm('retryBtn')} />
          </div>
        )}
        {!listLoad && !listErr && total === 0 && (
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-40">
            <EmptyState scene="search-empty"
              title={t('emptyTitle')} description={t('emptyDesc')} size="lg" />
          </div>
        )}

        {/* ═══ Topic Aggregation ═══ */}
        {!listLoad && !listErr && aggs.length > 0 && !query && (
          <section className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16
                             py-14 md:py-18">
            <div className="flex items-center gap-3 mb-8 md:mb-11">
              <span className="text-[10px] uppercase tracking-[0.35em] text-black/20"
                style={STYLE}>
                话题聚合
              </span>
              <span className="w-14 h-px bg-black/[0.05]" />
              <span className="text-[10px] text-black/10" style={STYLE}>
                {aggs.length} 话题
              </span>
            </div>
            <TopicSection aggregations={aggs} />
          </section>
        )}

        {/* Divider after topics */}
        {!listLoad && !listErr && aggs.length > 0 && !query && (
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
            <div className="border-t border-black/[0.06]" />
          </div>
        )}

        {/* ═══ List Grid ═══ */}
        {!listLoad && !listErr && total > 0 && (
          <section className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16
                             py-14 md:py-18">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.35em] text-black/20"
                  style={STYLE}>
                  {query ? '搜索结果' : '全部榜单'}
                </span>
                <span className="w-14 h-px bg-black/[0.05]" />
                <span className="text-[10px] text-black/10" style={STYLE}>
                  {total} 个榜单
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {merged.map((L, i) => (
                <ListCard key={L.id} list={L} index={i} />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex items-center gap-2 px-8 py-3
                             border border-black/[0.07] hover:border-black/[0.2]
                             text-xs uppercase tracking-[0.15em] font-semibold
                             text-black/30 hover:text-black/60
                             transition-all duration-300 disabled:opacity-25"
                  style={STYLE}
                >
                  {isFetchingNextPage ? '加载中…' : '加载更多'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ═══ Hot Searches ═══ */}
        {!listLoad && !listErr && hot.length > 0 && !query && selCats.length === 0 && (
          <section className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16
                             pb-14 md:pb-18">
            <div className="border-t border-black/[0.06] pt-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] uppercase tracking-[0.35em] text-black/20"
                  style={STYLE}>
                  热门搜索
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {hot.slice(0, 6).map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setRaw(h); setQuery(h); }}
                    className="text-xs text-black/28 hover:text-black/60 transition-colors duration-300"
                    style={STYLE}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ Bottom ═══ */}
        <div className="h-24 md:h-32" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 pb-14">
          <div className="border-t border-black/[0.05] pt-6 flex items-center
                          justify-between text-[10px] uppercase tracking-[0.25em]
                          text-black/10 font-semibold"
            style={STYLE}>
            <span>围物为心 · 以心度物，以物观心</span>
            <span>EXPLORE</span>
          </div>
        </div>

      </main>
    </div>
  );
}
