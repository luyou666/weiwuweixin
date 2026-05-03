'use client';

/**
 * 围物为心 — About 页 /about
 * Monopo London Press 风格 v2 — 7层高级动画系统
 * 
 * 动画层:
 *   1. CharReveal — 巨型标题逐字揭示 (staggerChildren + 3D rotateX)
 *   2. Mouse Parallax — Hero 标题微弱鼠标跟随视差
 *   3. Scroll-Driven — useScroll/useTransform 连续滚动驱动
 *   4. Card 3D Tilt — perspective + 鼠标 rotateX/Y (monopo PressSeries 模式)
 *   5. AnimatedCounter — 算法编号递增动画
 *   6. Spring Micro — 卡片 hover + 链接弹簧反馈
 *   7. Grain Animation — 噪点漂移 + 底部渐变
 */
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion';
import katex from 'katex';
import { getAllEngines } from '@weiwuweixin/scoring';

/* ═══════════════════════════════════════════════════════
   🎬 缓动常量 — Monopo DNA (来自 monopo.london CSS 提取)
   ═══════════════════════════════════════════════════════ */
const monopoEase = [0.165, 0.84, 0.44, 1] as const;        // 主力: 93% 使用率
const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const;           // 幕布揭幕
const EASE_EXPO = [0.77, 0, 0.175, 1] as const;             // 导航/展开
const EASE_FAST_EXIT = [0.895, 0.03, 0.685, 0.22] as const; // 快速离场

/* ═══════════════════════════════════════════════════════
   🔤 Layer 1: CharReveal — 逐字揭示 (3D rotateX)
   ═══════════════════════════════════════════════════════ */
function CharReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.03,
  rotateX = 40,
}: {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  rotateX?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const chars = text.split('');

  return (
    <div ref={ref} className={`flex flex-wrap ${className || ''}`} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ y: '120%', opacity: 0, rotateX }}
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

/* ═══════════════════════════════════════════════════════
   🖱️ Layer 2: Mouse Parallax — Hero 鼠标跟随
   ═══════════════════════════════════════════════════════ */
function useMouseParallax(intensity = 16) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(my, { stiffness: 60, damping: 20, mass: 0.5 });
  const x = useTransform(springX, [-0.5, 0.5], [-intensity, intensity]);
  const y = useTransform(springY, [-0.5, 0.5], [-intensity, intensity]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mx.set(0); my.set(0); };

  return { x, y, handleMouseMove, handleMouseLeave };
}

/* ═══════════════════════════════════════════════════════
   🎴 Layer 4: Card 3D Tilt — perspective + rotateX/Y
   ═══════════════════════════════════════════════════════ */
function Card3DTilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springRx = useSpring(rx, { stiffness: 180, damping: 18 });
  const springRy = useSpring(ry, { stiffness: 180, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(cx * 4);
    rx.set(-cy * 4);
  };
  const handleMouseLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ perspective: 800, transformStyle: 'preserve-3d' } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX: springRx, rotateY: springRy, transformStyle: 'preserve-3d' as React.CSSProperties }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   🔢 Layer 5: AnimatedCounter — 数字递增
   ═══════════════════════════════════════════════════════ */
function AnimatedCounter({
  target,
  delay = 0,
  duration = 1.5,
}: {
  target: number;
  delay?: number;
  duration?: number;
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
      if (elapsed < 0) { raf = requestAnimationFrame(animate); return; }
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target, duration, delay]);

  return <span ref={ref}>{String(count).padStart(2, '0')}</span>;
}

/* ═══════════════════════════════════════════════════════
   📐 KaTeX 公式渲染
   ═══════════════════════════════════════════════════════ */
function KaTeXFormula({ tex, displayMode = true }: { tex: string; displayMode?: boolean }) {
  const html = useMemo(() => {
    try { return katex.renderToString(tex, { displayMode, throwOnError: false, strict: false }); }
    catch { return tex; }
  }, [tex, displayMode]);
  return <span className="katex-wrapper" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ═══════════════════════════════════════════════════════
   📄 About Page — Monopo Press v2 · 7-Layer Animation System
   ═══════════════════════════════════════════════════════ */
export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();

  const engines = useMemo(() => getAllEngines(), []);

  const algorithms = useMemo(() => {
    const formulaMap: Record<string, string> = {
      'weighted-mean': '\\text{Score} = \\frac{\\sum_{i} w_i \\cdot D_i}{\\sum_{i} w_i}',
      'geometric-mean': '\\text{Score} = \\left(\\prod_{i} s_i^{w_i}\\right)^{1/\\sum w_i}',
      'borda-count': '\\text{Score} = \\sum_{i} \\text{rank}_i \\times w_i',
      'topsis': 'C_i = \\frac{d_i^-}{d_i^+ + d_i^-}',
      'bayesian-shrinkage': '\\hat{S} = \\frac{n}{n+m}\\bar{S} + \\frac{m}{n+m}\\mu',
    };
    const nameMap: Record<string, { zh: string; en: string }> = {
      'weighted-mean': { zh: '加权平均', en: 'Weighted Mean' },
      'geometric-mean': { zh: '几何平均', en: 'Geometric Mean' },
      'borda-count': { zh: 'Borda 排位分', en: 'Borda Count' },
      'topsis': { zh: 'TOPSIS 理想解', en: 'TOPSIS Ideal Solution' },
      'bayesian-shrinkage': { zh: '贝叶斯收缩', en: 'Bayesian Shrinkage' },
    };
    const sceneMap: Record<string, { zh: string; en: string }> = {
      'weighted-mean': { zh: '适合各维度独立贡献、互不牵制的场景', en: 'Best for independent dimension contributions' },
      'geometric-mean': { zh: '适合需要惩罚短板、强调均衡的场景', en: 'Best for penalizing weaknesses and emphasizing balance' },
      'borda-count': { zh: '适合只关心相对排名、不需要绝对分数的场景', en: 'Best when only relative rankings matter' },
      'topsis': { zh: '适合多维度综合比较、需要兼顾全局优化的场景', en: 'Best for multi-criteria global optimization' },
      'bayesian-shrinkage': { zh: '适合评分人数不一、需要公平比较的场景', en: 'Best for fair comparison with varying sample sizes' },
    };
    return engines.map((engine) => ({
      id: engine.id,
      name: nameMap[engine.id]?.[locale === 'en' ? 'en' : 'zh'] ?? engine.name,
      desc: engine.describe(locale === 'en' ? 'en' : 'zh'),
      formula: formulaMap[engine.id] ?? '',
      scene: sceneMap[engine.id]?.[locale === 'en' ? 'en' : 'zh'] ?? '',
    }));
  }, [engines, locale]);

  /* ── 页面上层 scroll progress 驱动 ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

  /* Layer 2: Hero 鼠标视差 */
  const heroParallax = useMouseParallax(20);

  /* Layer 7: grain overlay scroll-driven opacity */
  const grainOpacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.35, 0.55, 0.55, 0.25]);
  const springGrainOpacity = useSpring(grainOpacity, { stiffness: 40, damping: 20 });

  return (
    <main
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#0A0A14', color: '#F5F0E8' }}
    >
      {/* ═══════════════════════════════════════════════════════
         Layer 7: Grain Texture — 噪点 + scroll-driven opacity
         ═══════════════════════════════════════════════════════ */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 grain-shift"
        style={{
          opacity: springGrainOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══════════════════════════════════════════════════════
         HERO — Layer 1 + 2: CharReveal + Mouse Parallax
         ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-[6vw] pt-[16vh] pb-[8vh] md:pt-[24vh] md:pb-[12vh]">
        {/* Number label */}
        <motion.div
          className="flex items-baseline gap-4 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: monopoEase, delay: 0.2 }}
        >
          <span
            className="font-mono text-[10px] tracking-[0.35em] uppercase"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            {t('sectionStoryNumber')}
          </span>
          <span className="w-16 h-[1px]" style={{ backgroundColor: 'rgba(245,240,232,0.15)' }} />
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(245,240,232,0.5)' }}
          >
            {t('heroLabel')}
          </span>
        </motion.div>

        {/* Layer 1: CharReveal H1 + Layer 2: Mouse Parallax */}
        <motion.div
          className="mb-6"
          onMouseMove={heroParallax.handleMouseMove}
          onMouseLeave={heroParallax.handleMouseLeave}
        >
          <motion.div style={{ x: heroParallax.x, y: heroParallax.y }}>
            <div
              className="flex flex-wrap"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(52px, 10vw, 140px)',
                fontWeight: 400,
                color: '#F5F0E8',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
              }}
            >
              <CharReveal
                text={t('storyTitle')}
                staggerDelay={0.04}
                delay={0.4}
                rotateX={30}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Description — fade in */}
        <motion.p
          className="font-body text-base md:text-lg leading-relaxed max-w-2xl"
          style={{ color: 'rgba(245,240,232,0.55)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: monopoEase, delay: 1.2 }}
        >
          {t('storyText')}
        </motion.p>
      </section>

      {/* ═══════════════════════════════════════════════════════
         ALGORITHMS — Layer 3/4/5/6: Scroll + 3D Tilt + Counter + Spring
         ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-[6vw] pb-[16vh]">
        {/* Section header */}
        <motion.div
          className="flex items-baseline gap-4 mb-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: monopoEase }}
        >
          <span
            className="font-mono text-[10px] tracking-[0.35em] uppercase"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            {t('sectionAlgoNumber')}
          </span>
          <span className="w-16 h-[1px]" style={{ backgroundColor: 'rgba(245,240,232,0.15)' }} />
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(245,240,232,0.5)' }}
          >
            ALGORITHMS
          </span>
        </motion.div>

        {/* Layer 1: CharReveal H2 */}
        <div
          className="mb-3 max-w-2xl"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(32px, 6vw, 72px)',
            fontWeight: 400,
            color: '#F5F0E8',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
          }}
        >
          <CharReveal
            text={t('algoTitle')}
            staggerDelay={0.03}
            delay={0.1}
            rotateX={25}
          />
        </div>

        <motion.p
          className="font-body text-sm md:text-base leading-relaxed max-w-xl mb-10"
          style={{ color: 'rgba(245,240,232,0.4)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: monopoEase, delay: 0.3 }}
        >
          {t('algoDesc')}
        </motion.p>

        {/* Layer 3 + 4: Scroll-driven + 3D Tilt card grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {algorithms.map((algo, i) => {
            const layouts = [
              'col-span-12 md:col-span-7 md:col-start-1',
              'col-span-12 md:col-span-5 md:col-start-8 md:mt-[8vh]',
              'col-span-12 md:col-span-6 md:col-start-1',
              'col-span-12 md:col-span-6 md:col-start-6 md:mt-[-4vh]',
              'col-span-12 md:col-span-8 md:col-start-3 md:mt-[6vh]',
            ];

            return (
              <motion.div
                key={algo.id}
                className={layouts[i]}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: monopoEase, delay: i * 0.1 }}
              >
                {/* Layer 4: 3D Tilt wrapper */}
                <Card3DTilt>
                  {/* Layer 6: Spring hover scale */}
                  <motion.div
                    className="p-6 md:p-8 h-full flex flex-col cursor-default"
                    style={{
                      backgroundColor: '#1A1A24',
                      borderRadius: 0,
                      border: 'none',
                      boxShadow: 'none',
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* Layer 5: Animated counter */}
                    <span
                      className="font-mono text-[22px] font-light mb-4 block"
                      style={{ color: 'rgba(245,240,232,0.08)' }}
                    >
                      <AnimatedCounter target={i + 1} delay={i * 0.1} duration={1.2} />
                    </span>

                    <h3
                      className="font-heading text-xl md:text-2xl mb-2"
                      style={{ color: '#F5F0E8', fontWeight: 400 }}
                    >
                      {algo.name}
                    </h3>

                    <p
                      className="font-body text-sm leading-relaxed mb-auto"
                      style={{ color: 'rgba(245,240,232,0.35)' }}
                    >
                      <span
                        className="font-mono text-[10px] tracking-[0.25em] uppercase mr-2"
                        style={{ color: 'rgba(245,240,232,0.2)' }}
                      >
                        {t('algoSceneLabel')}
                      </span>
                      {algo.scene}
                    </p>

                    <div
                      className="mt-4 p-4 overflow-x-auto"
                      style={{ backgroundColor: '#0A0A14' }}
                    >
                      <KaTeXFormula tex={algo.formula} displayMode={true} />
                    </div>
                  </motion.div>
                </Card3DTilt>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         TEAM & CONTACT — Layer 3 + 6: Scroll parallax + Spring hover
         ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-[6vw] pb-[12vh]">
        <motion.div
          className="flex items-baseline gap-4 mb-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: monopoEase }}
        >
          <span
            className="font-mono text-[10px] tracking-[0.35em] uppercase"
            style={{ color: 'rgba(245,240,232,0.3)' }}
          >
            {t('sectionTeamNumber')}
          </span>
          <span className="w-16 h-[1px]" style={{ backgroundColor: 'rgba(245,240,232,0.15)' }} />
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(245,240,232,0.5)' }}
          >
            TEAM
          </span>
        </motion.div>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          {/* Left: Team — Layer 3 scroll parallax */}
          <ScrollParallaxSection speed={0.15} className="col-span-12 md:col-span-7">
            <h2
              className="font-heading leading-[0.95] tracking-[-0.03em] mb-4"
              style={{
                fontSize: 'clamp(28px, 5vw, 60px)',
                fontWeight: 400,
                color: '#F5F0E8',
              }}
            >
              {t('teamTitle')}
            </h2>
            <p
              className="font-body text-sm md:text-base leading-relaxed max-w-xl mb-6"
              style={{ color: 'rgba(245,240,232,0.45)' }}
            >
              {t('teamDesc')}
            </p>
            <div
              className="font-mono text-[11px] tracking-[0.2em] space-y-1"
              style={{ color: 'rgba(245,240,232,0.25)' }}
            >
              <p>{t('copyright')}</p>
              <p>{t('license')}</p>
            </div>
          </ScrollParallaxSection>


        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         Layer 7: Bottom fade gradient (scroll-driven opacity)
         ═══════════════════════════════════════════════════════ */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-[20vh] pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to top, #0A0A14 0%, transparent 100%)',
          opacity: useTransform(scrollYProgress, [0.85, 1], [0, 1]),
        }}
      />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════
   🔧 Layer 3 helper: Scroll Parallax Section
   ═══════════════════════════════════════════════════════ */
function ScrollParallaxSection({
  children,
  speed = 0.15,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  const springY = useSpring(y, { stiffness: 50, damping: 25 });

  return (
    <motion.div ref={ref} style={{ y: springY }} className={className}>
      {children}
    </motion.div>
  );
}
