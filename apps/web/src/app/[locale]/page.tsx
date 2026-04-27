'use client';

import { useQuery } from '@tanstack/react-query';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ConfidenceSeal, EmptyState, LoadingState, ErrorState } from '@weiwuweixin/ui';
import { fetchFeedLists } from '@/lib/api';
import type { FeedList } from '@/lib/mock-data';
import { Marquee } from '@/components/marquee';
import { HeroMeta } from '@/components/hero-meta';
import { WordCycler } from '@/components/word-cycler';

/* ============================================================
   首页 — 围物为心 · Monopo London 风格重构 v7
   
   第一原则：
   1. 不居中 — 左对齐/不对称网格/满版铺开
   2. 不靠光效 — 靠字号差/留白/节奏感
   3. 巨型排版 — 16vw+ 标题
   4. 幕布式转场 — 黑屏撕开，内容滚入
   ============================================================ */

/* ── 缓动函数 ── */
const monopoEase = [0.165, 0.84, 0.44, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* ── 滚动方向上下文 ── */
import { createContext, useContext } from 'react';
const ScrollDirectionContext = createContext<'up' | 'down'>('down');
function useScrollDirection() {
  return useContext(ScrollDirectionContext);
}

function ScrollDirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      if (Math.abs(diff) > 5) {
        setDirection(diff > 0 ? 'down' : 'up');
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ScrollDirectionContext.Provider value={direction}>
      {children}
    </ScrollDirectionContext.Provider>
  );
}

/* ── 工具: 交错文字揭示 ── */
function CharReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.03,
}: {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const scrollDir = useScrollDirection();
  const enterY = scrollDir === 'up' ? '-120%' : '120%';
  const enterRotateX = scrollDir === 'up' ? -40 : 40;
  const chars = text.split('');

  return (
    <div ref={ref} className={`flex flex-wrap ${className || ''}`} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ y: enterY, opacity: 0, rotateX: enterRotateX }}
          animate={isInView ? { y: '0%', opacity: 1, rotateX: 0 } : {}}
          transition={{
            duration: 0.8,
            ease: monopoEase,
            delay: delay + i * staggerDelay,
          }}
          className="inline-block"
          style={{ transformOrigin: scrollDir === 'up' ? 'top center' : 'bottom center' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
}

/* ── 工具: 文字行揭示 ── */
function RevealText({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'auto';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const scrollDir = useScrollDirection();
  const enterFrom = direction === 'auto'
    ? (scrollDir === 'down' ? 'up' : 'down')
    : direction;

  return (
    <div ref={ref} className={`overflow-hidden ${className || ''}`}>
      <motion.div
        initial={{ y: enterFrom === 'up' ? '110%' : '-110%', opacity: 0 }}
        animate={isInView ? { y: '0%', opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: monopoEase, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── 工具: 视差层 ── */
function ParallaxLayer({
  children,
  speed = 0.3,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} style={{ y: springY }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── 工具: 计数动画 ── */
function AnimatedCounter({
  target,
  suffix = '',
  duration = 2,
  delay = 0,
}: {
  target: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let raf: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay * 1000;
      if (elapsed < 0) {
        raf = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easedProgress * target));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target, duration, delay]);

  return <span ref={ref}>{count}{suffix}</span>;
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
  const scrollDir = useScrollDirection();
  const yDirection = scrollDir === 'up' ? -30 : 30;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: scaleFrom, y: yDirection }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 1.1, ease: monopoEase, delay }}
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
  direction?: 'up' | 'down' | 'left' | 'right' | 'auto';
  delay?: number;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const scrollDir = useScrollDirection();
  const resolvedDir = direction === 'auto'
    ? (scrollDir === 'down' ? 'up' : 'down')
    : direction;
  const dir = { up: { x: 0, y: distance }, down: { x: 0, y: -distance }, left: { x: distance, y: 0 }, right: { x: -distance, y: 0 } }[resolvedDir];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: dir.x, y: dir.y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 1.0, ease: monopoEase, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   主页组件 — Monopo London 风格重构
   ═══════════════════════════════════════════════ */
export default function HomePage() {
  const t = useTranslations('home');
  const tm = useTranslations('microcopy');

  const { data: lists, isLoading, isError, refetch } = useQuery<FeedList[], Error>({
    queryKey: ['feed-lists'],
    queryFn: fetchFeedLists,
  });

  /* 页面载入状态 */
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollDirectionProvider>
    <main className="min-h-screen bg-paper">
      {/* 页面载入遮罩 — 幕布效果由 PageTransition 组件在 layout 中处理 */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="fixed inset-0 z-[100] bg-ink-900 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: monopoEase }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.4, ease: monopoEase, delay: 0.2 }}
              className="font-heading text-4xl text-vermilion tracking-[0.2em]"
            >
              围
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Hero — 巨型文字+不对称布局 */}
      <HeroSection />

      {/* 2. Marquee 跑马灯 — Hero与内容区间过渡 */}
      <Marquee items={['SUBJECTIVITY', '主观性', 'CONFIDENCE', '置信度', 'RANK', '榜单']} />

      {/* 3. 近期榜单 — 编辑式不对称网格 */}
      <section id="feed" className="py-5xl bg-paper relative">
        <div className="max-w-7xl mx-auto px-lg md:px-2xl">
          {/* 章节编号系统 */}
          <SlideReveal direction="auto" delay={0}>
            <div className="flex items-baseline gap-md mb-2xl">
              <span className="font-mono text-[11px] tracking-[0.3em] text-ink-300">— 02</span>
              <span className="w-24 h-[1px] bg-ink-200" />
              <span className="font-mono text-[11px] tracking-[0.25em] text-ink-500">
                INDEX / RECENT
              </span>
            </div>
          </SlideReveal>

          {/* Sticky 章节标题 */}
          <div className="sticky top-[12vh] z-10 mb-3xl mix-blend-difference">
            <RevealText className="font-heading text-[clamp(48px,8vw,120px)] text-paper leading-none tracking-[-0.04em]" delay={0.1}>
              <span>Recent </span><span className="italic text-vermilion">Lists</span>
            </RevealText>
          </div>

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
                  className="inline-block px-6 py-3 bg-vermilion text-paper rounded-none font-medium hover:bg-vermilion-light transition-colors"
                >
                  {t('newList')}
                </Link>
              }
            />
          )}
          {lists && lists.length > 0 && (
            <div className="grid grid-cols-12 gap-x-lg gap-y-3xl">
              {lists.map((list, i) => {
                const layouts = [
                  'col-span-12 md:col-span-7 md:col-start-1',
                  'col-span-12 md:col-span-4 md:col-start-9 md:mt-[12vh]',
                  'col-span-12 md:col-span-5 md:col-start-2',
                  'col-span-12 md:col-span-6 md:col-start-7 md:mt-[-4vh]',
                ];
                const cls = layouts[i % layouts.length];
                return <ListCard key={list.id} list={list} index={i} className={cls} />;
              })}
            </div>
          )}

          {/* 底部 CTA 链接 */}
          <SlideReveal className="text-center mt-2xl" direction="auto" delay={0.2}>
            <Link
              href="/explore"
              className="group inline-flex items-center gap-sm font-body text-sm text-ink-500 hover:text-vermilion transition-colors duration-300"
            >
              {t('discoverAll')}
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-ink-200 group-hover:border-vermilion group-hover:bg-vermilion transition-all duration-500">
                <svg className="w-3 h-3 text-ink-500 group-hover:text-paper transition-colors" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6h8M6 2l4 4-4 4" />
                </svg>
              </span>
            </Link>
          </SlideReveal>
        </div>
      </section>

      {/* 4. 哲学区 — 三色改单色 vermilion */}
      <PhilosophySection />

      {/* 5. CTA — 涟漪按钮 */}
      <CTASection />
    </main>
    </ScrollDirectionProvider>
  );
}

/* ─────────────────────────────────────────
   1. Hero — 巨型文字 + 不对称布局
   左上元信息 / 左下大标题 / 右下副信息+滚动 / 左下CTA
   ───────────────────────────────────────── */
function HeroSection() {
  const t = useTranslations('home');
  const sectionRef = useRef<HTMLElement>(null);

  /* §2.1 入场序列 variants */
  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.2, delayChildren: 0.6 },
    },
  };
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] } },
  };

  /* §2.4 鼠标视差 — 极淡，只在主标题上 */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const titleX = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const titleY = useTransform(mouseY, [-0.5, 0.5], [-8, 8]);
  const titleSpringX = useSpring(titleX, { stiffness: 80, damping: 25 });
  const titleSpringY = useSpring(titleY, { stiffness: 80, damping: 25 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  /* Hero 滚动视差 */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  /* §2.3 WordCycler 词语 */
  const cycleWords = [t('heroWordCycle1'), t('heroWordCycle2'), t('heroWordCycle3'), t('heroWordCycle4')];

  return (
    <motion.section
      ref={sectionRef}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative w-full h-[100svh] bg-ink-900 overflow-hidden"
      onMouseMove={handleMove}
    >
      {/* 内容层 — 滚动视差 */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* §2.2 右上 — 实时时钟/元数据角标（替代原来的左上编号） */}
        <motion.div variants={itemVariants}>
          <HeroMeta />
        </motion.div>

        {/* §2.5 左侧边缘竖字 — 从下往上读 */}
        <motion.div variants={itemVariants} className="absolute left-[1.5vw] top-1/2 -translate-y-1/2 z-10 select-none">
          <span
            className="font-mono text-[10px] tracking-[0.4em] text-white/40 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Subjectivity is sacred — guard it with care
          </span>
        </motion.div>

        {/* §2.5 右侧边缘竖字 — 从上往下读 */}
        <motion.div variants={itemVariants} className="absolute right-[1.5vw] top-1/2 -translate-y-1/2 z-10 select-none">
          <span
            className="font-mono text-[10px] tracking-[0.4em] text-white/40 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl' }}
          >
            Est · 2026 · WeiwuWeixin Studio
          </span>
        </motion.div>

        {/* 左上 — 极小字编号+元信息（保留作为第二元信息行） */}
        <motion.div variants={itemVariants} className="absolute top-[12vh] left-[6vw] flex items-center gap-md text-paper/60 z-10">
          <span className="font-mono text-[11px] tracking-[0.2em]">N°04 — 2026</span>
          <span className="w-12 h-[1px] bg-paper/30" />
          <span className="font-mono text-[11px] tracking-[0.2em]">WEIWUWEIXIN</span>
        </motion.div>

        {/* 主标题 — 满版超大字，左对齐 + §2.4 鼠标视差 */}
        <motion.div variants={itemVariants} className="absolute bottom-[18vh] left-[6vw] right-[6vw] z-10">
          {/* 视差只在主标题上，元数据/CTA完全静止 */}
          <motion.div style={{ x: titleSpringX, y: titleSpringY }}>
            <h1 className="font-heading text-[clamp(80px,16vw,260px)] text-paper leading-[0.92] tracking-[-0.04em] font-normal">
              <CharReveal text={t('heroLine1')} className="block opacity-90" delay={0.4} staggerDelay={0.06} />
              <span className="block italic text-vermilion">
                {t('heroWordCycleJoin')}
                <WordCycler words={cycleWords} className="text-vermilion" />
              </span>
            </h1>
          </motion.div>
        </motion.div>

        {/* 右下角 — 副信息 */}
        <motion.div variants={itemVariants} className="absolute bottom-[6vh] right-[6vw] flex flex-col items-end gap-xs z-10">
          <motion.p
            className="font-body text-xs text-paper/50 max-w-[260px] text-right leading-relaxed"
          >
            {t('heroLine3Bold')}{t('heroLine3')} / {t('heroLine4')}
          </motion.p>
          {/* §2.7 可点击滚动指示器 */}
          <button
            onClick={() => {
              document.querySelector('#feed')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-md group flex items-center gap-xs text-white/60 text-[11px] tracking-[0.3em] font-mono cursor-pointer hover:text-white transition-colors duration-500"
          >
            SCROLL
            <span className="block w-px h-8 bg-white/30 ml-sm relative overflow-hidden">
              <span className="absolute top-0 left-0 w-full h-[30%] bg-vermilion scroll-line-down" />
            </span>
          </button>
        </motion.div>

        {/* 左下角 — 主 CTA 单一按钮 + 文字链接 */}
        <motion.div variants={itemVariants} className="absolute bottom-[6vh] left-[6vw] flex items-center gap-2xl z-10">
          <Link href="/list/new" className="group inline-flex items-center gap-md text-paper">
            <span className="w-14 h-14 rounded-full border border-paper/40 group-hover:bg-paper group-hover:text-ink-900 transition-all duration-700 flex items-center justify-center text-xl">→</span>
            <span className="font-body text-sm tracking-wider">Start a List</span>
          </Link>
          <Link href="/explore" className="font-body text-sm text-paper/60 hover:text-paper underline-offset-4 hover:underline">
            Explore
          </Link>
        </motion.div>
      </motion.div>

      {/* 仅保留极淡的底部朱砂光晕 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40vh] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 120%, rgba(226,85,63,0.12), transparent 70%)' }}
      />

      {/* §2.6 噪点纹理 Overlay（Film Grain） */}
      <div
        className="grain-overlay absolute inset-0 pointer-events-none z-30 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </motion.section>
  );
}

/* ─────────────────────────────────────────
   2. 榜单卡片 — 编辑式不对称布局 + 大编号
   ───────────────────────────────────────── */
function ListCard({ list, index, className }: { list: FeedList; index: number; className?: string }) {
  const t = useTranslations('home');
  const [isHovered, setIsHovered] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  return (
    <ScaleReveal className={className} delay={0.1 + index * 0.08} scaleFrom={0.95}>
      <Link
        href={`/list/${list.id}`}
        className="group block relative overflow-hidden bg-white border border-ink-100 hover:border-vermilion/40 transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 大编号 */}
        <div className="absolute top-lg left-lg font-heading text-[clamp(48px,6vw,96px)] text-ink-100 leading-none pointer-events-none transition-colors duration-500 group-hover:text-vermilion/20">
          {num}
        </div>

        {/* 卡片内容 */}
        <div className="p-2xl pt-[6rem] flex flex-col min-h-[320px] relative z-10">
          {/* 标签行 */}
          <div className="flex items-center gap-sm mb-lg">
            {list.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={tag} className="font-mono text-[11px] tracking-[0.25em] text-ink-300">
                {tag}{i < Math.min(list.tags.length, 3) - 1 && <span className="mx-xs text-ink-200"> ‣ </span>}
              </span>
            ))}
          </div>

          {/* 标题 + 置信度 */}
          <div className="flex items-start gap-md flex-1">
            <motion.div
              className="flex-shrink-0 pt-xs"
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ duration: 0.3, ease: monopoEase }}
            >
              <ConfidenceSeal confidence={list.confidence} size="sm" spinning={isHovered} />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-2xl md:text-3xl text-ink-900 leading-snug mb-sm group-hover:text-vermilion transition-colors duration-500">
                {list.title}
              </h3>
              <p className="font-body text-sm text-ink-500 line-clamp-2 transition-all duration-500 group-hover:text-ink-700">
                {list.subtitle}
              </p>
            </div>
          </div>

          {/* 底部信息 — Monopo style subtitle slide-in */}
          <div className="flex items-center justify-between pt-lg mt-auto border-t border-ink-100 text-xs text-ink-300 transition-all duration-500 group-hover:border-ink-200">
            <span className="tracking-wide transition-colors duration-500 group-hover:text-ink-500">
              {list.author.nickname} · {list.itemCount} {t('items')}
            </span>
            <motion.span
              className="tracking-wide"
              animate={{ opacity: isHovered ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            >
              {list.viewCount} {t('views')}
            </motion.span>
          </div>
        </div>

        {/* Hover 底部线条 — from-left expand */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-vermilion"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5, ease: monopoEase }}
          style={{ transformOrigin: 'left' }}
        />
      </Link>
    </ScaleReveal>
  );
}

/* ─────────────────────────────────────────
   3. 哲学区 — 三色改单色 vermilion + 大编号
   ───────────────────────────────────────── */
function PhilosophySection() {
  const t = useTranslations('home');

  return (
    <section className="relative py-5xl bg-ink-900 overflow-hidden">
      {/* 顶部渐变过渡 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-paper to-transparent pointer-events-none" />

      {/* 视差装饰 */}
      <ParallaxLayer speed={0.15} className="absolute top-10 right-[10%] pointer-events-none">
        <div className="w-32 h-32 rounded-full border border-ink-700/20" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.25} className="absolute bottom-20 left-[8%] pointer-events-none">
        <div className="w-20 h-20 rounded-full border border-vermilion/15" />
      </ParallaxLayer>

      {/* 仅保留极淡的光晕 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(226,85,63,0.06) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-lg text-center">
        {/* 章节编号 */}
        <SlideReveal direction="auto" delay={0}>
          <div className="flex items-baseline gap-md mb-2xl justify-center">
            <span className="font-mono text-[11px] tracking-[0.3em] text-ink-300/60">— 03</span>
            <span className="w-24 h-[1px] bg-ink-700" />
            <span className="font-mono text-[11px] tracking-[0.25em] text-ink-500">PHILOSOPHY</span>
          </div>
        </SlideReveal>

        {/* 大标题 — 超大字号 */}
        <RevealText className="font-heading text-[clamp(36px,6vw,80px)] text-paper leading-[0.95] tracking-[-0.04em] mb-xl" delay={0.1}>
          {t('philosophyTitle')}
        </RevealText>

        {/* 描述 */}
        <SlideReveal className="font-body text-base md:text-lg text-ink-300 leading-relaxed max-w-2xl mx-auto mb-3xl" direction="auto" delay={0.3}>
          <p>{t('philosophyDesc')}</p>
        </SlideReveal>

        {/* 三个数据卡片 — 统一 vermilion 色靠字号差异做层级 */}
        <div className="grid grid-cols-3 gap-lg mb-3xl">
          {[
            { value: 92, suffix: '%', label: t('confidenceLabel'), size: 'text-4xl md:text-6xl' },
            { value: 85, suffix: '%', label: t('algorithmLabel'), size: 'text-3xl md:text-5xl' },
            { value: 78, suffix: '%', label: t('communityLabel'), size: 'text-2xl md:text-4xl' },
          ].map((item, i) => (
            <ScaleReveal key={item.label} delay={0.4 + i * 0.15} scaleFrom={0.85}>
              <div className="text-center group cursor-default">
                <motion.div
                  className={`font-heading ${item.size} text-vermilion mb-xs`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3, ease: monopoEase }}
                >
                  <AnimatedCounter target={item.value} suffix={item.suffix} delay={0.4 + i * 0.15} />
                </motion.div>
                <div className="font-mono text-[11px] tracking-[0.25em] text-ink-400">
                  {item.label}
                </div>
              </div>
            </ScaleReveal>
          ))}
        </div>

        {/* 链接 */}
        <SlideReveal direction="auto" delay={0.85} distance={20}>
          <Link
            href="/about"
            className="group inline-flex items-center gap-sm font-body text-sm text-ink-100 hover:text-vermilion transition-colors duration-300"
          >
            {t('learnMore')}
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-ink-600 group-hover:border-vermilion group-hover:bg-vermilion transition-all duration-500">
              <svg className="w-3 h-3 text-ink-300 group-hover:text-paper transition-colors" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </span>
          </Link>
        </SlideReveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   4. CTA — 深色底 + 涟漪按钮
   ───────────────────────────────────────── */
function CTASection() {
  const t = useTranslations('home');

  return (
    <section className="relative py-5xl overflow-hidden bg-ink-900">
      {/* 章节编号 */}
      <div className="flex items-baseline gap-md mb-2xl justify-center relative z-10">
        <span className="font-mono text-[11px] tracking-[0.3em] text-ink-300/60">— 04</span>
        <span className="w-24 h-[1px] bg-ink-700" />
        <span className="font-mono text-[11px] tracking-[0.25em] text-ink-500">CTA</span>
      </div>

      {/* 仅保留极淡的中心光晕 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(226,85,63,0.05) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-lg text-center">
        {/* 大标题 */}
        <CharReveal
          text={t('ctaTitle')}
          className="font-heading text-[clamp(48px,8vw,120px)] text-paper leading-[0.92] tracking-[-0.04em] mb-xs justify-center"
          delay={0}
          staggerDelay={0.04}
        />
        <RevealText className="font-heading text-[clamp(48px,8vw,120px)] text-vermilion leading-[0.92] tracking-[-0.04em] mb-2xl justify-center" delay={0.3}>
          {t('ctaTitleLine2')}
        </RevealText>

        {/* 描述 */}
        <SlideReveal className="mb-2xl" direction="auto" delay={0.5}>
          <p className="font-body text-base text-ink-300 leading-relaxed max-w-lg mx-auto">
            {t('ctaDesc')}
          </p>
        </SlideReveal>

        <ScaleReveal delay={0.7} scaleFrom={0.9}>
          <Link
            href="/list/new"
            className="group relative overflow-hidden inline-flex items-center justify-center px-10 py-4 font-body font-medium text-base tracking-wide rounded-none bg-vermilion text-paper hover:bg-vermilion-light transition-colors duration-600"
          >
            {t('ctaButton')}
          </Link>
        </ScaleReveal>
      </div>
    </section>
  );
}