'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, EmptyState, Slider, LoadingState, ErrorState } from '@weiwuweixin/ui';
import { useListStore } from '@/stores/list-store';
import { ALGORITHM_METAS, CATEGORY_TAGS } from '@/lib/mock-data';
import type { AlgorithmMeta } from '@/lib/mock-data';
import type { FormStep } from '@/stores/list-store';
import type { ListVisibility } from '@weiwuweixin/shared';
import { VISIBILITY_OPTIONS } from '@weiwuweixin/shared';
import katex from 'katex';
import { useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AlgoRadar } from '@/components/algo-radar';
import { AlgoComparison } from '@/components/algo-comparison';

/* ============================================================
   新建榜单页 — Ranker Studio (i18n)
   ============================================================ */

export default function NewListPage() {
  const store = useListStore();
  const t = useTranslations('newList');

  const STEPS: { key: FormStep; label: string }[] = [
    { key: 1, label: t('step1') },
    { key: 2, label: t('step2') },
    { key: 3, label: t('step3') },
    { key: 4, label: t('step4') },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* ─── 顶部导航 ─── */}
      <header className="sticky top-0 z-sticky bg-paper/80 backdrop-blur-sm border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-lg py-sm flex items-center justify-between">
          <a href="/" className="font-heading text-lg text-ink-900 hover:text-vermilion transition-colors">
            {t('backToHome')}
          </a>
          <h1 className="font-heading text-lg text-ink-700">{t('pageTitle')}</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* ─── 步骤指示器 ─── */}
      <nav className="max-w-3xl mx-auto px-lg py-lg">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const isActive = store.currentStep === step.key;
            const isCompleted = store.currentStep > step.key;
            return (
              <div key={step.key} className="flex items-center">
                {i > 0 && (
                  <div
                    className="hidden md:block w-12 lg:w-24 h-px mx-2"
                    style={{
                      backgroundColor: isCompleted ? 'var(--celadon)' : 'var(--ink-100)',
                    }}
                  />
                )}
                <button
                  onClick={() => store.setStep(step.key)}
                  className={`
                    flex items-center gap-sm px-md py-xs rounded-pill text-sm font-medium transition-all
                    ${isCompleted ? 'step-completed' : isActive ? 'step-active' : 'step-pending'}
                  `}
                >
                  <span className="font-mono">{step.key}</span>
                  <span className="hidden md:inline">{step.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ─── 表单步骤内容 ─── */}
      <main className="max-w-3xl mx-auto px-lg pb-3xl">
        <AnimatePresence mode="wait">
          {store.currentStep === 1 && <StepOne key="step1" />}
          {store.currentStep === 2 && <StepTwo key="step2" />}
          {store.currentStep === 3 && <StepThree key="step3" />}
          {store.currentStep === 4 && <StepFour key="step4" />}
        </AnimatePresence>

        {/* ─── 导航按钮 ─── */}
        <div className="flex justify-between items-center mt-xl pt-lg border-t border-ink-100">
          {store.currentStep > 1 ? (
            <Button onClick={() => store.prevStep()} size="md">
              {t('prevStep')}
            </Button>
          ) : (
            <div />
          )}
          {store.currentStep < 4 ? (
            <Button onClick={() => store.nextStep()} size="md">
              {t('nextStep')}
            </Button>
          ) : (
            <Button onClick={() => handleSubmit(store)} size="md" disabled={store.isSubmitting}>
              {store.isSubmitting ? t('creating') : t('createList')}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   Step 1: 基本信息
   ============================================================ */
function StepOne() {
  const { title, subtitle, tags, visibility, setTitle, setSubtitle, toggleTag, setVisibility } = useListStore();
  const t = useTranslations('newList.stepOne');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card interactive={false} textured size="lg">
        <h2 className="font-heading text-xl text-ink-900 mb-lg">{t('title')}</h2>

        {/* 标题 */}
        <label className="block mb-md">
          <span className="text-sm font-medium text-ink-700 mb-xs block">
            {t('title')} <span className="text-vermilion">{t('titleRequired')}</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            maxLength={30}
            className="w-full px-md py-sm rounded-md border border-ink-100 bg-paper text-ink-900 placeholder:text-ink-300 focus:border-vermilion focus:ring-1 focus:ring-vermilion outline-none transition-colors"
            style={{ fontFamily: 'var(--font-heading)' }}
          />
          <span className="text-xs text-ink-300 mt-3xs block">{title.length}/30</span>
        </label>

        {/* 副标题 */}
        <label className="block mb-md">
          <span className="text-sm font-medium text-ink-700 mb-xs block">{t('subtitle')}</span>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={t('subtitlePlaceholder')}
            maxLength={60}
            className="w-full px-md py-sm rounded-md border border-ink-100 bg-paper text-ink-900 placeholder:text-ink-300 focus:border-vermilion focus:ring-1 focus:ring-vermilion outline-none transition-colors"
          />
          <span className="text-xs text-ink-300 mt-3xs block">{subtitle.length}/60</span>
        </label>

        {/* 分类标签 */}
        <div className="mb-md">
          <span className="text-sm font-medium text-ink-700 mb-xs block">{t('categoryTags')}</span>
          <div className="flex flex-wrap gap-xs">
            {CATEGORY_TAGS.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-sm py-3xs rounded-md text-sm transition-all
                    ${selected
                      ? 'bg-vermilion text-paper'
                      : 'bg-rice text-ink-500 border border-ink-100 hover:bg-ink-100'
                    }
                  `}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 可见性 */}
        <div>
          <span className="text-sm font-medium text-ink-700 mb-xs block">{t('visibility')}</span>
          <div className="flex gap-sm">
            {VISIBILITY_OPTIONS.map((opt) => {
              const labels: Record<string, string> = {
                PUBLIC: t('visibilityPublic'),
                LINK_ONLY: t('visibilityLinkOnly'),
                PRIVATE: t('visibilityPrivate'),
              };
              return (
                <button
                  key={opt}
                  onClick={() => setVisibility(opt as ListVisibility)}
                  className={`
                    px-md py-sm rounded-md text-sm transition-all border
                    ${visibility === opt
                      ? 'border-vermilion bg-vermilion/10 text-ink-900'
                      : 'border-ink-100 bg-rice text-ink-500 hover:bg-ink-100'
                    }
                  `}
                >
                  {labels[opt]}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ============================================================
   Step 2: 添加条目
   ============================================================ */
function StepTwo() {
  const { items, addItem, removeItem, updateItem, reorderItems } = useListStore();
  const [bulkText, setBulkText] = useState('');
  const t = useTranslations('newList.stepTwo');

  function handleBulkImport() {
    const lines = bulkText.split('\n').filter((l) => l.trim());
    lines.forEach((line) => {
      const [name, ...noteParts] = line.split(/[,，|]/);
      addItem(name.trim(), noteParts.join(',').trim());
    });
    setBulkText('');
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e: React.DragEvent, toIndex: number) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex !== toIndex) {
      reorderItems(fromIndex, toIndex);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card interactive={false} textured size="lg">
        <h2 className="font-heading text-xl text-ink-900 mb-lg">{t('title')}</h2>

        {/* 已添加的条目 */}
        {items.length === 0 ? (
          <EmptyState
            scene="list-empty"
            title={t('emptyTitle')} 
            description={t('emptyDesc')} 
            size="sm"
          />
        ) : (
          <div className="space-y-sm mb-lg">
            {items.map((item, i) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, i)}
                className="flex items-center gap-sm px-md py-sm rounded-md border border-ink-100 bg-paper hover:bg-rice transition-colors cursor-grab"
              >
                <span className="text-ink-300 cursor-grab text-sm">⠿</span>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder={t('namePlaceholder')}
                  className="flex-1 bg-transparent outline-none text-ink-900 placeholder:text-ink-300"
                />
                <input
                  type="text"
                  value={item.note}
                  onChange={(e) => updateItem(item.id, { note: e.target.value })}
                  placeholder={t('notePlaceholder')}
                  className="flex-1 bg-transparent outline-none text-ink-500 placeholder:text-ink-300 text-sm"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-ink-300 hover:text-vermilion transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 添加条目按钮 */}
        <div className="flex gap-sm mb-lg">
          <Button onClick={() => addItem()} size="sm">
            {t('addItem')}
          </Button>
        </div>

        {/* 批量导入 */}
        <details className="border border-ink-100 rounded-md overflow-hidden">
          <summary className="px-md py-sm cursor-pointer text-sm font-medium text-ink-700 bg-rice hover:bg-ink-100 transition-colors">
            {t('bulkImport')}
          </summary>
          <div className="p-md">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={t('bulkImportPlaceholder')}
              rows={4}
              className="w-full px-md py-sm rounded-md border border-ink-100 bg-paper text-ink-900 placeholder:text-ink-300 text-sm resize-y outline-none focus:border-vermilion focus:ring-1 focus:ring-vermilion transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <div className="mt-sm">
              <Button onClick={handleBulkImport} size="sm" disabled={!bulkText.trim()}>
                {t('importBtn')}
              </Button>
            </div>
          </div>
        </details>
      </Card>
    </motion.div>
  );
}

/* ============================================================
   Step 3: 配置维度 — 拖拽排序 + 权重可视化
   ============================================================ */
function StepThree() {
  const { dimensions, addDimension, removeDimension, updateDimension, reorderDimensions } = useListStore();
  const t = useTranslations('newList.stepThree');

  const SCALE_OPTIONS = [5, 10, 100];

  /* ── 拖拽排序状态 ── */
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  /* ── 归一化百分比 ── */
  const totalWeight = useMemo(
    () => dimensions.reduce((sum, d) => sum + d.weight, 0),
    [dimensions],
  );

  function getNormalizedPercent(weight: number): number {
    if (totalWeight === 0) return 0;
    return Math.round((weight / totalWeight) * 100);
  }

  /* ── 拖拽处理 ── */
  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '0.5';
  }

  function handleDragEnd(e: React.DragEvent) {
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '1';
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  }

  function handleDragLeave() {
    setOverIndex(null);
  }

  function handleDrop(e: React.DragEvent, toIndex: number) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      reorderDimensions(fromIndex, toIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card interactive={false} textured size="lg">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="font-heading text-xl text-ink-900">{t('title')}</h2>
          <span className="text-sm text-ink-300">
            {dimensions.length} / 6
          </span>
        </div>

        {/* ── 归一化权重总览条 ── */}
        {dimensions.length > 1 && totalWeight > 0 && (
          <div className="mb-lg p-sm rounded-md bg-rice/60">
            <div className="flex items-center gap-xs mb-xs">
              <span className="text-xs font-medium text-ink-500">{t('weightDistribution')}</span>
              <span className="text-xs text-ink-300">{t('normalized')}</span>
            </div>
            <div className="flex w-full h-4 rounded-full overflow-hidden border border-ink-100">
              {dimensions.map((dim) => {
                const pct = getNormalizedPercent(dim.weight);
                return (
                  <motion.div
                    key={dim.id}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full relative group"
                    style={{
                      backgroundColor: dim.weight > 0 ? 'var(--vermilion)' : 'var(--ink-100)',
                      opacity: dim.weight > 0 ? 0.65 + (pct / 100) * 0.35 : 0.3,
                    }}
                    title={`${dim.name || t('unnamed')}: ${pct}%`}
                  >
                    {pct >= 8 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-paper truncate px-1">
                        {pct}%
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-sm mt-xs">
              {dimensions.map((dim) => {
                const pct = getNormalizedPercent(dim.weight);
                return (
                  <span key={dim.id} className="text-xs text-ink-500">
                    <span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ backgroundColor: 'var(--vermilion)', opacity: 0.65 + (pct / 100) * 0.35 }} />
                    {dim.name || t('unnamed')} {pct}%
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 维度卡片列表（可拖拽排序） ── */}
        <div className="space-y-md">
          {dimensions.map((dim, i) => {
            const isDragging = dragIndex === i;
            const isOver = overIndex === i && dragIndex !== i;
            const normalizedPct = getNormalizedPercent(dim.weight);

            return (
              <motion.div
                key={dim.id}
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, i)}
                onDragEnd={(e) => handleDragEnd(e as unknown as React.DragEvent)}
                onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, i)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e as unknown as React.DragEvent, i)}
                className={`
                  p-md rounded-md border bg-paper transition-all cursor-grab active:cursor-grabbing
                  ${isDragging ? 'border-vermilion/50 shadow-md opacity-50 scale-[0.98]' : ''}
                  ${isOver ? 'border-vermilion shadow-sm' : 'border-ink-100'}
                  ${!isDragging && !isOver ? 'hover:border-ink-200' : ''}
                `}
              >
                {/* ── 拖拽手柄 + 维度名称 ── */}
                <div className="flex items-center gap-sm mb-sm">
                  <span
                    className="text-ink-300 hover:text-ink-500 transition-colors cursor-grab active:cursor-grabbing select-none text-lg leading-none"
                    title={t('dragToSort')}
                  >
                    ⠿
                  </span>
                  <input
                    type="text"
                    value={dim.name}
                    onChange={(e) => updateDimension(dim.id, { name: e.target.value })}
                    placeholder={t('dimensionPlaceholder')}
                    className="flex-1 px-sm py-xs rounded-md border border-ink-100 bg-paper text-ink-900 placeholder:text-ink-300 outline-none focus:border-vermilion transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {dimensions.length > 1 && (
                    <button
                      onClick={() => removeDimension(dim.id)}
                      className="text-ink-300 hover:text-vermilion transition-colors text-sm"
                      title={t('removeDimension')}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* ── 权重滑杆 ── */}
                <div className="mb-sm">
                  <div className="flex items-center justify-between mb-xs">
                    <span className="text-xs text-ink-500">{t('weight')}</span>
                    <span className="text-xs font-mono text-ink-700">
                      {dim.weight}
                      {dimensions.length > 1 && totalWeight > 0 && (
                        <span className="ml-1 text-vermilion">
                          → {normalizedPct}%
                        </span>
                      )}
                    </span>
                  </div>
                  <Slider
                    value={dim.weight}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(val) => updateDimension(dim.id, { weight: val })}
                    size="sm"
                    accentColor="var(--vermilion)"
                  />
                </div>

                {/* ── 权重可视化条 ── */}
                <div className="mb-sm h-2 rounded-full bg-ink-100 overflow-hidden">
                  <motion.div
                    animate={{ width: `${normalizedPct}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: 'var(--vermilion)',
                      minWidth: dim.weight > 0 ? '4px' : '0px',
                    }}
                  />
                </div>

                {/* ── 分制选择 ── */}
                <div className="flex items-center gap-xs">
                  <span className="text-xs text-ink-500 mr-sm">{t('scale')}</span>
                  {SCALE_OPTIONS.map((scale) => (
                    <button
                      key={scale}
                      onClick={() => updateDimension(dim.id, { scale })}
                      className={`
                        px-sm py-3xs rounded-md text-xs transition-all
                        ${dim.scale === scale
                          ? 'bg-vermilion text-paper'
                          : 'bg-rice text-ink-500 border border-ink-100 hover:bg-ink-100'
                        }
                      `}
                    >
                      {scale}{t('scaleUnit')}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── 添加维度 ── */}
        {dimensions.length < 6 && (
          <div className="mt-md">
            <Button onClick={addDimension} size="sm">
              {t('addDimension')}
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/* ============================================================
   Step 4: 选择算法
   ============================================================ */
function StepFour() {
  const { algorithmId, setAlgorithmId } = useListStore();
  const algos = useMemo(() => ALGORITHM_METAS, []);
  const [showComparison, setShowComparison] = useState(false);
  const t = useTranslations('newList.stepFour');

  const handleSelectAlgoFromComparison = useCallback((id: string) => {
    setAlgorithmId(id as 'weighted-mean' | 'geometric-mean' | 'borda-count' | 'topsis' | 'bayesian-shrinkage');
  }, [setAlgorithmId]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="space-y-md">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="font-heading text-xl text-ink-900">{t('title')}</h2>
          <button
            onClick={() => setShowComparison(true)}
            className="text-sm hover:opacity-80 transition-colors underline underline-offset-2"
            style={{ color: 'var(--indigo)' }}
          >
            {t('needHelp')}
          </button>
        </div>

        {algos.map((algo) => (
          <AlgoCard
            key={algo.id}
            algo={algo}
            selected={algorithmId === algo.id}
            onSelect={() => setAlgorithmId(algo.id as 'weighted-mean' | 'geometric-mean' | 'borda-count' | 'topsis' | 'bayesian-shrinkage')}
          />
        ))}

        <div className="text-center pt-sm">
          <p className="text-xs text-ink-300 italic">
            {t('radarNote')}
          </p>
        </div>
      </div>

      <AlgoComparison
        open={showComparison}
        onClose={() => setShowComparison(false)}
        onSelectAlgo={handleSelectAlgoFromComparison}
      />
    </motion.div>
  );
}

function AlgoCard({ algo, selected, onSelect }: { algo: AlgorithmMeta; selected: boolean; onSelect: () => void }) {
  const formulaHtml = useMemo(() => {
    try {
      return katex.renderToString(algo.formula, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return `<code>${algo.formula}</code>`;
    }
  }, [algo.formula]);

  const ta = useTranslations('algorithm');

  // Map algorithm id to translation key
  const algoNameKey: Record<string, string> = {
    'weighted-mean': 'weightedMean',
    'geometric-mean': 'geometricMean',
    'borda-count': 'bordaCount',
    'topsis': 'topsis',
    'bayesian-shrinkage': 'bayesianShrinkage',
  };
  const algoDescKey: Record<string, string> = {
    'weighted-mean': 'weightedMeanDesc',
    'geometric-mean': 'geometricMeanDesc',
    'borda-count': 'bordaCountDesc',
    'topsis': 'topsisDesc',
    'bayesian-shrinkage': 'bayesianShrinkageDesc',
  };
  const algoRecKey: Record<string, string> = {
    'weighted-mean': 'weightedMeanRec',
    'geometric-mean': 'geometricMeanRec',
    'borda-count': 'bordaCountRec',
    'topsis': 'topsisRec',
    'bayesian-shrinkage': 'bayesianShrinkageRec',
  };

  return (
    <motion.div
      animate={{
        rotateZ: selected ? 0.5 : 0,
        scale: selected ? 1 : 0.98,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card
        interactive
        textured
        size="md"
        className={`cursor-pointer transition-all duration-200 ${
          selected
            ? 'algo-card-selected'
            : 'hover:shadow-sm'
        }`}
        onClick={onSelect}
        style={selected ? { boxShadow: '0 0 0 2px var(--vermilion)' } : undefined}
      >
        <div className="flex items-start gap-md">
          {/* 雷达图 */}
          <div className="flex-shrink-0 mt-xs">
            <AlgoRadar algorithmId={algo.id} selected={selected} size={120} />
          </div>

          <div className="flex-1 min-w-0">
            {/* 标题 + 选中指示 */}
            <div className="flex items-center gap-sm mb-xs">
              <div
                className={`
                  flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${selected ? 'border-vermilion bg-vermilion' : 'border-ink-300 bg-paper'}
                `}
              >
                {selected && <span className="text-paper text-xs">✓</span>}
              </div>
              <h3 className="font-heading text-lg text-ink-900">
                {ta(algoNameKey[algo.id] || 'weightedMean')}
              </h3>
            </div>

            {/* KaTeX 公式 */}
            <div
              className="mb-sm overflow-x-auto text-sm"
              dangerouslySetInnerHTML={{ __html: formulaHtml }}
            />

            <p className="text-sm text-ink-500 mb-sm">{ta(algoDescKey[algo.id] || 'weightedMeanDesc')}</p>

            {/* 推荐 */}
            <p className={`text-xs font-medium mb-xs ${selected ? 'text-vermilion' : 'text-celadon-dark'}`}>
              💡 {ta(algoRecKey[algo.id] || 'weightedMeanRec')}
            </p>

            {/* 优缺点标签 */}
            <div className="flex flex-wrap gap-xs mt-xs">
              {algo.pros.map((p) => (
                <span key={p} className="inline-block px-sm py-3xs text-xs rounded-md bg-celadon/10 text-celadon-dark">
                  ✓ {p}
                </span>
              ))}
              {algo.cons.map((c) => (
                <span key={c} className="inline-block px-sm py-3xs text-xs rounded-md bg-apricot/10 text-apricot-dark">
                  △ {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ============================================================
   提交处理
   ============================================================ */
async function handleSubmit(store: ReturnType<typeof useListStore.getState>) {
  store.setIsSubmitting(true);
  setTimeout(() => {
    store.setIsSubmitting(false);
    window.location.href = '/';
  }, 1500);
}