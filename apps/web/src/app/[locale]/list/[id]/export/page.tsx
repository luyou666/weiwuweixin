/* ============================================================
   围物为心 — PNG 分享卡导出页面
   /list/[id]/export
   ============================================================ */

'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '@weiwuweixin/ui';
import type { CardTemplateId, CardOrientation } from '@weiwuweixin/ui';
import { getTemplateList } from '@weiwuweixin/ui';
// Dynamic import for client-only modules (satori + @resvg/resvg-js have native binaries)
import { StampAnimation } from '@/components/stamp-animation';
import { MOCK_FEED_LISTS } from '@/lib/mock-data';

/* ---------- 模板预览缩略图颜色 ---------- */

const TEMPLATE_PREVIEW_COLORS: Record<CardTemplateId, { bg: string; accent: string; label: string }> = {
  'rice-ink': { bg: '#FBF7F0', accent: '#E2553F', label: '宣纸' },
  morandi: { bg: '#E8E0D4', accent: '#A68B7A', label: '莫兰迪' },
  'cyber-neon': { bg: '#0D0D1A', accent: '#00FFC8', label: '霓虹' },
  'retro-magazine': { bg: '#F5F0E6', accent: '#C04030', label: '杂志' },
  'minimal-white': { bg: '#FFFFFF', accent: '#E2553F', label: '极简' },
  'sticker-journal': { bg: '#FFF9EE', accent: '#E88B30', label: '手账' },
};

/* ---------- 主页面 ---------- */

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('export');
  const listId = params.id as string;

  // 从 mock 数据获取榜单信息（实际项目走 API）
  const listData = useMemo(() => {
    return MOCK_FEED_LISTS.find((l) => l.id === listId) ?? MOCK_FEED_LISTS[0];
  }, [listId]);

  const templates = useMemo(() => getTemplateList(), []);

  // 状态
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplateId>('rice-ink');
  const [orientation, setOrientation] = useState<CardOrientation>('portrait');
  const [isExporting, setIsExporting] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [previewMode, setPreviewMode] = useState<'portrait' | 'landscape'>('portrait');
  const previewRef = useRef<HTMLDivElement>(null);

  // 构造 ShareCardData
  const cardData = useMemo(() => ({
    title: listData.title,
    subtitle: listData.subtitle,
    entries: [
      { rank: 1, name: '绝佳之选', score: '9.2', note: '年度之最' },
      { rank: 2, name: '上品佳作', score: '8.8', note: '品质出众' },
      { rank: 3, name: '良品推荐', score: '8.5', note: '值得拥有' },
      { rank: 4, name: '中上之选', score: '8.0', note: '表现不错' },
      { rank: 5, name: '稳健之选', score: '7.6', note: '基本达标' },
    ],
    author: { nickname: listData.author.nickname },
    listUrl: `https://weiwuweixin.app/list/${listId}`,
    watermark: '心',
  }), [listData, listId]);

  /* ---------- 导出逻辑 ---------- */

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Dynamic import to avoid bundling native .node binaries at build time
      const { exportCard: doExport, downloadBlob, generateFilename } = await import('@/lib/export-card');
      const result = await doExport({
        template: selectedTemplate,
        orientation,
        data: cardData,
        scale: 1,
        format: 'png',
      });

      // 触发下载
      const filename = generateFilename(cardData.title, selectedTemplate, orientation, 'png');
      downloadBlob(result.data as ArrayBuffer, filename, result.mimeType);

      // 播放印章动画
      setShowStamp(true);
    } catch (err) {
      console.error('[ExportPage] Export failed:', err);
      alert(t('exportFailed') ?? '导出失败，请重试。');
    } finally {
      setIsExporting(false);
    }
  }, [selectedTemplate, orientation, cardData]);

  const handleExportSvg = useCallback(async () => {
    setIsExporting(true);
    try {
      const { exportCard: doExport, downloadBlob, generateFilename } = await import('@/lib/export-card');
      const result = await doExport({
        template: selectedTemplate,
        orientation,
        data: cardData,
        format: 'svg',
      });

      const filename = generateFilename(cardData.title, selectedTemplate, orientation, 'svg');
      downloadBlob(result.data as string, filename, result.mimeType);
      setShowStamp(true);
    } catch (err) {
      console.error('[ExportPage] SVG export failed:', err);
      alert(t('exportFailed') ?? '导出失败，请重试。');
    } finally {
      setIsExporting(false);
    }
  }, [selectedTemplate, orientation, cardData]);

  const handleStampFinished = useCallback(() => {
    setShowStamp(false);
  }, []);

  /* ---------- 渲染 ---------- */

  return (
    <div className="min-h-screen bg-paper">
      {/* ─── 顶部导航 ─── */}
      <header className="sticky top-0 z-sticky bg-paper/80 backdrop-blur-sm border-b border-ink-100">
        <div className="max-w-5xl mx-auto px-lg py-sm flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="font-heading text-lg text-ink-900 hover:text-vermilion transition-colors"
          >
            ← {t('back') ?? '返回'}
          </button>
          <h1 className="font-heading text-lg text-ink-700">{t('title') ?? '导出分享卡'}</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-lg py-xl flex flex-col lg:flex-row gap-xl">
        {/* ─── 左侧：预览区 ─── */}
        <div className="flex-1 flex flex-col items-center">
          {/* 比例切换 */}
          <div className="flex gap-sm mb-lg">
            <button
              onClick={() => setOrientation('portrait')}
              className={`
                px-md py-xs rounded-md text-sm font-medium transition-all border
                ${orientation === 'portrait'
                  ? 'border-vermilion bg-vermilion/10 text-ink-900'
                  : 'border-ink-100 bg-rice text-ink-500 hover:bg-ink-100'
                }
              `}
            >
              📱 {t('portrait')}
            </button>
            <button
              onClick={() => setOrientation('landscape')}
              className={`
                px-md py-xs rounded-md text-sm font-medium transition-all border
                ${orientation === 'landscape'
                  ? 'border-vermilion bg-vermilion/10 text-ink-900'
                  : 'border-ink-100 bg-rice text-ink-500 hover:bg-ink-100'
                }
              `}
            >
              🖥 {t('landscape')}
            </button>
          </div>

          {/* 预览卡片占位 */}
          <div
            ref={previewRef}
            className="relative bg-rice rounded-lg shadow-md overflow-hidden border border-ink-100"
            style={{
              width: orientation === 'portrait' ? '100%' : '100%',
              maxWidth: orientation === 'portrait' ? 320 : 480,
              aspectRatio: orientation === 'portrait' ? '9/16' : '16/9',
            }}
          >
            {/* 模板色彩预览 */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: TEMPLATE_PREVIEW_COLORS[selectedTemplate].bg,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  opacity: 0.03,
                  backgroundImage: 
                    selectedTemplate === 'cyber-neon'
                      ? 'linear-gradient(rgba(0,255,200,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.05) 1px, transparent 1px)'
                      : 'none',
                  backgroundSize: '20px 20px',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 40%, ${TEMPLATE_PREVIEW_COLORS[selectedTemplate].accent}15 0%, transparent 60%)`,
                }}
              />
              
              {/* 缩略预览内容 */}
              <div className="relative z-10 p-6 w-full h-full flex flex-col">
                {/* 竖线装饰 */}
                <div style={{
                  width: 2,
                  height: 20,
                  backgroundColor: TEMPLATE_PREVIEW_COLORS[selectedTemplate].accent,
                  borderRadius: 1,
                  marginBottom: 8,
                  opacity: 0.8,
                }} />

                <h3 style={{
                  fontFamily: '"Songti SC", "Noto Serif SC", serif',
                  fontSize: orientation === 'portrait' ? 18 : 14,
                  fontWeight: 700,
                  color: selectedTemplate === 'cyber-neon' ? '#F0F0FF' : TEMPLATE_PREVIEW_COLORS[selectedTemplate].accent === '#00FFC8' ? '#F0F0FF' : '#1A1A24',
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}>
                  {cardData.title}
                </h3>

                <p style={{
                  fontSize: orientation === 'portrait' ? 10 : 8,
                  color: selectedTemplate === 'cyber-neon' ? 'rgba(176,176,208,0.8)' : 'rgba(94,94,114,0.8)',
                  marginBottom: 12,
                }}>
                  {cardData.subtitle}
                </p>

                {/* 简化条目预览 */}
                {cardData.entries.slice(0, 3).map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 0',
                      borderBottom: i < 2 ? `1px solid ${selectedTemplate === 'cyber-neon' ? 'rgba(42,42,80,0.5)' : 'rgba(208,208,220,0.4)'}` : 'none',
                    }}
                  >
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: i < 3 ? TEMPLATE_PREVIEW_COLORS[selectedTemplate].accent : 'transparent',
                      opacity: 0.7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 8,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      flexShrink: 0,
                    }}>
                      {entry.rank}
                    </div>
                    <span style={{
                      fontSize: orientation === 'portrait' ? 11 : 9,
                      fontWeight: 500,
                      color: selectedTemplate === 'cyber-neon' ? '#E0E0F0' : '#3A3A4F',
                      flex: 1,
                    }}>
                      {entry.name}
                    </span>
                    <span style={{
                      fontSize: orientation === 'portrait' ? 10 : 8,
                      fontWeight: 600,
                      color: TEMPLATE_PREVIEW_COLORS[selectedTemplate].accent,
                    }}>
                      {entry.score}
                    </span>
                  </div>
                ))}

                {/* 底部缩略信息 */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}>
                  <span style={{
                    fontSize: 9,
                    color: selectedTemplate === 'cyber-neon' ? 'rgba(176,176,208,0.5)' : 'rgba(94,94,114,0.6)',
                  }}>
                    {cardData.author.nickname}
                  </span>
                  {/* QR 码占位 */}
                  <div style={{
                    width: 28,
                    height: 28,
                    backgroundColor: selectedTemplate === 'cyber-neon' ? '#1A1A30' : '#FFFFFF',
                    borderRadius: 2,
                    border: `1px solid ${selectedTemplate === 'cyber-neon' ? '#2A2A50' : '#D0D0DC'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 6,
                    color: selectedTemplate === 'cyber-neon' ? '#00FFC8' : '#9090A4',
                  }}>
                    QR
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 模板名称 */}
          <div className="mt-md text-center">
            <span className="text-sm font-medium text-ink-900">
              {templates.find((t) => t.id === selectedTemplate)?.name ?? ''}
            </span>
            <span className="text-xs text-ink-300 ml-sm">
              {templates.find((t) => t.id === selectedTemplate)?.description ?? ''}
            </span>
          </div>
        </div>

        {/* ─── 右侧：配置 + 导出 ─── */}
        <div className="lg:w-80 flex flex-col gap-lg">
          {/* 模板选择网格 */}
          <Card interactive={false} textured size="md">
            <h2 className="font-heading text-base text-ink-900 mb-md">{t('selectTemplate')}</h2>
            <div className="grid grid-cols-3 gap-sm">
              {templates.map((tpl) => {
                const preview = TEMPLATE_PREVIEW_COLORS[tpl.id];
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`
                      relative p-sm rounded-md border transition-all aspect-square
                      flex flex-col items-center justify-center gap-1
                      ${isSelected
                        ? 'border-vermilion bg-vermilion/5 shadow-sm scale-105'
                        : 'border-ink-100 bg-paper hover:bg-rice hover:border-ink-300'
                      }
                    `}
                  >
                    {/* 模板色彩预览块 */}
                    <div
                      className="w-8 h-8 rounded-md border border-ink-100"
                      style={{
                        backgroundColor: preview.bg,
                        backgroundImage: `radial-gradient(circle at 50% 50%, ${preview.accent}40 0%, transparent 70%)`,
                      }}
                    />
                    <span className="text-[10px] font-medium text-ink-700 leading-tight">
                      {preview.label}
                    </span>
                    {isSelected && (
                      <div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold"
                        style={{ backgroundColor: 'var(--vermilion)' }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 榜单信息 */}
          <Card interactive={false} textured size="md">
            <h2 className="font-heading text-base text-ink-900 mb-md">{t('listInfo')}</h2>
            <div className="space-y-sm text-sm">
              <div>
                <span className="text-ink-300">{t('titleLabel')}</span>
                <p className="text-ink-900 font-medium">{cardData.title}</p>
              </div>
              {cardData.subtitle && (
                <div>
                  <span className="text-ink-300">{t('subtitleLabel')}</span>
                  <p className="text-ink-700">{cardData.subtitle}</p>
                </div>
              )}
              <div>
                <span className="text-ink-300">{t('authorLabel')}</span>
                <p className="text-ink-900 font-medium">{cardData.author.nickname}</p>
              </div>
              <div>
                <span className="text-ink-300">{t('entryCountLabel')}</span>
                <p className="text-ink-900">{cardData.entries.length}</p>
              </div>
            </div>
          </Card>

          {/* 导出按钮 */}
          <div className="space-y-sm">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="lg"
              className="w-full"
              style={{ width: '100%' }}
            >
              {isExporting ? t('exporting') : t('exportPng')}
            </Button>
            <Button
              onClick={handleExportSvg}
              disabled={isExporting}
              size="md"
              className="w-full"
              style={{ width: '100%' }}
            >
              {isExporting ? t('exporting') : t('exportSvg')}
            </Button>
          </div>

          {/* 尺寸信息 */}
          <div className="text-xs text-ink-300 text-center">
            {orientation === 'portrait' ? t('sizeInfoPortrait') : t('sizeInfoLandscape')}
          </div>
        </div>
      </main>

      {/* 印章盖下动画 */}
      <StampAnimation isActive={showStamp} onFinished={handleStampFinished} />
    </div>
  );
}