'use client';

/**
 * 围物为心 — About 页 /about
 * 产品故事 · 五种算法介绍（KaTeX 公式）· 团队与版权
 * 复用 Card / Sticker，纸面卡片 + 宣纸纹理
 */
import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import katex from 'katex';
import { Card } from '@weiwuweixin/ui';
import { Sticker } from '@weiwuweixin/ui';
import { getAllEngines } from '@weiwuweixin/scoring';

/* ── 动画变体 ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 180,
      damping: 20,
      delay: i * 0.08,
    },
  }),
};

/* ── KaTeX 行内公式渲染 ── */
function KaTeXFormula({ tex, displayMode = true }: { tex: string; displayMode?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return tex;
    }
  }, [tex, displayMode]);

  return (
    <span
      className="katex-wrapper"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   About 页面
   ═══════════════════════════════════════════════════════ */
export default function AboutPage() {
  const t = useTranslations('about');
  const locale = typeof window !== 'undefined'
    ? (window.location.pathname.startsWith('/en') ? 'en' : 'zh')
    : 'zh';

  /* 从 scoring 引擎 take describe() */
  const engines = useMemo(() => getAllEngines(), []);

  /* 算法元信息 — KaTeX 公式与 describe() 描述 */
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

    return engines.map((engine, i) => ({
      id: engine.id,
      name: nameMap[engine.id]?.[locale === 'en' ? 'en' : 'zh'] ?? engine.name,
      desc: engine.describe(locale === 'en' ? 'en' : 'zh'),
      formula: formulaMap[engine.id] ?? '',
      scene: sceneMap[engine.id]?.[locale === 'en' ? 'en' : 'zh'] ?? '',
      accent: (['vermilion', 'celadon', 'apricot', 'indigo', 'vermilion'] as const)[i],
    }));
  }, [engines, locale]);

  return (
    <main className="min-h-screen paper-texture">
      {/* ═══ 产品故事 ═══ */}
      <section className="max-w-3xl mx-auto px-lg py-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        >
          <Card interactive={false} size="lg" className="mb-xl">
            <div className="flex items-center gap-md mb-lg">
              <Sticker size="md" folded={true} rotatable={false}>
                <span className="font-heading text-2xl text-[var(--vermilion)]">心</span>
              </Sticker>
              <h1 className="font-heading text-2xl md:text-3xl text-ink-900">
                {locale === 'en' ? 'Our Story' : '产品故事'}
              </h1>
            </div>

            <p className="font-body text-base md:text-lg text-ink-700 leading-relaxed mb-lg">
              「围物为心」四字取自佛学「围物」之义——万物皆可围而量度，而心是丈量的尺度。
              每个人对事物的主观感受都有独立价值，不应被简单平均抹平。围物为心尊重每位评分者的独特视角，
              以多元算法守护不同声音，让共识从差异中自然浮现。这不是追求客观，
              而是拥抱主观的从容——让每一颗心都留下可信的印记。
            </p>
          </Card>
        </motion.div>
      </section>

      {/* ═══ 五种算法 ═══ */}
      <section className="max-w-4xl mx-auto px-lg pb-3xl">
        <motion.h2
          className="font-heading text-2xl md:text-3xl text-ink-900 mb-xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        >
          {t('algoTitle')}
        </motion.h2>

        <motion.p
          className="font-body text-base text-ink-500 text-center max-w-2xl mx-auto mb-2xl leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('algoDesc')}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {algorithms.map((algo, i) => (
            <motion.div
              key={algo.id}
              custom={i}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
            >
              <Card interactive={false} size="md" className="h-full flex flex-col">
                {/* 算法名 */}
                <h3 className="font-heading text-lg text-ink-900 mb-sm">
                  {algo.name}
                </h3>

                {/* 场景 */}
                <p className="font-body text-sm text-ink-500 leading-relaxed mb-md">
                  💡 {algo.scene}
                </p>

                {/* KaTeX 公式 */}
                <div className="mt-auto pt-sm border-t border-[var(--color-border)]">
                  <div className="bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] px-md py-sm overflow-x-auto">
                    <KaTeXFormula tex={algo.formula} displayMode={true} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 第五个算法可能不满一行，单独居中 */}
      </section>

      {/* ═══ 团队与版权 ═══ */}
      <section className="max-w-3xl mx-auto px-lg pb-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        >
          <Card interactive={false} size="lg" className="text-center">
            <Sticker size="md" folded={true} rotatable={false} className="mx-auto mb-lg">
              <span className="font-heading text-2xl text-[var(--vermilion)]">心</span>
            </Sticker>

            <h2 className="font-heading text-2xl text-ink-900 mb-md">
              {locale === 'en' ? 'Team & Copyright' : '团队与版权'}
            </h2>

            <p className="font-body text-base text-ink-500 leading-relaxed mb-lg">
              {locale === 'en'
                ? 'WeiWuWeiXin is an open-source project built with love. We believe subjective experiences deserve better tools for aggregation and consensus.'
                : '围物为心是一个开源项目，由一群热爱主观体验度量的人共同打造。我们相信，每个人的感受都值得更好的工具来聚合与共识。'}
            </p>

            <div className="text-sm text-ink-300 space-y-xs">
              <p>© 2024 围物为心 WeiWuWeiXin</p>
              <p>MIT License · v0.1.0</p>
            </div>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}