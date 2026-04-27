'use client';

import { useQuery } from '@tanstack/react-query';
import {
  motion,
  useInView,
} from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ConfidenceSeal, EmptyState, LoadingState, ErrorState } from '@weiwuweixin/ui';
import { fetchFeedLists } from '@/lib/api';
import type { FeedList } from '@/lib/mock-data';

/* ============================================================
   首页 — 围物为心 · Monopo 风格极简设计 (v2)
   全幅 Hero → 近期榜单(大图卡片) → 哲学区 → CTA
   ============================================================ */

/* ── 工具: 文字逐行揭示 ── */
function RevealText({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className={`overflow-hidden ${className || ''}`}>
      <motion.div
        initial={{ y: '110%', opacity: 0 }}
        animate={isInView ? { y: '0%', opacity: 1 } : {}}
        transition={{
          duration: 1.0,
          ease: [0.22, 1, 0.36, 1],
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── 工具: 缩放推进 reveal ── */
function ScaleReveal({
  children,
  className,
  delay = 0,
  scaleFrom = 0.88,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  scaleFrom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: scaleFrom, y: 30 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── 工具: 滑入揭示 ── */
function SlideReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  distance = 60,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const dir = { up: { x: 0, y: distance }, down: { x: 0, y: -distance }, left: { x: distance, y: 0 }, right: { x: -distance, y: 0 } }[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: dir.x, y: dir.y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.95,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   主页组件 — Monopo 风格
   Hero(Dark) → Lists(大图卡片) → Philosophy(Dark) → CTA(Dark)
   ═══════════════════════════════════════════════ */
export default function HomePage() {
  const t = useTranslations('home');
  const tm = useTranslations('microcopy');

  const { data: lists, isLoading, isError, refetch } = useQuery<FeedList[], Error>({
    queryKey: ['feed-lists'],
    queryFn: fetchFeedLists,
  });

  return (
    <main className="min-h-screen bg-paper">
      {/* 1. 全幅 Hero — 深色，大衬线排版 */}
      <HeroSection />

      {/* 2. 近期榜单 — Monopo 风格大图卡片 */}
      <section id="feed" className="py-5xl bg-paper">
        <div className="max-w-6xl mx-auto px-lg">
          {/* Section Header */}
          <SlideReveal direction="up" delay={0} distance={30}>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-ink-300 mb-lg">
              {t('recentListsLabel')}
            </p>
          </SlideReveal>

          {/* 三态 */}
          {isLoading && (
            <LoadingState
              message={tm('loadingState')}
              showSkeletonAfter={3000}
              skeletonColumns={2}
              skeletonRows={3}
            />
          )}

          {isError && (
            <ErrorState
              title={t('errorTitle')}
              description={t('errorDesc')}
              onRetry={() => refetch()}
              retryLabel={tm('retryBtn')}
            />
          )}

          {lists && lists.length === 0 && (
            <EmptyState
              scene="list-empty"
              title={t('emptyTitle')}
              description={t('emptyDesc')}
              action={
                <Link
                  href="/list/new"
                  className="inline-block px-6 py-3 bg-vermilion text-paper rounded-md font-medium hover:bg-vermilion-light transition-colors"
                >
                  {t('newList')}
                </Link>
              }
            />
          )}

          {lists && lists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {lists.map((list, i) => (
                <ListCard key={list.id} list={list} index={i} />
              ))}
            </div>
          )}

          {/* 底部 CTA 链接 */}
          <SlideReveal className="text-center mt-2xl" direction="up" delay={0.2}>
            <Link
              href="/explore"
              className="inline-flex items-center gap-xs font-body text-sm text-ink-500 hover:text-ink-900 transition-colors border-b border-ink-100 hover:border-ink-900 pb-3xs"
            >
              {t('discoverAll')}
              <span className="text-xs">{t('discoverAllArrow')}</span>
            </Link>
          </SlideReveal>
        </div>
      </section>

      {/* 3. 哲学区 — 深色底 */}
      <PhilosophySection />

      {/* 4. 底部 CTA — 深色底，Monopo 风格大字 */}
      <CTASection />
    </main>
  );
}

/* ─────────────────────────────────────────
   1. Hero — 全幅沉浸式，Monopo 大排版风格
   ───────────────────────────────────────── */
function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-ink-900">
      {/* 背景纹理层 — 极简 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 30% 40%, rgba(226,85,63,0.08) 0%, transparent 60%), ' +
              'radial-gradient(ellipse 50% 40% at 70% 60%, rgba(127,179,163,0.06) 0%, transparent 50%), ' +
              'linear-gradient(180deg, #1A1A24 0%, #0D0D14 100%)',
          }}
        />
        {/* 极细网格 */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '120px 120px',
          }}
        />
      </div>

      {/* 内容层 — Monopo 风格大排版 */}
      <div className="relative z-10 text-center px-lg max-w-4xl mx-auto">
        {/* 第一行: 以心度物 */}
        <RevealText className="font-heading text-6xl md:text-8xl lg:text-9xl text-paper tracking-[0.08em] leading-[1.1] mb-xs" delay={0.15}>
          {t('heroLine1')}
        </RevealText>

        {/* 第二行: 以物观心 */}
        <RevealText className="font-heading text-6xl md:text-8xl lg:text-9xl text-ink-300 tracking-[0.08em] leading-[1.1] mb-2xl" delay={0.35}>
          {t('heroLine2')}
        </RevealText>

        {/* 第三行: 品牌声明 — 加粗部分 + 普通部分 */}
        <RevealText className="font-body text-lg md:text-xl text-ink-300 max-w-xl mx-auto leading-relaxed mb-2xl" delay={0.55}>
          <><strong className="text-paper font-semibold">{t('heroLine3Bold')}</strong>{t('heroLine3')}</>
        </RevealText>

        {/* CTA 按钮 */}
        <SlideReveal direction="up" delay={0.75} distance={30}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
            <Link
              href="/list/new"
              className="group inline-flex items-center justify-center px-10 py-4 bg-vermilion text-paper font-body font-medium text-base hover:bg-vermilion-light transition-all duration-300 tracking-wide"
            >
              {t('newList')}
              <span className="ml-xs group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            <a
              href="#feed"
              className="inline-flex items-center justify-center px-10 py-4 border border-ink-100 text-ink-300 font-body font-medium text-base hover:border-paper hover:text-paper transition-all duration-300 tracking-wide"
            >
              {t('browseLists')}
            </a>
          </div>
        </SlideReveal>
      </div>

      {/* 底部滚动提示 */}
      <div className="absolute bottom-xl left-1/2 -translate-x-1/2 z-10">
        <SlideReveal direction="up" delay={1.2} distance={20}>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-ink-300">
            {t('scrollDown')}
          </span>
        </SlideReveal>
      </div>

      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-paper to-transparent pointer-events-none" />
    </section>
  );
}

/* ─────────────────────────────────────────
   2. 榜单卡片 — Monopo 风格大图卡片
   ───────────────────────────────────────── */
function ListCard({ list, index }: { list: FeedList; index: number }) {
  const t = useTranslations('home');

  const row = Math.floor(index / 2);
  const col = index % 2;
  const colDelay = (row * 0.12) + (col * 0.1);

  return (
    <ScaleReveal delay={colDelay} scaleFrom={0.92}>
      <Link
        href={`/list/${list.id}`}
        className="group block relative bg-white border border-ink-100 hover:border-ink-200 transition-all duration-500 overflow-hidden"
      >
        {/* 卡片内容区 */}
        <div className="p-2xl flex flex-col min-h-[280px]">
          {/* 标签行 — Monopo 风格大写小字 */}
          <div className="flex items-center gap-xs mb-lg">
            {list.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="font-body text-xs tracking-[0.2em] uppercase text-ink-300"
              >
                {tag}
              </span>
            ))}
            {list.tags.length > 0 && list.tags.slice(0, 3).length < list.tags.length && (
              <span className="font-body text-xs text-ink-300">…</span>
            )}
          </div>

          {/* 标题 + 置信度 */}
          <div className="flex items-start gap-md flex-1">
            <div className="flex-shrink-0 pt-xs transition-transform duration-300 group-hover:scale-110">
              <ConfidenceSeal
                confidence={list.confidence}
                size="sm"
                spinning={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-xl md:text-2xl text-ink-900 group-hover:text-vermilion transition-colors duration-300 leading-snug mb-sm">
                {list.title}
              </h3>
              <p className="font-body text-sm text-ink-500 line-clamp-2">
                {list.subtitle}
              </p>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between pt-lg mt-auto border-t border-ink-100 text-xs text-ink-300">
            <span className="tracking-wide">
              {list.author.nickname} · {list.itemCount} {t('items')}
            </span>
            <span className="tracking-wide">{list.viewCount} {t('views')}</span>
          </div>
        </div>

        {/* Hover 底部线条动画 */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-vermilion transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Link>
    </ScaleReveal>
  );
}

/* ─────────────────────────────────────────
   3. 哲学区 — Dark 背景，Monopo 大排版
   ───────────────────────────────────────── */
function PhilosophySection() {
  const t = useTranslations('home');

  return (
    <section className="relative py-5xl bg-ink-900 overflow-hidden">
      {/* 顶部渐变过渡：Paper → Dark */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-paper to-transparent pointer-events-none" />

      {/* 静态背景光晕 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(226,85,63,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-lg text-center">
        {/* 大标题 — Monopo 排版风格 */}
        <RevealText className="font-heading text-4xl md:text-6xl lg:text-7xl text-paper tracking-wider leading-[1.1] mb-xl" delay={0.1}>
          {t('philosophyTitle')}
        </RevealText>

        {/* 描述 */}
        <SlideReveal className="font-body text-base md:text-lg text-ink-300 leading-relaxed max-w-2xl mx-auto mb-3xl" direction="up" delay={0.3}>
          <p>{t('philosophyDesc')}</p>
        </SlideReveal>

        {/* 三个数据卡片 */}
        <div className="grid grid-cols-3 gap-lg mb-3xl">
          {[
            { value: '92%', label: t('confidenceLabel'), color: 'text-vermilion' },
            { value: '85%', label: t('algorithmLabel'), color: 'text-celadon' },
            { value: '78%', label: t('communityLabel'), color: 'text-apricot' },
          ].map((item, i) => (
            <ScaleReveal key={item.label} delay={0.4 + i * 0.12} scaleFrom={0.85}>
              <div className="text-center">
                <div className={`font-heading text-3xl md:text-4xl ${item.color} mb-xs`}>
                  {item.value}
                </div>
                <div className="font-body text-xs tracking-[0.2em] uppercase text-ink-400">
                  {item.label}
                </div>
              </div>
            </ScaleReveal>
          ))}
        </div>

        {/* 链接 */}
        <SlideReveal direction="up" delay={0.85} distance={20}>
          <Link
            href="/about"
            className="inline-flex items-center gap-xs font-body text-sm text-ink-100 hover:text-vermilion transition-colors pb-3xs border-b border-ink-700 hover:border-vermilion"
          >
            {t('learnMore')}
            <span className="text-xs">→</span>
          </Link>
        </SlideReveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   4. CTA — 深色底，Monopo 风格大字 CTA
   ───────────────────────────────────────── */
function CTASection() {
  const t = useTranslations('home');

  return (
    <section className="relative py-5xl overflow-hidden bg-ink-900">
      {/* 装饰光晕 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(226,85,63,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-lg text-center">
        {/* 大标题两行 */}
        <RevealText className="font-heading text-4xl md:text-6xl lg:text-7xl text-paper tracking-wider leading-[1.15] mb-lg" delay={0}>
          {t('ctaTitle')}
        </RevealText>
        <RevealText className="font-heading text-4xl md:text-6xl lg:text-7xl text-vermilion tracking-wider leading-[1.15] mb-2xl" delay={0.15}>
          {t('ctaTitleLine2')}
        </RevealText>

        {/* 描述 */}
        <SlideReveal className="mb-2xl" direction="up" delay={0.3}>
          <p className="font-body text-base text-ink-300 leading-relaxed max-w-lg mx-auto">
            {t('ctaDesc')}
          </p>
        </SlideReveal>

        <ScaleReveal delay={0.5} scaleFrom={0.9}>
          <Link
            href="/list/new"
            className="group inline-flex items-center justify-center px-12 py-5 bg-vermilion text-paper font-body font-semibold text-base hover:bg-vermilion-light transition-all duration-300 tracking-wide"
          >
            {t('ctaButton')}
          </Link>
        </ScaleReveal>
      </div>
    </section>
  );
}