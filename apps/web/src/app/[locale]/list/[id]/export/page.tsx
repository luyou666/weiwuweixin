/* ============================================================
   围物为心 — 导出分享卡 · Dark Glass Studio v3
   /list/[id]/export
   13 数据矩阵模板 · 头图上传 · 比例选择器 · 条目数量 · 色调引擎
   ============================================================ */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareCard, getTemplateList } from '@weiwuweixin/ui';
import type { CardTemplateId, CardOrientation, ShareCardData, ShareCardEntry } from '@weiwuweixin/ui';
import { StampAnimation } from '@/components/stamp-animation';
import { fetchListById } from '@/lib/api';
import type { ListDetail } from '@/lib/api';
/* ---------- 常量 ---------- */

const ALGORITHM_LABELS: Record<string, string> = {
  'weighted-mean': 'W. MEAN',
  'geometric-mean': 'GEO MEAN',
  'borda-count': 'BORDA',
  'topsis': 'TOPSIS',
  'bayesian-shrinkage': 'BAYESIAN',
};
function formatAlgorithm(id?: string): string {
  if (!id) return 'W. MEAN';
  return ALGORITHM_LABELS[id] || id.toUpperCase().replace(/-/g, ' ');
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const ASPECT_RATIOS: Record<string, { w: number; h: number; label: string }> = {
  '9:16': { w: 1080, h: 1920, label: '📱 竖版 9:16' },
  '16:9': { w: 1200, h: 675, label: '🖥 横版 16:9' },
  '1:1': { w: 1080, h: 1080, label: '⬛ 方图 1:1' },
  auto: { w: 0, h: 0, label: '🔄 自动适配' },
  custom: { w: 0, h: 0, label: '⚙ 自定义' },
};

const TEMPLATE_META: Record<string, { label: string; labelEn: string }> = {
  'rice-ink': { label: '宣纸水墨', labelEn: 'RICE INK' },
  morandi: { label: '莫兰迪', labelEn: 'MORANDI' },
  'cyber-neon': { label: '赛博霓虹', labelEn: 'CYBER NEON' },
  'retro-magazine': { label: '复古杂志', labelEn: 'RETRO MAG' },
  'minimal-white': { label: '极简留白', labelEn: 'MINIMAL' },
  'sticker-journal': { label: '手账贴纸', labelEn: 'STICKER' },
  'glass-morphism': { label: '毛玻璃', labelEn: 'GLASS' },
  brutalist: { label: '野兽派', labelEn: 'BRUTALIST' },
  'paper-fold': { label: '折纸手账', labelEn: 'PAPER FOLD' },
  'cosmic-dust': { label: '宇宙星尘', labelEn: 'COSMIC' },
  vaporwave: { label: '蒸汽波', labelEn: 'VAPORWAVE' },
  'grid-poster': { label: '网格海报', labelEn: 'GRID POSTER' },
  'data-tableau': { label: '数据矩阵', labelEn: 'DATA TABLEAU' },
};

const PREVIEW = {
  '9:16': { containerW: 280, cardW: 1080, cardH: 1920 },
  '16:9': { containerW: 520, cardW: 1200, cardH: 675 },
  '1:1': { containerW: 320, cardW: 1080, cardH: 1080 },
  auto: { containerW: 280, cardW: 1080, cardH: 1920 },
  custom: { containerW: 400, cardW: 1080, cardH: 1920 },
} as const;

/* ---------- 动画变体 ---------- */

const fadeInUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

/* ============================================================
   子组件
   ============================================================ */

function ThinRule() {
  return <div className="w-full h-px bg-white/[0.06]" />;
}

function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-medium"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      {children}
    </span>
  );
}

function CollapsibleSection({ title, defaultOpen = true, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-left group">
        <MicroLabel>{title}</MicroLabel>
        <span className="text-white/25 text-xs transition-transform duration-200"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          ▼
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden">
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   主页面
   ============================================================ */

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [listData, setListData] = useState<ListDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchListById(listId).then(setListData).catch(console.error).finally(() => setIsLoading(false));
  }, [listId]);

  // 多维榜单默认选中 data-tableau 模板
  useEffect(() => {
    if (!listData || templateDefaultRef.current) return;
    if (listData.dimensions.length >= 2) {
      setTemplate('data-tableau');
    }
    templateDefaultRef.current = true;
  }, [listData]);

  const templates = useMemo(() => getTemplateList(), []);
  const [template, setTemplate] = useState<CardTemplateId>('rice-ink');
  const templateDefaultRef = useRef(false);
  const [ratioKey, setRatioKey] = useState('9:16');
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1920);
  const [entryCount, setEntryCount] = useState(5);
  const [accentHue, setAccentHue] = useState(0);
  const [fontScale, setFontScale] = useState(1); // 字号缩放 0.5~2.0
  const [activePreset, setActivePreset] = useState<string | null>(null); // 当前激活的预设按钮
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const cardExportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画布缩放平移 — 内联状态
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState(0.3);
  const [zoomX, setZoomX] = useState(0);
  const [zoomY, setZoomY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleZoomTo = useCallback((targetScale: number) => {
    setZoomScale(Math.min(5, Math.max(0.05, targetScale)));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (mx < 0 || my < 0 || mx > rect.width || my > rect.height) return;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setZoomScale(prev => Math.min(5, Math.max(0.05, prev * factor)));
  }, []);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isPanningRef.current = true;
    setIsPanning(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      setZoomX(prev => prev + e.clientX - lastPosRef.current.x);
      setZoomY(prev => prev + e.clientY - lastPosRef.current.y);
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isPanningRef.current = false; setIsPanning(false); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const orientation: CardOrientation = ratioKey === '16:9' ? 'landscape' : 'portrait';

  const cardSize = useMemo(() => {
    if (ratioKey === 'custom') return { w: customW, h: customH };
    if (ratioKey === 'auto') {
      const n = entryCount;
      if (n <= 3) return { w: 1080, h: 1080 };
      if (n <= 7) return { w: 1080, h: 1920 };
      return { w: 1080, h: Math.min(4000, 400 + n * 120) };
    }
    return ASPECT_RATIOS[ratioKey];
  }, [ratioKey, customW, customH, entryCount]);

  const cardData: ShareCardData = useMemo(() => {
    if (!listData) {
      return { title: '—', subtitle: '', entries: [], author: { nickname: '' }, listUrl: '', watermark: '心' };
    }
    const items = listData.items.slice(0, entryCount);

    // 解析分制
    const scaleStr = listData.scale || '1-10';
    const maxScore = parseInt(scaleStr.split('-')[1] || '10', 10) || 10;

    const entries: ShareCardEntry[] = items.map((item, i) => {
      const weightSum = listData.dimensions.reduce((s, d) => s + d.weight, 0) || 1;
      let total = 0;

      // 构建维度得分明细
      const dimensionScores = listData.dimensions.map((dim) => {
        const score = item.authorScores.find((s: any) => s.dimensionId === dim.id);
        const val = score?.value ?? 0;
        total += val * dim.weight;
        return {
          name: dim.name,
          weight: dim.weight,
          score: Math.round(val * 10) / 10,
          maxScore,
        };
      });

      return {
        rank: item.rank || i + 1,
        name: item.name,
        score: String(Math.round((total / weightSum) * 10) / 10),
        note: item.note ?? '',
        dimensionScores,
      };
    });

    // 构建维度定义
    const dimensions = listData.dimensions.map(d => ({
      name: d.name,
      weight: d.weight,
    }));

    return {
      title: listData.title,
      subtitle: listData.subtitle,
      entries,
      dimensions,
      author: { nickname: listData.author.nickname },
      listUrl: `https://weiwuweixin.app/list/${listId}`,
      algorithmId: listData.algorithmId,
      scale: listData.scale,
      watermark: '心',
      coverUrl: coverPreview || undefined,
    };
  }, [listData, listId, entryCount, coverPreview]);

  const previewCfg = PREVIEW[ratioKey as keyof typeof PREVIEW] || PREVIEW['9:16'];
  const scale = previewCfg.containerW / previewCfg.cardW;
  const containerH = Math.round(previewCfg.cardH * scale);

  const handleCoverUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleCoverUrl = useCallback(() => {
    if (coverUrl.trim()) setCoverPreview(coverUrl.trim());
  }, [coverUrl]);

  const handleRemoveCover = useCallback(() => {
    setCoverUrl(''); setCoverPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleExport = useCallback(async (format: 'png' | 'svg') => {
    if (!cardExportRef.current) return;
    setIsExporting(true);
    try {
      const mod = await import('@/lib/export-card');
      const result = await mod.exportCard({
        element: cardExportRef.current, template, orientation, data: cardData, scale: 1, format,
        customSize: ratioKey === 'auto' || ratioKey === 'custom' ? cardSize : undefined,
      });
      const filename = mod.generateFilename(cardData.title, template, orientation, format);
      mod.downloadBlob(result.data as ArrayBuffer | string, filename, result.mimeType);
      setShowStamp(true);
    } catch (err) {
      console.error('[Export] Failed:', err);
      alert('导出失败，请重试。');
    } finally {
      setIsExporting(false);
    }
  }, [template, orientation, cardData, ratioKey, cardSize]);

  return (
    <div className="h-dvh flex flex-col overflow-hidden"
      style={{ backgroundColor: '#0A0A0E', fontFamily: "'Inter', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif", color: '#FFFFFF' }}>

      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
        style={{ backgroundColor: 'rgba(10,10,14,0.85)', backdropFilter: 'blur(16px)' }}>
        <button type="button" onClick={() => router.back()}
          className="text-[12px] tracking-[0.15em] text-white/45 hover:text-white transition-colors uppercase">
          ← 返回
        </button>
        <MicroLabel>导出分享卡 · EXPORT CARD</MicroLabel>
        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col lg:flex-row lg:min-h-0">
        {/* 左侧预览区 — 交互式画布 */}
        <div className="flex-1 flex flex-col relative min-h-[50vh] lg:min-h-0 min-h-0 overflow-hidden"
          style={{ backgroundColor: '#06060A' }}>
          {/* 装饰背景 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
          </div>

          {/* 画布缩放控件 */}
          {!isLoading && (
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5"
              style={{
                background: 'rgba(10,10,14,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '4px',
              }}>
              <button type="button" onClick={() => handleZoomTo(zoomScale / 1.3)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/[0.08] transition-all text-sm font-mono"
                title="缩小">−</button>
              <button type="button" onClick={() => handleZoomTo(0.3)}
                className="px-2 h-8 flex items-center justify-center rounded-md text-[11px] text-white/45 hover:text-white hover:bg-white/[0.06] transition-all font-mono tracking-wider"
                title="重置">
                {Math.round(zoomScale * 100)}%
              </button>
              <button type="button" onClick={() => handleZoomTo(zoomScale * 1.3)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/[0.08] transition-all text-sm font-mono"
                title="放大">+</button>
            </div>
          )}

          {/* 画布容器 — 响应式占满 */}
          <div ref={canvasContainerRef}
            className="flex-1 relative"
            style={{
              overflow: 'hidden',
              cursor: isPanning ? 'grabbing' : 'grab',
              userSelect: 'none',
            }}
            onMouseDown={handleCanvasMouseDown}>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 2, repeat: Infinity }}
                  className="text-[10px] tracking-[0.3em] uppercase text-white/20">LOADING...</motion.div>
              </div>
            )}

            {!isLoading && cardData.entries.length > 0 && (
              <div
                key={`${template}-${ratioKey}-${entryCount}`}
                className="wwx-card-zoom-container"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <div
                  style={{
                    position: 'relative',
                    width: `${previewCfg.cardW}px`,
                    height: `${previewCfg.cardH}px`,
                    transform: `translate(${zoomX}px, ${zoomY}px) scale(${zoomScale})`,
                    transformOrigin: 'center center',
                    boxShadow: '0 0 60px rgba(99,102,241,0.08), 0 0 1px rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    transition: 'transform 0.06s ease-out',
                  }}>
                  <ShareCard
                    template={template}
                    orientation={orientation}
                    data={cardData}
                    accentHue={accentHue}
                    fontSizeScale={fontScale}
                    width={previewCfg.cardW}
                    height={previewCfg.cardH}
                  />
                </div>
              </div>
            )}

            {!isLoading && cardData.entries.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/20 text-sm">暂无数据</p>
              </div>
            )}
          </div>

          {/* 预览信息栏 */}
          {!isLoading && (
            <div className="flex-shrink-0 py-3 text-center flex items-center justify-center gap-3 border-t border-white/[0.05]"
              style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <span className="text-[10px] text-white/30 uppercase tracking-[0.15em]">
                {TEMPLATE_META[template]?.labelEn ?? ''}</span>
              <span className="text-white/[0.08] text-[10px]">|</span>
              <span className="text-[10px] text-white/25">{cardSize.w}×{cardSize.h}px</span>
              {listData && (
                <>
                  <span className="text-white/[0.08] text-[10px]">|</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.1em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatAlgorithm(listData.algorithmId)} · {listData.scale}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 右侧控制面板 */}
        <div data-lenis-prevent className="lg:w-[440px] flex flex-col gap-0 px-6 py-8 lg:py-10 lg:px-8 border-t lg:border-t-0 lg:border-l border-white/[0.05] overflow-y-auto max-h-[45vh] lg:max-h-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>

          <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-5">
            <motion.div variants={fadeInUp}><MicroLabel>榜单信息</MicroLabel></motion.div>
            <motion.h2 variants={fadeInUp} className="text-[19px] font-semibold text-white mt-2 leading-tight tracking-tight">
              {cardData.title}</motion.h2>
            {listData && (
              <motion.div variants={fadeInUp} className="flex items-center gap-3 mt-2">
                <span className="text-[11px] text-white/30">{listData.author.nickname}</span>
                <span className="w-px h-3 bg-white/[0.08]" />
                <span className="text-[11px] text-white/30">{listData.items.length} 条目</span>
              </motion.div>
            )}
          </motion.div>

          <ThinRule />

          {/* 模板画廊 */}
          <div className="py-4">
            <CollapsibleSection title="🎨 模板画廊 TEMPLATE">
              <div className="grid grid-cols-3 gap-1 mt-2">
                {templates.map((tpl) => {
                  const isSel = template === tpl.id;
                  return (
                    <motion.button key={tpl.id} type="button" whileTap={{ scale: 0.97 }}
                      onClick={() => setTemplate(tpl.id)}
                      style={{
                        background: isSel ? 'rgba(255,59,48,0.08)' : '#0A0A0E',
                        border: isSel ? '1px solid rgba(255,59,48,0.5)' : '1px solid rgba(255,255,255,0.06)',
                        boxShadow: isSel ? '0 0 12px rgba(255,59,48,0.15)' : 'none',
                        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                      }}
                      className="text-left px-2.5 py-2.5 transition-all duration-200 text-[10px]">
                      <div style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: isSel ? '#FF3B30' : 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase',
                      }}>
                        {TEMPLATE_META[tpl.id]?.labelEn ?? tpl.name}
                      </div>
                      <div style={{
                        fontSize: '8px',
                        color: isSel ? 'rgba(255,59,48,0.65)' : 'rgba(255,255,255,0.15)',
                        marginTop: 3,
                        letterSpacing: '0.05em',
                      }}>
                        {TEMPLATE_META[tpl.id]?.label ?? ''}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </CollapsibleSection>
          </div>

          <ThinRule />

          {/* 头图上传 */}
          <div className="py-4">
            <CollapsibleSection title="🖼 头图上传 COVER" defaultOpen={false}>
              <div className="mt-2 space-y-2.5">
                <div className="flex gap-1.5">
                  <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCoverUrl(); }}
                    placeholder="https://..."
                    className="flex-1 px-2.5 py-1.5 rounded-md text-[11px] bg-white/[0.05] border border-white/[0.08] text-white/70 placeholder:text-white/15 focus:outline-none focus:border-indigo-400/40" />
                  <button type="button" onClick={handleCoverUrl}
                    className="px-3 py-1.5 rounded-md text-[10px] bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all uppercase tracking-wider">加载</button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload}
                  className="w-full text-[10px] text-white/25 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:bg-white/[0.06] file:text-white/50 file:cursor-pointer hover:file:bg-white/[0.1]" />
                {coverPreview && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <img src={coverPreview} alt="cover" className="w-10 h-10 object-cover rounded border border-white/[0.06]" />
                    <div className="flex-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">HEADER IMAGE</span>
                      <div className="text-[11px] text-indigo-300/70 mt-0.5">已设置</div>
                    </div>
                    <button type="button" onClick={handleRemoveCover}
                      className="text-[10px] text-red-400/60 hover:text-red-400 px-1.5 py-0.5 transition-colors">✕</button>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>

          <ThinRule />

          {/* 比例选择器 */}
          <div className="py-4">
            <CollapsibleSection title="📐 比例选择 RATIO">
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(ASPECT_RATIOS).map(([key, val]) => (
                  <button key={key} type="button" onClick={() => setRatioKey(key)}
                    className={`px-2.5 py-1.5 rounded-md text-[10px] transition-all duration-200 border ${
                      ratioKey === key ? 'bg-indigo-500/12 border-indigo-400/25 text-white'
                        : 'bg-white/[0.02] border-white/[0.04] text-white/30 hover:text-white/55 hover:border-white/[0.1]'
                    }`}>{val.label}</button>
                ))}
              </div>
              {ratioKey === 'custom' && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2.5">
                  <input type="number" value={customW} onChange={(e) => setCustomW(Number(e.target.value))} placeholder="W"
                    className="w-20 px-2 py-1.5 rounded-md text-[11px] bg-white/[0.05] border border-white/[0.08] text-white/70 focus:outline-none focus:border-indigo-400/40" />
                  <span className="text-white/20 text-xs">×</span>
                  <input type="number" value={customH} onChange={(e) => setCustomH(Number(e.target.value))} placeholder="H"
                    className="w-20 px-2 py-1.5 rounded-md text-[11px] bg-white/[0.05] border border-white/[0.08] text-white/70 focus:outline-none focus:border-indigo-400/40" />
                  <span className="text-[9px] text-white/20">px</span>
                </motion.div>
              )}
            </CollapsibleSection>
          </div>

          <ThinRule />

          {/* 条目数量 */}
          <div className="py-4">
            <CollapsibleSection title="📊 条目数量 ENTRIES" defaultOpen={false}>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] text-white/25 min-w-[20px]">{entryCount}</span>
                <input type="range" min={1} max={20} value={entryCount} onChange={(e) => setEntryCount(Number(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full bg-white/[0.08] cursor-pointer"
                  style={{ accentColor: '#6366F1' }} />
                <span className="text-[10px] text-white/25">20</span>
              </div>
            </CollapsibleSection>
          </div>

          <ThinRule />

          {/* 色调引擎 */}
          <div className="py-4">
            <CollapsibleSection title="🎨 色调引擎 CHROMA" defaultOpen={true}>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-white/20"
                  style={{ backgroundColor: `hsl(${accentHue}, 70%, 55%)` }} />
                <input type="range" min={0} max={360} value={accentHue} onChange={(e) => setAccentHue(Number(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full bg-white/[0.08] cursor-pointer"
                  style={{ accentColor: `hsl(${accentHue}, 70%, 55%)` }} />
                <span className="text-[10px] text-white/30 w-8 text-right">{accentHue}°</span>
              </div>
            </CollapsibleSection>
          </div>

          <ThinRule />

          {/* 字号缩放 */}
          <div className="py-4">
            <CollapsibleSection title="🔤 字体大小 FONT SIZE" defaultOpen={true}>
              <div className="mt-2 space-y-3">
                {/* 一键预设 */}
                <div className="flex gap-0.5">
                  {([
                    { id: 'S', scale: 0.75 },
                    { id: 'M', scale: 1.0 },
                    { id: 'L', scale: 1.3 },
                    { id: 'XL', scale: 1.6 },
                  ] as const).map(p => {
                    const isActive = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setFontScale(1.0);
                            setActivePreset(null);
                          } else {
                            setFontScale(p.scale);
                            setActivePreset(p.id);
                          }
                        }}
                        className={`flex-1 py-1 rounded text-[7px] font-bold transition-all duration-200 border ${
                          isActive
                            ? 'bg-purple-500/12 border-purple-400/30 text-purple-300'
                            : 'bg-white/[0.02] border-white/[0.05] text-white/20 hover:text-white/45 hover:border-white/[0.1]'
                        }`}
                        style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", letterSpacing: '0.05em' }}
                      >
                        {isActive ? '✓' : p.id}
                      </button>
                    );
                  })}
                </div>

                {/* 刻度尺 */}
                <div className="flex justify-between">
                  {['0.5×', '1.0×', '1.5×', '2.0×'].map((label, i) => {
                    const markScale = [0.5, 1.0, 1.5, 2.0][i];
                    const isNear = Math.abs(fontScale - markScale) < 0.03;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => { setFontScale(markScale); setActivePreset(null); }}
                        className={`text-[8px] transition-colors ${
                          isNear ? 'text-purple-300/80 font-semibold' : 'text-white/12 hover:text-white/25'
                        }`}
                      >{label}</button>
                    );
                  })}
                </div>

                {/* 滑块 + ± 微调 */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setFontScale(prev => Math.max(0.5, +(prev - 0.02).toFixed(2))); setActivePreset(null); }}
                    className="w-5 h-5 flex items-center justify-center rounded text-white/25 hover:text-white/60 text-[11px] leading-none select-none transition-colors"
                  >−</button>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min={0.5} max={2.0} step={0.02}
                      value={fontScale}
                      onChange={(e) => { setFontScale(Number(e.target.value)); setActivePreset(null); }}
                      className="w-full h-1.5 appearance-none rounded-full bg-white/[0.08] cursor-pointer"
                      style={{ accentColor: activePreset ? '#A78BFA' : fontScale === 1 ? '#A78BFA' : fontScale > 1 ? '#C084FC' : '#7C3AED' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFontScale(prev => Math.min(2.0, +(prev + 0.02).toFixed(2))); setActivePreset(null); }}
                    className="w-5 h-5 flex items-center justify-center rounded text-white/25 hover:text-white/60 text-[11px] leading-none select-none transition-colors"
                  >+</button>
                  <span className="text-[10px] text-white/30 w-10 text-right font-mono tracking-tight tabular-nums">
                    {fontScale.toFixed(2)}×
                  </span>
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* 导出按钮 */}
          <div className="py-5 flex flex-col gap-2.5">
            <button type="button" onClick={() => handleExport('png')} disabled={isExporting}
              className={`w-full py-3.5 rounded-lg text-[12px] font-semibold tracking-[0.12em] uppercase transition-all duration-200 active:scale-[0.98] ${isExporting
                ? 'bg-white/[0.03] border border-white/[0.04] text-white/15 cursor-not-allowed'
                : 'bg-indigo-600 border border-indigo-500/30 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/15'
              }`}>{isExporting ? '⏳ 生成中…' : '📷 导出 PNG'}</button>
            <button type="button" onClick={() => handleExport('svg')} disabled={isExporting}
              className={`w-full py-3 rounded-lg text-[11px] tracking-[0.1em] uppercase transition-all border ${isExporting
                ? 'border-white/[0.03] text-white/10 cursor-not-allowed'
                : 'border-white/[0.07] bg-white/[0.02] text-white/35 hover:text-white/70 hover:border-white/[0.15]'
              }`}>📐 导出 SVG</button>
          </div>
        </div>
      </main>

      {/* 隐藏 DOM 用于导出截图 */}
      <div ref={cardExportRef} style={{ position: 'fixed', top: 0, left: 0, width: cardSize.w, height: cardSize.h,
        zIndex: -9999, pointerEvents: 'none' }}>
        {cardData.entries.length > 0 && (
          <ShareCard template={template} orientation={orientation} data={cardData} accentHue={accentHue} fontSizeScale={fontScale} width={cardSize.w} height={cardSize.h} />
        )}
      </div>

      <StampAnimation isActive={showStamp} onFinished={() => setShowStamp(false)} />
    </div>
  );
}
