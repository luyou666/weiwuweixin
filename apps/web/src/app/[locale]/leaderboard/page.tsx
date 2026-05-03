'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LoadingState, ErrorState, EmptyState } from '@weiwuweixin/ui';
import { fetchLeaderboard } from '@/lib/api';
import type { LeaderboardResponse } from '@/lib/api';

/* ============================================================
   围物为心 FIRE — Monopo London 风格 v3
   设计参考: monopo.london/work
   DNA: 纯白底 (#FFF) + 超大细体数字 + 不对称网格 + 零装饰
   ============================================================ */

const monopoEase = [0.165, 0.84, 0.44, 1] as const;

/* ── 工具 ── */

function timeAgo(dateStr: string): string {
  const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h`;
}

function hotnessColor(h: number, max: number): string {
  const r = h / Math.max(1, max);
  if (r >= 0.8) return '#E2553F';
  if (r >= 0.5) return '#D4783B';
  if (r >= 0.3) return '#C8974A';
  return '#B0B0B0';
}

/* ── 排名数字 (Monopo 精髓: 超大细体) ── */

function RankNumber({ rank, hero }: { rank: number; hero?: boolean }) {
  const size = hero
    ? 'text-[clamp(80px,11vw,200px)]'
    : 'text-[clamp(44px,6vw,90px)]';
  const color =
    rank === 1 ? 'text-[#E2553F]' :
    rank === 2 ? 'text-[#D4783B]' :
    rank === 3 ? 'text-[#C8974A]' :
    'text-black/[0.10]';

  return (
    <span
      className={`${size} ${color} font-sans font-thin leading-[0.82] tracking-tighter tabular-nums select-none`}
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {String(rank).padStart(2, '0')}
    </span>
  );
}

/* ── 热度条 (Monopo 克制动画) ── */

function HotnessBar({ value, max }: { value: number; max: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const pct = Math.max(2, (value / Math.max(1, max)) * 100);

  return (
    <div ref={ref} className="h-[3px] w-full bg-black/[0.06] overflow-hidden">
      <motion.div
        className="h-full origin-left"
        style={{ backgroundColor: hotnessColor(value, max) }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.5, ease: monopoEase, delay: 0.2 }}
      />
    </div>
  );
}

/* ── LIVE 指示器 ── */

function LiveDot({ generatedAt }: { generatedAt: string }) {
  const [ago, setAgo] = useState('');

  useEffect(() => {
    const tick = () => setAgo(timeAgo(generatedAt));
    tick();
    const i = setInterval(tick, 5000);
    return () => clearInterval(i);
  }, [generatedAt]);

  return (
    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-black/25"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <span className="w-[6px] h-[6px] rounded-full bg-[#E2553F] animate-pulse" />
      LIVE · {ago} ago
    </span>
  );
}

/* ── 排行榜卡片 (4-20名) ── */

function LeaderboardCard({
  entry, rank, maxHotness, index,
}: {
  entry: LeaderboardResponse['leaderboard'][0];
  rank: number; maxHotness: number; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const t = useTranslations('leaderboard');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: monopoEase, delay: index * 0.06 }}
    >
      <Link href={`/list/${entry.id}`} className="group block">
        <div className="border-t border-black/[0.07] py-6 md:py-8 hover:bg-black/[0.012] transition-colors duration-500">
          {/* 上排: 排名数字 + 标题 + 热度 */}
          <div className="flex items-start gap-5 md:gap-8 mb-4">
            <div className="flex-shrink-0 w-16 md:w-24">
              <RankNumber rank={rank} />
            </div>
            <div className="flex-1 min-w-0 pt-2 md:pt-3">
              <h3 className="text-lg md:text-xl font-light text-black leading-tight group-hover:text-[#E2553F] transition-colors duration-300 line-clamp-2"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                {entry.title}
              </h3>
              {entry.subtitle && (
                <p className="text-xs text-black/30 mt-1 line-clamp-1"
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  {entry.subtitle}
                </p>
              )}
            </div>
            {/* 热度分 */}
            <div className="flex-shrink-0 pt-2 md:pt-3 text-right">
              <span className="text-lg md:text-xl font-light tabular-nums"
                style={{ color: hotnessColor(entry.hotness, maxHotness), fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                {entry.hotness}
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-black/15 mt-0.5"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                FIRE
              </span>
            </div>
          </div>

          {/* 热度条 */}
          <div className="ml-[80px] md:ml-[112px] mb-4">
            <HotnessBar value={entry.hotness} max={maxHotness} />
          </div>

          {/* 元数据 */}
          <div className="ml-[80px] md:ml-[112px] flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-black/25"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            <span>👍 {entry.upvoteCount}</span>
            <span>📊 {entry._count.communityScores} {t('scores')}</span>
            <span>💬 {entry._count.comments} {t('comments')}</span>
            <span>👁 {entry.viewCount}</span>
            <span className="ml-auto truncate max-w-[140px] text-black/20">
              {entry.author.nickname}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── TOP 3 Feature 卡片 ── */

function FeatureCard({
  entry, rank, maxHotness,
}: {
  entry: LeaderboardResponse['leaderboard'][0];
  rank: number; maxHotness: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const gradientColors: Record<number, [string, string]> = {
    1: ['#E2553F', '#FF6B4A'],
    2: ['#D4783B', '#E8954A'],
    3: ['#C8974A', '#D4A85A'],
  };
  const [c1, c2] = gradientColors[rank] ?? ['#999', '#AAA'];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 64 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: monopoEase, delay: rank * 0.15 }}
    >
      <Link href={`/list/${entry.id}`} className="group block h-full">
        <div className="h-full border border-black/[0.08] p-7 md:p-10 hover:border-black/[0.2] transition-all duration-500 flex flex-col relative overflow-hidden">
          {/* 排名数字 — 占满卡片 */}
          <div className="absolute top-4 right-6 md:top-6 md:right-10 opacity-[0.06] group-hover:opacity-[0.10] transition-opacity duration-500 pointer-events-none">
            <span className="text-[clamp(140px,18vw,280px)] font-thin leading-none tracking-tighter select-none"
              style={{ color: c1, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {String(rank).padStart(2, '0')}
            </span>
          </div>

          {/* 内容区 (相对定位确保在上层) */}
          <div className="relative z-10 flex-1 flex flex-col">
            {/* 小排名标识 */}
            <div className="mb-5">
              <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium"
                style={{ backgroundColor: `${c1}15`, color: c1, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                NO. {rank}
              </span>
            </div>

            {/* 标题 */}
            <h3 className="text-xl md:text-2xl font-light text-black leading-tight group-hover:text-[#E2553F] transition-colors duration-300 mb-3 line-clamp-2"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {entry.title}
            </h3>

            {entry.subtitle && (
              <p className="text-sm text-black/35 mb-5 line-clamp-1"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                {entry.subtitle}
              </p>
            )}

            {/* 热度条 */}
            <div className="mt-auto mb-6">
              <HotnessBar value={entry.hotness} max={maxHotness} />
            </div>

            {/* 热度分 + 数据 */}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-thin tabular-nums"
                  style={{ color: hotnessColor(entry.hotness, maxHotness), fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  {entry.hotness}
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-black/15 ml-1"
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  FIRE
                </span>
              </div>
              <div className="flex gap-3 text-[11px] text-black/25"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                <span>👍 {entry.upvoteCount}</span>
                <span>📊 {entry._count.communityScores}</span>
                <span>💬 {entry._count.comments}</span>
              </div>
            </div>
          </div>

          {/* 作者 */}
          <div className="relative z-10 mt-5 pt-4 border-t border-black/[0.05] text-[11px] text-black/20"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            by {entry.author.nickname}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── 过滤标签 (Monopo 纯排版风格) ── */

function FilterTabs({ active, onChange }: { active: string; onChange: (k: string) => void }) {
  const tabs = [
    { key: 'all', label: 'ALL' },
    { key: 'hot', label: '本周最热' },
    { key: 'rising', label: '上升最快' },
    { key: 'classic', label: '历史经典' },
  ];

  return (
    <div className="flex items-center gap-6 md:gap-10">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className="text-xs uppercase tracking-[0.15em] transition-colors duration-300 pb-1 border-b-2"
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            color: active === tab.key ? '#000' : 'rgba(0,0,0,0.25)',
            borderColor: active === tab.key ? '#E2553F' : 'transparent',
          }}
          onMouseEnter={(e) => { if (active !== tab.key) (e.target as HTMLElement).style.color = 'rgba(0,0,0,0.5)'; }}
          onMouseLeave={(e) => { if (active !== tab.key) (e.target as HTMLElement).style.color = 'rgba(0,0,0,0.25)'; }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LeaderboardPage — Monopo London v3
   ═══════════════════════════════════════════════ */

export default function LeaderboardPage() {
  const t = useTranslations('leaderboard');
  const tm = useTranslations('microcopy');
  const [filter, setFilter] = useState('all');

  const { data, isLoading, isError, refetch } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const maxHotness = data?.leaderboard?.[0]?.hotness ?? 1;

  const ranked = useMemo(() => {
    if (!data?.leaderboard) return [];
    const list = [...data.leaderboard];
    if (filter === 'hot') {
      return [...list].sort((a, b) => (b.hotness ?? 0) - (a.hotness ?? 0));
    }
    if (filter === 'rising') {
      return [...list].sort((a, b) =>
        ((b.upvoteCount ?? 0) - (b.downvoteCount ?? 0)) -
        ((a.upvoteCount ?? 0) - (a.downvoteCount ?? 0))
      );
    }
    if (filter === 'classic') {
      return [...list].sort((a, b) =>
        ((b.communityScoreCount ?? 0) + (b.commentCount ?? 0)) -
        ((a.communityScoreCount ?? 0) + (a.commentCount ?? 0))
      );
    }
    return list;
  }, [data?.leaderboard, filter]);

  const features = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <main style={{ backgroundColor: '#FFFFFF' }}>
        {/* ═══ Hero ═══ */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 pt-24 md:pt-40 pb-10 md:pb-20">
          {/* 微标签行 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: monopoEase }}
            className="flex items-center gap-4 mb-8 md:mb-14"
          >
            <span className="text-[10px] uppercase tracking-[0.35em] text-black/20"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              FIRE · LEADERBOARD
            </span>
            <span className="w-16 h-px bg-black/[0.06]" />
            {data?.generatedAt && <LiveDot generatedAt={data.generatedAt} />}
          </motion.div>

          {/* 大标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: monopoEase, delay: 0.12 }}
            className="text-[clamp(52px,9vw,170px)] text-black font-thin leading-[0.86] tracking-tighter"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {t('title')}
          </motion.h1>

          {/* 副标题 + 过滤 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-7 md:mt-12"
          >
            <p className="text-sm md:text-base text-black/30 max-w-md leading-relaxed"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {t('subtitle')}
            </p>
            <FilterTabs active={filter} onChange={setFilter} />
          </motion.div>
        </section>

        {/* ═══ 分割线 ═══ */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="border-t border-black/[0.06]" />
        </div>

        {/* ═══ 三态 ═══ */}
        {isLoading && (
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-40">
            <LoadingState message={tm('loadingState')} showSkeletonAfter={2000} skeletonColumns={1} skeletonRows={10} />
          </div>
        )}

        {isError && (
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-40">
            <ErrorState title={t('errorTitle')} description={t('errorDesc')}
              onRetry={() => refetch()} retryLabel={tm('retryBtn')} />
          </div>
        )}

        {data && data.leaderboard.length === 0 && (
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-40">
            <EmptyState scene="list-empty" title={t('emptyTitle')} description={t('emptyDesc')} />
          </div>
        )}

        {data && data.leaderboard.length > 0 && (
          <>
            {/* ═══ TOP 3 Feature 卡片 ═══ */}
            <section className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-14 md:py-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {features.map((entry, i) => (
                  <FeatureCard key={entry.id} entry={entry} rank={i + 1} maxHotness={maxHotness} />
                ))}
              </div>
            </section>

            {/* 分割线 */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
              <div className="border-t border-black/[0.06]" />
            </div>

            {/* ═══ 4-20 榜榜单 ═══ */}
            <section className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-14 md:py-20">
              {/* 小节标签 */}
              <div className="flex items-center gap-4 mb-10 md:mb-16">
                <span className="text-[10px] uppercase tracking-[0.35em] text-black/20"
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  {t('footer')}
                </span>
                <span className="w-12 h-px bg-black/[0.05]" />
                <span className="text-[10px] text-black/12"
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                  {rest.length} {t('scores')}
                </span>
              </div>

              <div>
                {rest.map((entry, i) => (
                  <LeaderboardCard key={entry.id} entry={entry} rank={i + 4} maxHotness={maxHotness} index={i} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ═══ 底部留白 ═══ */}
        <div className="h-28 md:h-36" />

        {/* 底栏 */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 pb-14">
          <div className="border-t border-black/[0.05] pt-6 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-black/12"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            <span>围物为心 · WEIWUWEIXIN</span>
            <span>FIRE RANKING</span>
          </div>
        </div>
      </main>
    </div>
  );
}
