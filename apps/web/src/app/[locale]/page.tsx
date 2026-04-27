'use client';

import { useQuery } from '@tanstack/react-query';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ConfidenceSeal, EmptyState, LoadingState, ErrorState } from '@weiwuweixin/ui';
import { fetchFeedLists } from '@/lib/api';
import type { FeedList } from '@/lib/mock-data';

/* ============================================================
   首页 — 围物为心 · Monopo 风格 v3 "高设2版"
   
   动态效果增强：
   1. Hero区: 鼠标跟随光效 + 文字逐字弹入 + 滚动视差
   2. 榜单区: Sticky滚动标题切换 + 滚动标尺 + 卡片交错出现
   3. 哲学区: 数字滚动计数器 + 视差装饰
   4. CTA区: 涟漪按钮 + 入场动画增强
   5. 全局: 自定义光标 + 页面载入动画
   ============================================================ */

/* ── 缓动函数 (Monopo cubic-bezier) ── */
const monopoEase = [0.165, 0.84, 0.44, 1] as const;
const monopoEaseOut = [0.22, 1, 0.36, 1] as const;

/* ── 工具: 文字逐行揭示 (增强版) ── */
function RevealText({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className={`overflow-hidden ${className || ''}`}>
      <motion.div
        initial={{ y: direction === 'up' ? '110%' : '-110%', opacity: 0 }}
        animate={isInView ? { y: '0%', opacity: 1 } : {}}
        transition={{
          duration: 1.2,
          ease: monopoEase,
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── 工具: 交错文字揭示 — 每个字符独立动画 ── */
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

  return (
    <div ref={ref} className={`flex flex-wrap justify-center ${className || ''}`} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ y: '120%', opacity: 0, rotateX: 40 }}
          animate={isInView ? { y: '0%', opacity: 1, rotateX: 0 } : {}}
          transition={{
            duration: 0.8,
            ease: monopoEase,
            delay: delay + i * staggerDelay,
          }}
          className="inline-block"
          style={{ transformOrigin: 'bottom center' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
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
      // Monopo ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easedProgress * target));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target, duration, delay]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

/* ── 工具: 涟漪按钮 ── */
function RippleButton({
  children,
  className,
  href,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 800);
  }, []);

  const baseClass = variant === 'primary'
    ? 'bg-vermilion text-paper hover:bg-vermilion-light'
    : 'border border-ink-100 text-ink-300 hover:border-paper hover:text-paper';

  const inner = (
    <>
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-paper/30 pointer-events-none"
          style={{ left: ripple.x - 10, top: ripple.y - 10 }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 300, height: 300, opacity: 0, x: -150, y: -150 }}
          transition={{ duration: 0.8, ease: monopoEase }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center gap-xs">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        ref={btnRef as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={handleClick}
        className={`group relative overflow-hidden inline-flex items-center justify-center px-10 py-4 font-body font-medium text-base transition-all duration-600 tracking-wide rounded-none ${baseClass} ${className || ''}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      ref={btnRef as React.Ref<HTMLButtonElement>}
      onClick={(e) => { handleClick(e); onClick?.(); }}
      className={`group relative overflow-hidden inline-flex items-center justify-center px-10 py-4 font-body font-medium text-base transition-all duration-600 tracking-wide rounded-none ${baseClass} ${className || ''}`}
    >
      {inner}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   主页组件 — 高设2版 · 动态增强
   ═══════════════════════════════════════════════ */
export default function HomePage() {
  const t = useTranslations('home');
  const tm = useTranslations('microcopy');

  const { data: lists, isLoading, isError, refetch } = useQuery<FeedList[], Error>({
    queryKey: ['feed-lists'],
    queryFn: fetchFeedLists,
  });

  /* ── 页面载入动画 ── */
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      {/* 页面载入遮罩 */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="fixed inset-0 z-[100] bg-ink-900 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: monopoEase }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.6, ease: monopoEase, delay: 0.2 }}
              className="font-heading text-4xl text-vermilion tracking-[0.2em]"
            >
              围
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Hero — 全幅沉浸式 + 鼠标跟随光效 */}
      <HeroSection />

      {/* 2. 近期榜单 — Sticky 滚动 + 标尺 */}
      <section id="feed" className="py-5xl bg-paper relative">
        <div className="max-w-6xl mx-auto px-lg">
          {/* Section Header - Monopo style uppercase label */}
          <SlideReveal direction="up" delay={0} distance={30}>
            <div className="flex items-center gap-md mb-2xl">
              <div className="w-16 h-[1px] bg-ink-300" />
              <p className="font-body text-xs tracking-[0.3em] uppercase text-ink-300">
                {t('recentListsLabel')}
              </p>
            </div>
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
                  className="inline-block px-6 py-3 bg-vermilion text-paper rounded-none font-medium hover:bg-vermilion-light transition-colors"
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

          {/* 底部 CTA 链接 — Monopo style arrow */}
          <SlideReveal className="text-center mt-2xl" direction="up" delay={0.2}>
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

      {/* 3. 哲学区 ── 视差 + 计数器 */}
      <PhilosophySection />

      {/* 4. CTA ── 涟漪按钮增强 */}
      <CTASection />
    </main>
  );
}

/* ─────────────────────────────────────────
   1. Hero — 全幅沉浸式 + 鼠标跟随渐变 + 逐字动画
   ───────────────────────────────────────── */
function HeroSection() {
  const t = useTranslations('home');
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  /* 鼠标跟随光效 */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  /* Hero 区域滚动视差 */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-ink-900"
      onMouseMove={handleMouseMove}
    >
      {/* 鼠标跟随渐变光效 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${mousePos.x}% ${mousePos.y}%, rgba(226,85,63,0.12) 0%, transparent 50%),
                       radial-gradient(ellipse 40% 30% at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(127,179,163,0.08) 0%, transparent 40%)`,
        }}
      />

      {/* 网格纹理层 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      {/* 内容层 — 滚动视差 */}
      <motion.div
        className="relative z-10 text-center px-lg max-w-4xl mx-auto"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* 第一行: 以心度物 — 逐字弹入 */}
        <CharReveal
          text={t('heroLine1')}
          className="font-heading text-6xl md:text-8xl lg:text-9xl text-paper tracking-[0.08em] leading-[1.1] mb-xs"
          delay={0.4}
          staggerDelay={0.05}
        />

        {/* 第二行: 以物观心 — 逐字弹入（延迟更久） */}
        <CharReveal
          text={t('heroLine2')}
          className="font-heading text-6xl md:text-8xl lg:text-9xl text-ink-300 tracking-[0.08em] leading-[1.1] mb-2xl"
          delay={0.8}
          staggerDelay={0.04}
        />

        {/* 第三行: 品牌声明 — RevealText */}
        <RevealText className="font-body text-lg md:text-xl text-ink-300 max-w-xl mx-auto leading-relaxed mb-2xl" delay={1.2}>
          <><strong className="text-paper font-semibold">{t('heroLine3Bold')}</strong>{t('heroLine3')}</>
        </RevealText>

        {/* 副标题 — 缓慢淡入 */}
        <motion.p
          className="font-body text-sm text-ink-500 max-w-md mx-auto leading-relaxed mb-2xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: monopoEase, delay: 1.5 }}
        >
          {t('heroLine4')}
        </motion.p>

        {/* CTA 按钮 — 涟漪效果 */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: monopoEase, delay: 1.7 }}
        >
          <RippleButton href="/list/new" variant="primary">
            {t('newList')}
            <span className="ml-xs group-hover:translate-x-1 transition-transform duration-300">→</span>
          </RippleButton>
          <RippleButton href="#feed" variant="outline">
            {t('browseLists')}
          </RippleButton>
        </motion.div>
      </motion.div>

      {/* 底部滚动指示 — Monopo style scroll indicator */}
      <motion.div
        className="absolute bottom-xl left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: monopoEase, delay: 2.0 }}
      >
        <span className="font-body text-xs tracking-[0.3em] uppercase text-ink-500">
          {t('scrollDown')}
        </span>
        {/* 滚动线条动画 */}
        <div className="w-[1px] h-12 bg-ink-500/30 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-1/3 bg-vermilion"
            animate={{ y: ['0%', '200%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>

      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-paper to-transparent pointer-events-none" />
    </section>
  );
}

/* ─────────────────────────────────────────
   2. 榜单卡片 — Monopo 风格大图卡片 + Hover 增强动画
   ───────────────────────────────────────── */
function ListCard({ list, index }: { list: FeedList; index: number }) {
  const t = useTranslations('home');
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const row = Math.floor(index / 2);
  const col = index % 2;
  const colDelay = (row * 0.1) + (col * 0.08);

  return (
    <ScaleReveal delay={colDelay} scaleFrom={0.92}>
      <Link
        href={`/list/${list.id}`}
        className="group block relative overflow-hidden bg-white border border-ink-100 hover:border-ink-200 transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* 鼠标跟随光效 */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          animate={{
            background: isHovered
              ? `radial-gradient(circle 200px at ${mousePos.x}% ${mousePos.y}%, rgba(226,85,63,0.06) 0%, transparent 100%)`
              : 'radial-gradient(circle 0px at 50% 50%, transparent 0%, transparent 100%)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* 卡片内容区 */}
        <div className="p-2xl flex flex-col min-h-[280px] relative z-20">
          {/* 标签行 — Monopo 风格大写小字 + 分隔 */}
          <div className="flex items-center gap-sm mb-lg">
            {list.tags.slice(0, 3).map((tag: string, i: number) => (
              <motion.span
                key={tag}
                className="font-body text-xs tracking-[0.2em] uppercase text-ink-300"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: colDelay + i * 0.05, duration: 0.6, ease: monopoEase }}
                viewport={{ once: true }}
              >
                {tag}
                {i < Math.min(list.tags.length, 3) - 1 && (
                  <span className="mx-xs text-ink-200"> ‣ </span>
                )}
              </motion.span>
            ))}
          </div>

          {/* 标题 + 置信度 */}
          <div className="flex items-start gap-md flex-1">
            <motion.div
              className="flex-shrink-0 pt-xs"
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ duration: 0.3, ease: monopoEase }}
            >
              <ConfidenceSeal
                confidence={list.confidence}
                size="sm"
                spinning={isHovered}
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-xl md:text-2xl text-ink-900 group-hover:text-vermilion transition-colors duration-500 leading-snug mb-sm">
                {list.title}
              </h3>
              <p className="font-body text-sm text-ink-500 line-clamp-2 transition-all duration-500 group-hover:text-ink-700">
                {list.subtitle}
              </p>
            </div>
          </div>

          {/* 底部信息 */}
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

        {/* Hover 底部线条动画 — Monopo style from-left expand */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-vermilion"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5, ease: monopoEase }}
          style={{ transformOrigin: 'left' }}
        />

        {/* Hover 右侧竖线 — Monopo style */}
        <motion.div
          className="absolute top-0 right-0 bottom-0 w-[2px] bg-vermilion/30"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: monopoEase, delay: 0.1 }}
          style={{ transformOrigin: 'top' }}
        />
      </Link>
    </ScaleReveal>
  );
}

/* ─────────────────────────────────────────
   3. 哲学区 — Dark 背景 + 视差 + 计数器 + 浮动装饰
   ───────────────────────────────────────── */
function PhilosophySection() {
  const t = useTranslations('home');

  return (
    <section className="relative py-5xl bg-ink-900 overflow-hidden">
      {/* 顶部渐变过渡 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-paper to-transparent pointer-events-none" />

      {/* 视差装饰 — 飘浮的圆环 */}
      <ParallaxLayer speed={0.15} className="absolute top-10 right-[10%] pointer-events-none">
        <div className="w-32 h-32 rounded-full border border-ink-700/30 opacity-20" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.25} className="absolute bottom-20 left-[8%] pointer-events-none">
        <div className="w-20 h-20 rounded-full border border-vermilion/20 opacity-30" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.1} className="absolute top-1/2 left-[5%] pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-celadon/40 opacity-40" />
      </ParallaxLayer>

      {/* 鼠标跟随渐变 */}
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

        {/* 三个数据卡片 — 增强计数动画 */}
        <div className="grid grid-cols-3 gap-lg mb-3xl">
          {[
            { value: 92, suffix: '%', label: t('confidenceLabel'), color: 'text-vermilion' },
            { value: 85, suffix: '%', label: t('algorithmLabel'), color: 'text-celadon' },
            { value: 78, suffix: '%', label: t('communityLabel'), color: 'text-apricot' },
          ].map((item, i) => (
            <ScaleReveal key={item.label} delay={0.4 + i * 0.15} scaleFrom={0.85}>
              <div className="text-center group cursor-default">
                {/* 数字 — 计数动画 */}
                <motion.div
                  className={`font-heading text-3xl md:text-4xl ${item.color} mb-xs`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3, ease: monopoEase }}
                >
                  <AnimatedCounter target={item.value} suffix={item.suffix} delay={0.4 + i * 0.15} />
                </motion.div>
                <div className="font-body text-xs tracking-[0.2em] uppercase text-ink-400">
                  {item.label}
                </div>
              </div>
            </ScaleReveal>
          ))}
        </div>

        {/* 链接 — Monopo style arrow */}
        <SlideReveal direction="up" delay={0.85} distance={20}>
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
   4. CTA — 深色底 + 涟漪按钮 + 入场增强
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

      {/* 浮动装饰元素 */}
      <ParallaxLayer speed={0.2} className="absolute top-20 right-[15%] pointer-events-none">
        <div className="w-16 h-16 rounded-full border border-vermilion/20 opacity-20" />
      </ParallaxLayer>

      <div className="relative z-10 max-w-3xl mx-auto px-lg text-center">
        {/* 大标题 — 逐字动画 */}
        <CharReveal
          text={t('ctaTitle')}
          className="font-heading text-4xl md:text-6xl lg:text-7xl text-paper tracking-wider leading-[1.15] mb-xs"
          delay={0}
          staggerDelay={0.04}
        />
        <RevealText className="font-heading text-4xl md:text-6xl lg:text-7xl text-vermilion tracking-wider leading-[1.15] mb-2xl" delay={0.3}>
          {t('ctaTitleLine2')}
        </RevealText>

        {/* 描述 */}
        <SlideReveal className="mb-2xl" direction="up" delay={0.5}>
          <p className="font-body text-base text-ink-300 leading-relaxed max-w-lg mx-auto">
            {t('ctaDesc')}
          </p>
        </SlideReveal>

        <ScaleReveal delay={0.7} scaleFrom={0.9}>
          <RippleButton href="/list/new" variant="primary">
            {t('ctaButton')}
          </RippleButton>
        </ScaleReveal>
      </div>
    </section>
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
        ease: monopoEase,
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
        duration: 1.0,
        ease: monopoEase,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}