'use client';

import React, { useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import { Button, EmptyState, Slider } from '@weiwuweixin/ui';
import { useListStore } from '@/stores/list-store';
import { ALGORITHM_METAS, CATEGORY_TAGS, createList } from '@/lib/api';
import type { AlgorithmMeta, CreateListInput } from '@/lib/api';
import type { FormStep, FormDimension } from '@/stores/list-store';
import type { ListVisibility } from '@weiwuweixin/shared';
import { VISIBILITY_OPTIONS } from '@weiwuweixin/shared';
import type { Item, Dimension } from '@weiwuweixin/scoring';
import { Link } from '@/i18n/navigation';
import katex from 'katex';
import { useTranslations } from 'next-intl';
import { AlgoRadar } from '@/components/algo-radar';
import { AlgoComparison } from '@/components/algo-comparison';
import { ScoringMatrix } from '@/components/scoring-matrix';
import { useScoringStore } from '@/stores/scoring-store';

/* ============================================================
   新建榜单 — Ranker Studio · Dark Glass Studio
   设计DNA: Linear + Vercel + Apple Design Awards
   动画系统: CharReveal / MagneticGlow / ScanLine / SpringStagger
   ============================================================ */

// ═══════════════════════════════════════════════════════════════
//  Animation Primitives
// ═══════════════════════════════════════════════════════════════

const fadeInUp = {
  hidden: { opacity: 0, y: 32, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

const springUp = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 22, mass: 0.8 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

function CharReveal({ text, className = '', delay = 0.05 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.span className={className} initial="hidden" animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.035, delayChildren: delay } } }}>
      {text.split('').map((ch, i) => (
        <motion.span key={`${ch}-${i}`} className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 60, rotateX: -40, filter: 'blur(8px)' },
            visible: { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)',
              transition: { type: 'spring', stiffness: 120, damping: 14, mass: 0.6 } },
          }}>
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

function ScanLine() {
  return (
    <div className="relative w-full h-px bg-white/[0.05] overflow-hidden">
      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }} />
    </div>
  );
}

function MagneticGlow({ children, className = '', onClick, ...rest }: {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMove}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      {hovered && (
        <>
          <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle 320px at ${pos.x * 100}% ${pos.y * 100}%, rgba(255,255,255,0.03), transparent 60%)`,
            }} />
          <motion.div className="absolute inset-0 pointer-events-none z-0"
            animate={{ opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: `radial-gradient(circle 200px at ${pos.x * 100}% ${pos.y * 100}%, rgba(226,85,63,0.06), transparent 50%)`,
            }} />
        </>
      )}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Shared UI Atoms
// ═══════════════════════════════════════════════════════════════

function StudioInput({ value, onChange, placeholder, maxLength, className = '' }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; maxLength?: number; className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full bg-transparent text-white/90 placeholder:text-white/25 outline-none
        border-b border-white/[0.08] focus:border-white/30 pb-2.5 pt-1
        transition-colors duration-300 text-lg font-heading ${className}`}
    />
  );
}

function PillTag({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border active:scale-95
        ${active
          ? 'bg-white/12 border-white/15 text-white shadow-[0_0_16px_rgba(226,85,63,0.12)]'
          : 'bg-white/[0.02] border-white/[0.05] text-white/45 hover:bg-white/[0.05] hover:border-white/[0.1] hover:text-white/70'}
      `}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════════════════

export default function NewListPage() {
  const store = useListStore();
  const t = useTranslations('newList');
  const router = useRouter();

  const STEPS: { key: FormStep; label: string; num: string }[] = [
    { key: 1, label: t('step1'), num: '01' },
    { key: 2, label: t('step2'), num: '02' },
    { key: 3, label: t('step3'), num: '03' },
    { key: 4, label: t('step4'), num: '04' },
    { key: 5, label: t('step5'), num: '05' },
  ];

  return (
    <div className="min-h-screen bg-[#08080C] text-[#EDEBE5] overflow-x-hidden font-body">
      {/* ── Ambient Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-[15%] w-[700px] h-[700px] rounded-full bg-[#E2553F]/[0.035] blur-[140px]" />
        <div className="absolute -bottom-40 right-[10%] w-[500px] h-[500px] rounded-full bg-[#3B4A8C]/[0.025] blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#08080C]/75 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-xs text-white/45 hover:text-white/80 transition-colors duration-300 tracking-widest uppercase">
            ← 围物为心
          </Link>
          <span className="text-[10px] text-white/30 tracking-[0.25em] uppercase font-medium">
            Ranker Studio
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-6">
        <CharReveal
          text="新建榜单"
          className="block font-heading text-[clamp(2.8rem,6.5vw,5rem)] font-extralight tracking-tight leading-[1.02] text-white/95"
          delay={0.1}
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-4 text-white/30 text-sm tracking-wide font-medium"
        >
          基本 · 条目 · 维度 · 算法
        </motion.p>
      </div>

      {/* ── Step Timeline ── */}
      <nav className="max-w-4xl mx-auto px-6 pb-8">
        <motion.div
          initial="hidden" animate="visible" variants={staggerContainer}
          className="flex items-center gap-2"
        >
          {STEPS.map((step, i) => {
            const isActive = store.currentStep === step.key;
            const isCompleted = store.currentStep > step.key;
            return (
              <React.Fragment key={step.key}>
                {i > 0 && (
                  <motion.div
                    className="flex-1 h-px rounded-full"
                    animate={{
                      background: isCompleted
                        ? 'rgba(226,85,63,0.35)'
                        : 'rgba(255,255,255,0.04)',
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => store.setStep(step.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-400 active:scale-[0.94]
                    ${isActive
                      ? 'bg-white/[0.07] text-white shadow-[0_0_24px_rgba(226,85,63,0.1)]'
                      : isCompleted
                        ? 'bg-white/[0.03] text-white/50'
                        : 'bg-transparent text-white/25'}
                  `}
                >
                  <span className={`font-mono text-[11px] tabular-nums ${isActive ? 'text-[#E2553F]' : isCompleted ? 'text-white/40' : 'text-white/20'}`}>
                    {step.num}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                  {isActive && (
                    <motion.span layoutId="step-dot" className="w-1.5 h-1.5 rounded-full bg-[#E2553F]" />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </motion.div>
      </nav>

      <ScanLine />

      {/* ── Step Content ── */}
      <main className="max-w-4xl mx-auto px-6 py-14">
        <AnimatePresence mode="wait">
          {store.currentStep === 1 && <StepOne key="step1" />}
          {store.currentStep === 2 && <StepTwo key="step2" />}
          {store.currentStep === 3 && <StepThree key="step3" />}
          {store.currentStep === 4 && <StepFour key="step4" />}
          {store.currentStep === 5 && <StepFive key="step5" />}
        </AnimatePresence>

        {/* ── Bottom Nav ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-between items-center mt-14 pt-8"
        >
          {store.currentStep > 1 ? (
            <button type="button"
              onClick={() => store.prevStep()}
              className="px-5 py-2.5 rounded-full text-sm text-white/50 bg-white/[0.02] border border-white/[0.05]
                hover:bg-white/[0.05] hover:text-white/75 hover:border-white/[0.1] transition-all duration-300"
            >
              ← {t('prevStep')}
            </button>
          ) : <div />}

          {store.currentStep < 5 ? (
            <button type="button"
              onClick={() => store.nextStep()}
              className="px-7 py-3 rounded-full text-sm font-medium text-white bg-white/[0.07] border border-white/[0.08]
                hover:bg-white/[0.12] hover:border-white/[0.15] transition-all duration-300
                shadow-[0_0_32px_rgba(226,85,63,0.06)] active:scale-[0.97]"
            >
              {t('nextStep')}
            </button>
          ) : <div />}
        </motion.div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Step 1 — 基本信息
// ═══════════════════════════════════════════════════════════════

function StepOne() {
  const { title, subtitle, tags, visibility, setTitle, setSubtitle, toggleTag, setTags, setVisibility } = useListStore();
  const t = useTranslations('newList.stepOne');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  const customTags = useMemo(() => tags.filter((t) => !CATEGORY_TAGS.includes(t)), [tags]);

  const handleAddCustomTag = useCallback(() => {
    const val = customInput.trim();
    if (!val || tags.includes(val)) return;
    setTags([...tags, val]);
    setCustomInput('');
    setShowCustomInput(false);
  }, [customInput, tags, setTags]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-xl p-8 md:p-10 space-y-10">
        {/* ── 标题 ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <label className="text-xs text-white/70 tracking-widest uppercase font-medium">{t('title')}</label>
            <span className="text-[10px] font-mono text-white/25">{title.length}/30</span>
          </div>
          <StudioInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            maxLength={30}
          />
        </section>

        {/* ── 副标题 ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <label className="text-xs text-white/55 tracking-widest uppercase">{t('subtitle')}</label>
            <span className="text-[10px] font-mono text-white/20">{subtitle.length}/60</span>
          </div>
          <StudioInput
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={t('subtitlePlaceholder')}
            maxLength={60}
            className="!text-base !font-body"
          />
        </section>

        {/* ── 分类标签 ── */}
        <section>
          <label className="text-xs text-white/55 tracking-widest uppercase mb-4 block">{t('categoryTags')}</label>
          <motion.div
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-wrap gap-2"
          >
            {/* 系统预设标签 */}
            {CATEGORY_TAGS.map((tag) => (
              <motion.div key={`sys-${tag}`} variants={springUp}>
                <PillTag active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
                  {tag}
                </PillTag>
              </motion.div>
            ))}

            {/* 已添加的自定义标签 */}
            {customTags.map((tag) => (
              <motion.div key={`custom-${tag}`} variants={springUp}>
                <PillTag active={true} onClick={() => toggleTag(tag)}>
                  {tag}
                  <span className="ml-1 opacity-50 text-[10px]">×</span>
                </PillTag>
              </motion.div>
            ))}

            {/* ── 自定义标签添加 ── */}
            <motion.div variants={springUp} className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {showCustomInput ? (
                  <motion.form
                    key="input"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={(e) => { e.preventDefault(); handleAddCustomTag(); }}
                    className="flex items-center gap-1.5 overflow-hidden"
                  >
                    <input
                      ref={customInputRef}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onBlur={() => { if (!customInput.trim()) setShowCustomInput(false); }}
                      placeholder="输入标签名..."
                      maxLength={12}
                      autoFocus
                      className="w-[120px] bg-transparent border-b border-white/[0.12] text-xs text-white/70
                        placeholder:text-white/20 px-1 py-1.5
                        focus:outline-none focus:border-white/30 focus:text-white/85
                        transition-all duration-300"
                    />
                    <button
                      type="submit"
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                        text-[10px] transition-all duration-300 active:scale-90
                        ${customInput.trim()
                          ? 'bg-[#E2553F]/20 text-[#E2553F] hover:bg-[#E2553F]/30'
                          : 'bg-white/[0.04] text-white/20 cursor-default'}`}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCustomInput(false); setCustomInput(''); }}
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                        text-[10px] text-white/20 hover:text-white/45 transition-colors"
                    >
                      ✕
                    </button>
                  </motion.form>
                ) : (
                  <button
                    key="btn"
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="w-7 h-7 rounded-full flex items-center justify-center
                      text-xs text-white/35 bg-white/[0.03] border border-white/[0.06]
                      hover:bg-white/[0.06] hover:text-white/65 hover:border-white/[0.12]
                      transition-all duration-300 active:scale-[0.92]"
                    title="添加自定义标签"
                  >
                    +
                  </button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* 已有自定义标签计数 */}
          {customTags.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-white/30 mt-2 italic"
            >
              已添加 {customTags.length} 个自定义标签
            </motion.p>
          )}
        </section>

        {/* ── 可见性 ── */}
        <section>
          <label className="text-xs text-white/55 tracking-widest uppercase mb-4 block">{t('visibility')}</label>
          <div className="flex gap-3">
            {VISIBILITY_OPTIONS.map((opt) => {
              const labels: Record<string, string> = {
                PUBLIC: t('visibilityPublic'),
                LINK_ONLY: t('visibilityLinkOnly'),
                PRIVATE: t('visibilityPrivate'),
              };
              const isActive = visibility === opt;
              return (
                <button type="button" key={opt}
                  onClick={() => setVisibility(opt as ListVisibility)}
                  className={`
                    flex-1 max-w-[180px] px-4 py-3 rounded-xl text-xs font-medium transition-all duration-300 border active:scale-95
                    ${isActive
                      ? 'bg-white/[0.06] border-white/[0.1] text-white shadow-[0_0_20px_rgba(226,85,63,0.08)]'
                      : 'bg-white/[0.01] border-white/[0.04] text-white/35 hover:bg-white/[0.03] hover:text-white/55'}
                  `}
                >
                  {labels[opt]}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Step 2 — 添加条目
// ═══════════════════════════════════════════════════════════════

function StepTwo() {
  const { items, addItem, removeItem, updateItem, reorderItems } = useListStore();
  const [bulkText, setBulkText] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const t = useTranslations('newList.stepTwo');

  const handleBulkImport = useCallback(() => {
    const lines = bulkText.split('\n').filter((l) => l.trim());
    lines.forEach((line) => {
      const [name, ...noteParts] = line.split(/[,，|]/);
      addItem(name.trim(), noteParts.join(',').trim());
    });
    setBulkText('');
  }, [bulkText, addItem]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-xl p-8 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs text-white/70 tracking-widest uppercase font-medium">{t('title')}</h2>
          <span className="text-[10px] font-mono text-white/25">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>

        {/* ── Item List ── */}
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-5 select-none"
            >
              ✦
            </motion.div>
            <p className="text-white/25 text-sm">{t('emptyDesc')}</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-2 mb-8">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  variants={springUp}
                  layout
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  draggable
                  onDragStart={(e) => {
                    setDragIdx(i);
                    e.dataTransfer.setData('text/plain', String(i));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => setDragIdx(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
                    if (from !== i) reorderItems(from, i);
                    setDragIdx(null);
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing
                    ${dragIdx === i
                      ? 'border-white/[0.12] bg-white/[0.04] scale-[0.98] shadow-lg'
                      : 'border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] hover:bg-white/[0.025]'}
                  `}
                >
                  <span className="text-white/15 text-sm select-none cursor-grab">⠿</span>
                  <span className="text-[10px] font-mono text-white/25 w-5 tabular-nums">{i + 1}</span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    placeholder={t('namePlaceholder')}
                    className="flex-1 min-w-0 bg-transparent text-white/85 placeholder:text-white/15 outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={item.note}
                    onChange={(e) => updateItem(item.id, { note: e.target.value })}
                    placeholder={t('notePlaceholder')}
                    className="hidden sm:block flex-1 min-w-0 bg-transparent text-white/35 placeholder:text-white/12 outline-none text-xs"
                  />
                  <button type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-white/15 hover:text-[#E2553F] transition-colors text-xs px-1"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Add Button ── */}
        <button type="button"
          onClick={() => addItem()}
          className="px-4 py-2 rounded-full text-xs text-white/55 bg-white/[0.02] border border-white/[0.05]
            hover:bg-white/[0.06] hover:text-white/80 hover:border-white/[0.1] transition-all duration-300 active:scale-[0.96]"
        >
          {t('addItem')}
        </button>
      </div>

      {/* ── Bulk Import ── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="mt-4 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-xl overflow-hidden">
        <details className="group">
          <summary className="px-6 py-3.5 cursor-pointer text-xs text-white/45 hover:text-white/70 transition-colors duration-300 select-none">
            {t('bulkImport')}
          </summary>
          <div className="px-6 pb-5">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={t('bulkImportPlaceholder')}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]
                text-white/80 placeholder:text-white/18 text-sm resize-y outline-none
                focus:border-white/[0.12] transition-colors duration-300"
            />
            <div className="mt-3">
              <Button onClick={handleBulkImport} size="sm" disabled={!bulkText.trim()}>
                {t('importBtn')}
              </Button>
            </div>
          </div>
        </details>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Step 3 — 配置维度
// ═══════════════════════════════════════════════════════════════

function StepThree() {
  const { dimensions, addDimension, removeDimension, updateDimension, reorderDimensions } = useListStore();
  const t = useTranslations('newList.stepThree');
  const SCALE_OPTIONS = [5, 10, 100];
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const totalWeight = useMemo(
    () => dimensions.reduce((sum, d) => sum + d.weight, 0),
    [dimensions],
  );

  const getPct = (w: number) => totalWeight === 0 ? 0 : Math.round((w / totalWeight) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-xl p-8 md:p-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xs text-white/70 tracking-widest uppercase font-medium">{t('title')}</h2>
          <span className="text-[10px] font-mono text-white/25">{dimensions.length} / 6</span>
        </div>

        {/* ── Weight Distribution Bar ── */}
        {dimensions.length > 1 && totalWeight > 0 && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible"
            className="mb-10 p-5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-white/55 tracking-widest uppercase">{t('weightDistribution')}</span>
            </div>
            <div className="flex w-full h-4 rounded-full overflow-hidden bg-white/[0.03]">
              {dimensions.map((dim) => {
                const pct = getPct(dim.weight);
                return (
                  <motion.div key={dim.id}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full relative"
                    style={{
                      background: `linear-gradient(90deg, rgba(226,85,63,${0.4 + pct/200}), rgba(226,85,63,${0.6 + pct/150}))`,
                    }}
                    title={`${dim.name || t('unnamed')}: ${pct}%`}
                  >
                    {pct >= 10 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-white/80">
                        {pct}%
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {dimensions.map((dim) => {
                const pct = getPct(dim.weight);
                return (
                  <span key={dim.id} className="text-[10px] text-white/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm" style={{ background: `rgba(226,85,63,${0.5 + pct/200})` }} />
                    {dim.name || t('unnamed')} {pct}%
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Dimension Cards ── */}
        <div className="space-y-4">
          <AnimatePresence>
            {dimensions.map((dim, i) => {
              const isDragging = dragIndex === i;
              const isOver = overIndex === i && dragIndex !== i;
              const pct = getPct(dim.weight);

              return (
                <motion.div
                  key={dim.id}
                  layout
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  draggable
                  onDragStart={(e) => {
                    setDragIndex(i);
                    e.dataTransfer.setData('text/plain', String(i));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                  onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
                  onDragLeave={() => setOverIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
                    if (!isNaN(from) && from !== i) reorderDimensions(from, i);
                    setDragIndex(null); setOverIndex(null);
                  }}
                  className={`
                    p-5 rounded-xl border transition-all duration-300 cursor-grab active:cursor-grabbing
                    ${isDragging ? 'border-white/[0.15] bg-white/[0.05] scale-[0.97]' : ''}
                    ${isOver ? 'border-[#E2553F]/30 bg-[#E2553F]/[0.03]' : ''}
                    ${!isDragging && !isOver ? 'border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]' : ''}
                  `}
                >
                  {/* ── Header: drag + name + remove ── */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-white/15 text-sm cursor-grab select-none">⠿</span>
                    <span className="text-[10px] font-mono text-white/20 w-4 tabular-nums">{i + 1}</span>
                    <input
                      type="text"
                      value={dim.name}
                      onChange={(e) => updateDimension(dim.id, { name: e.target.value })}
                      placeholder={t('dimensionPlaceholder')}
                      className="flex-1 min-w-0 bg-transparent text-white/80 placeholder:text-white/15 outline-none text-sm
                        border-b border-transparent focus:border-white/[0.08] pb-1 transition-colors"
                    />
                    {dimensions.length > 1 && (
                      <button type="button"
                        onClick={() => removeDimension(dim.id)}
                        className="text-white/15 hover:text-[#E2553F] transition-colors text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* ── Weight Slider ── */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-white/35 tracking-wide">{t('weight')}</span>
                      <span className="text-[10px] font-mono text-white/55">
                        {dim.weight}
                        {dimensions.length > 1 && totalWeight > 0 && (
                          <span className="ml-1.5 text-[#E2553F]/70">→ {pct}%</span>
                        )}
                      </span>
                    </div>
                    <Slider
                      value={dim.weight}
                      min={0} max={100} step={1}
                      onChange={(val) => updateDimension(dim.id, { weight: val })}
                      size="sm"
                      accentColor="#E2553F"
                    />
                  </div>

                  {/* ── Mini bar ── */}
                  <div className="mb-4 h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#E2553F]/60 to-[#E2553F]"
                      style={{ minWidth: dim.weight > 0 ? '4px' : '0px' }}
                    />
                  </div>

                  {/* ── Scale ── */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 mr-2">{t('scale')}</span>
                    {SCALE_OPTIONS.map((scale) => (
                      <motion.button type="button" key={scale}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => updateDimension(dim.id, { scale })}
                        className={`
                          px-2.5 py-1 rounded-md text-[11px] transition-all duration-300
                          ${dim.scale === scale
                            ? 'bg-white/[0.08] text-white'
                            : 'text-white/30 hover:text-white/55 hover:bg-white/[0.03]'}
                        `}
                      >
                        {scale}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Add Dimension ── */}
        {dimensions.length < 6 && (
          <motion.button type="button"
            whileTap={{ scale: 0.96 }}
            onClick={addDimension}
            className="mt-5 px-4 py-2 rounded-full text-xs text-white/55 bg-white/[0.02] border border-white/[0.05]
              hover:bg-white/[0.06] hover:text-white/80 hover:border-white/[0.1] transition-all duration-300"
          >
            {t('addDimension')}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Step 4 — 选择算法
// ═══════════════════════════════════════════════════════════════

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
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs text-white/70 tracking-widest uppercase font-medium">{t('title')}</h2>
          <motion.button type="button"
            onClick={() => setShowComparison(true)}
            className="text-[11px] text-white underline underline-offset-4 decoration-white/[0.1]"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ opacity: 0.65 }}
          >
            {t('needHelp')}
          </motion.button>
        </div>

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
          {algos.map((algo) => (
            <motion.div key={algo.id} variants={springUp}>
              <AlgoCard
                algo={algo}
                selected={algorithmId === algo.id}
                onSelect={() => setAlgorithmId(algo.id as 'weighted-mean' | 'geometric-mean' | 'borda-count' | 'topsis' | 'bayesian-shrinkage')}
              />
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-[11px] text-white/20 italic pt-4">
          {t('radarNote')}
        </p>
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
      return katex.renderToString(algo.formula ?? '', { throwOnError: false, displayMode: true });
    } catch { return ''; }
  }, [algo.formula]);

  const ta = useTranslations('algorithm');
  const algoKey: Record<string, string> = {
    'weighted-mean': 'weightedMean', 'geometric-mean': 'geometricMean',
    'borda-count': 'bordaCount', 'topsis': 'topsis', 'bayesian-shrinkage': 'bayesianShrinkage',
  };
  const descKey: Record<string, string> = {
    'weighted-mean': 'weightedMeanDesc', 'geometric-mean': 'geometricMeanDesc',
    'borda-count': 'bordaCountDesc', 'topsis': 'topsisDesc', 'bayesian-shrinkage': 'bayesianShrinkageDesc',
  };
  const recKey: Record<string, string> = {
    'weighted-mean': 'weightedMeanRec', 'geometric-mean': 'geometricMeanRec',
    'borda-count': 'bordaCountRec', 'topsis': 'topsisRec', 'bayesian-shrinkage': 'bayesianShrinkageRec',
  };

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left cursor-pointer overflow-hidden relative rounded-2xl border p-6 transition-all duration-500
        ${selected
          ? 'border-[#E2553F]/25 bg-[#E2553F]/[0.04] shadow-[0_0_48px_rgba(226,85,63,0.08),inset_0_0_30px_rgba(226,85,63,0.02)]'
          : 'border-white/[0.05] bg-white/[0.012] hover:border-white/[0.08]'}`}
    >
      {/* 选中态朱砂光晕 — 纯视觉层，pointer-events-none 保证不拦截点击 */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-radial-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {selected && (
          <div className="absolute inset-0 bg-[#E2553F]/[0.025] shadow-[inset_0_0_40px_rgba(226,85,63,0.06)]" />
        )}
      </div>
      <div className="flex items-start gap-5 relative z-10">
        {/* ── Radar ── */}
        <div className="flex-shrink-0 mt-1">
          <AlgoRadar algorithmId={algo.id} selected={selected} size={110} />
        </div>

        <div className="flex-1 min-w-0">
          {/* ── Title + Radio ── */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`
              flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
              ${selected ? 'border-[#E2553F] bg-[#E2553F]' : 'border-white/[0.1]'}
            `}>
              {selected && <span className="text-white text-[10px]">✓</span>}
            </div>
            <h3 className={`font-heading text-base transition-colors duration-300 ${selected ? 'text-white' : 'text-white/75'}`}>
              {ta(algoKey[algo.id] || 'weightedMean')}
            </h3>
          </div>

          {/* ── KaTeX Formula ── */}
          {formulaHtml && (
            <div className="mb-3 overflow-x-auto py-1 px-2 -mx-2 rounded-lg bg-white/[0.015]"
              dangerouslySetInnerHTML={{ __html: formulaHtml }}
            />
          )}

          <p className="text-xs text-white/45 mb-3 leading-relaxed">
            {ta(descKey[algo.id] || 'weightedMeanDesc')}
          </p>

          {/* ── Recommendation ── */}
          <p className={`text-[11px] font-medium mb-2.5 ${selected ? 'text-[#E2553F]/80' : 'text-white/35'}`}>
            {ta(recKey[algo.id] || 'weightedMeanRec')}
          </p>

          {/* ── Pros/Cons Tags ── */}
          {(algo.pros ?? []).length > 0 || (algo.cons ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(algo.pros ?? []).map((p) => (
                <span key={p} className="inline-block px-2 py-0.5 text-[10px] rounded-md bg-[#7FB3A3]/[0.08] text-[#7FB3A3]/80">
                  {p}
                </span>
              ))}
              {(algo.cons ?? []).map((c) => (
                <span key={c} className="inline-block px-2 py-0.5 text-[10px] rounded-md bg-[#F4B860]/[0.08] text-[#F4B860]/70">
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Step 5 — 打分评分
// ═══════════════════════════════════════════════════════════════

function StepFive() {
  const { items, dimensions, scores, setScore, isSubmitting } = useListStore();
  const router = useRouter();
  const t = useTranslations('newList.stepFive');

  const handlePublish = useCallback(async () => {
    const state = useListStore.getState();
    state.setIsSubmitting(true);
    try {
      const scale = state.dimensions.length > 0 && state.dimensions[0].scale
        ? (state.dimensions[0].scale === 100 ? '0-100'
          : state.dimensions[0].scale === 10 ? '1-10'
          : '1-5')
        : '1-5';

      const result = await createList({
        title: state.title,
        subtitle: state.subtitle,
        algorithmId: state.algorithmId,
        scale,
        visibility: state.visibility,
        dimensions: state.dimensions.map(d => ({
          name: d.name || `维度${d.id}`,
          weight: d.weight,
          scale: d.scale,
        })),
        items: state.items.map((item, idx) => ({
          name: item.name || `条目${idx + 1}`,
          note: item.note || undefined,
          rank: idx + 1,
        })),
        authorScores: state.scores.length > 0 ? state.scores : undefined,
      });

      state.reset();
      router.push(`/list/${result.id}`);
    } catch (err) {
      state.setIsSubmitting(false);
      console.error('创建榜单失败:', err);
    }
  }, [router]);

  const scaleLabel = (dim: FormDimension) => {
    if (dim.scale === 100) return '0-100';
    if (dim.scale === 10) return '1-10';
    return `1-${dim.scale}`;
  };

  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-xl p-8 md:p-10">
        <h2 className="text-xs text-white/70 tracking-widest uppercase font-medium mb-2">
          {t('title')}
        </h2>
        <p className="text-white/30 text-sm mb-8">{t('guide')}</p>

        {items.length === 0 || dimensions.length === 0 ? (
          <p className="text-white/25 text-sm py-8">{t('noData')}</p>
        ) : (
          <div className="space-y-6">
            <div className="hidden md:grid gap-4 items-end pb-2 border-b border-white/[0.04]"
              style={{ gridTemplateColumns: `minmax(140px,1fr) repeat(${dimensions.length}, 1fr)` }}>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">{t('item')}</span>
              {dimensions.map((dim) => (
                <span key={dim.id} className="text-[10px] text-white/30 text-center uppercase">
                  {dim.name || t('unnamed')} ({scaleLabel(dim)})
                </span>
              ))}
            </div>

            {items.map((item, itemIdx) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: itemIdx * 0.05 }}
                className="md:grid gap-4 items-center py-3 border-b border-white/[0.02] last:border-0"
                style={{ gridTemplateColumns: `minmax(140px,1fr) repeat(${dimensions.length}, 1fr)` }}>
                <div className="mb-2 md:mb-0">
                  <p className="text-sm text-white/80 font-medium truncate">
                    {item.name || t('unnamedItem')}
                  </p>
                  {item.note && (
                    <p className="text-[11px] text-white/30 truncate mt-0.5">{item.note}</p>
                  )}
                </div>

                {dimensions.map((dim, dimIdx) => (
                  <div key={dim.id} className="flex items-center gap-3 mb-1 md:mb-0">
                    <span className="md:hidden text-[10px] text-white/25 w-16 flex-shrink-0 truncate">
                      {dim.name || t('unnamed')}
                    </span>
                    <Slider
                      value={scores[itemIdx]?.[dimIdx] ?? 1}
                      min={1}
                      max={dim.scale || 5}
                      step={1}
                      className="flex-1"
                      onChange={(val) => setScore(itemIdx, dimIdx, val)}
                    />
                    <span className="text-xs font-mono text-white/50 w-7 text-right tabular-nums">
                      {scores[itemIdx]?.[dimIdx] ?? 1}
                    </span>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        )}

        {/* ── 操作按钮 ── */}
        <div className="flex justify-center gap-4 pt-10">
          <motion.button type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => useListStore.getState().prevStep()}
            className="px-6 py-3 rounded-full text-sm text-white/50 bg-white/[0.02] border border-white/[0.05]
              hover:bg-white/[0.05] hover:text-white/75 transition-all duration-300"
          >
            ← {t('back')}
          </motion.button>
          <motion.button type="button"
            whileTap={{ scale: 0.96 }}
            onClick={handlePublish}
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-full text-sm font-semibold text-white
              bg-gradient-to-r from-[#D94A35] to-[#E56550]
              hover:from-[#E56550] hover:to-[#D94A35]
              shadow-[0_0_50px_rgba(217,74,53,0.15)]
              disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-500"
          >
            {isSubmitting ? t('submitting') : t('publish')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Submit Handler
// ═══════════════════════════════════════════════════════════════

async function handleSubmit(
  store: ReturnType<typeof useListStore.getState>,
  router: ReturnType<typeof useRouter>,
) {
  store.setIsSubmitting(true);
  try {
    const scale = store.dimensions.length > 0 && store.dimensions[0].scale
      ? (store.dimensions[0].scale === 100 ? '0-100'
        : store.dimensions[0].scale === 10 ? '1-10'
        : '1-5')
      : '1-5';

    const result = await createList({
      title: store.title,
      subtitle: store.subtitle,
      algorithmId: store.algorithmId,
      scale,
      visibility: store.visibility,
      dimensions: store.dimensions.map(d => ({
        name: d.name || `维度${d.id}`,
        weight: d.weight,
        scale: d.scale,
      })),
      items: store.items.map((item, idx) => ({
        name: item.name || `条目${idx + 1}`,
        note: item.note || undefined,
        rank: idx + 1,
      })),
      authorScores: store.scores.length > 0 ? store.scores : undefined,
    });

    store.reset();
    router.push(`/list/${result.id}`);
  } catch (err) {
    store.setIsSubmitting(false);
    console.error('Failed to create list:', err);
  }
}