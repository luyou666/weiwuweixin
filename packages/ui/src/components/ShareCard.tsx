/* ============================================================
   围物为心 — PNG 分享卡 JSX 模板
   12 套模板 · satori 兼容（inline style only，无 tailwind）
   ============================================================ */

import React from 'react';

/* ---------- 类型 ---------- */

export type CardOrientation = 'portrait' | 'landscape';

export type CardTemplateId =
  | 'rice-ink'
  | 'morandi'
  | 'cyber-neon'
  | 'retro-magazine'
  | 'minimal-white'
  | 'sticker-journal'
  | 'glass-morphism'
  | 'brutalist'
  | 'paper-fold'
  | 'cosmic-dust'
  | 'vaporwave'
  | 'grid-poster'
  | 'data-tableau';

export interface ShareCardEntry {
  rank: number;
  name: string;
  score?: string;
  note?: string;
  /** 各维度得分明细（用于数据表格模板展示维度分数+权重） */
  dimensionScores?: { name: string; weight: number; score: number; maxScore?: number }[];
}

export interface ShareCardData {
  title: string;
  subtitle?: string;
  entries: ShareCardEntry[];
  author: { nickname: string; avatarUrl?: string };
  listUrl: string;
  logoUrl?: string;
  watermark?: string;
  coverUrl?: string;
  /** 算法标识（用于分享卡底部技术标签） */
  algorithmId?: string;
  /** 分制（如 '1-5', '1-10', '0-100'） */
  scale?: string;
  /** 维度定义（用于数据表格模板表头） */
  dimensions?: { name: string; weight: number }[];
}

export interface ShareCardProps {
  /** 模板 ID */
  template: CardTemplateId;
  /** 竖版 / 横版 */
  orientation: CardOrientation;
  /** 卡片数据 */
  data: ShareCardData;
  /** 色调偏移角度 (HSL hue)，0-360，默认0表示不偏移 */
  accentHue?: number;
  /** 字号缩放倍率，默认 1.0（范围 0.5~2.0） */
  fontSizeScale?: number;

  /** 画布宽度（像素），默认按 orientation 自动算 */
  width?: number;
  /** 画布高度（像素），默认按 orientation 自动算 */
  height?: number;
}

/* ---------- 常量 ---------- */

export const CARD_SIZES: Record<CardOrientation, { w: number; h: number }> = {
  portrait: { w: 1080, h: 1920 },
  landscape: { w: 1200, h: 675 },
};

/* ============================================================
   模板色彩系统
   ============================================================ */

const THEMES: Record<
  CardTemplateId,
  {
    bg: string;
    bgGradient?: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentLight: string;
    cardBg: string;
    cardBorder: string;
    divider: string;
    qrBg: string;
    watermarkColor: string;
    rankBadgeBg: string;
    rankBadgeText: string;
    fontFamily: string;
    titleFont: string;
  }
> = {
  'rice-ink': {
    bg: '#FBF7F0',
    bgGradient: 'linear-gradient(180deg, #FBF7F0 0%, #F3ECDE 100%)',
    text: '#1A1A24',
    textSecondary: '#3A3A4F',
    textMuted: '#5E5E72',
    accent: '#E2553F',
    accentLight: '#F07860',
    cardBg: '#FFFFFFcc',
    cardBorder: '#D0D0DC',
    divider: '#E8E4D8',
    qrBg: '#FFFFFF',
    watermarkColor: 'rgba(26,26,36,0.06)',
    rankBadgeBg: '#E2553F',
    rankBadgeText: '#FBF7F0',
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    titleFont: '"Songti SC", "Noto Serif SC", "SimSun", serif',
  },
  morandi: {
    bg: '#E8E0D4',
    bgGradient: 'linear-gradient(135deg, #E8E0D4 0%, #D4CCC0 50%, #C8BFB3 100%)',
    text: '#4A4540',
    textSecondary: '#6B6458',
    textMuted: '#9A9288',
    accent: '#A68B7A',
    accentLight: '#C4AFA0',
    cardBg: '#F0EAE0dd',
    cardBorder: '#C4BDB2',
    divider: '#D0C8BC',
    qrBg: '#F5F0E8',
    watermarkColor: 'rgba(74,69,64,0.05)',
    rankBadgeBg: '#A68B7A',
    rankBadgeText: '#F5F0E8',
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    titleFont: '"Songti SC", "Noto Serif SC", serif',
  },
  'cyber-neon': {
    bg: '#0D0D1A',
    bgGradient: 'linear-gradient(135deg, #0D0D1A 0%, #1A1A30 50%, #0D0D1A 100%)',
    text: '#F0F0FF',
    textSecondary: '#B0B0D0',
    textMuted: '#6E6E90',
    accent: '#00FFC8',
    accentLight: '#66FFD8',
    cardBg: '#141428ee',
    cardBorder: '#2A2A50',
    divider: '#2A2A40',
    qrBg: '#1A1A30',
    watermarkColor: 'rgba(0,255,200,0.04)',
    rankBadgeBg: '#00FFC8',
    rankBadgeText: '#0D0D1A',
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
    titleFont: '"Courier New", "PingFang SC", monospace',
  },
  'retro-magazine': {
    bg: '#F5F0E6',
    bgGradient: 'linear-gradient(180deg, #F5F0E6 0%, #EDE6D8 100%)',
    text: '#2B2520',
    textSecondary: '#5A4F42',
    textMuted: '#8A8070',
    accent: '#C04030',
    accentLight: '#D46050',
    cardBg: '#FFFDF5ee',
    cardBorder: '#C8C0B0',
    divider: '#D8D0C0',
    qrBg: '#FFFDF5',
    watermarkColor: 'rgba(43,37,32,0.05)',
    rankBadgeBg: '#C04030',
    rankBadgeText: '#F5F0E6',
    fontFamily: '"Georgia", "Noto Serif SC", "Songti SC", serif',
    titleFont: '"Georgia", "Noto Serif SC", "Songti SC", serif',
  },
  'minimal-white': {
    bg: '#FFFFFF',
    bgGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F8F8FA 100%)',
    text: '#1A1A24',
    textSecondary: '#4A4A58',
    textMuted: '#6E6E88',
    accent: '#E2553F',
    accentLight: '#F07860',
    cardBg: '#FFFFFF',
    cardBorder: '#E8E8EC',
    divider: '#F0F0F4',
    qrBg: '#FFFFFF',
    watermarkColor: 'rgba(26,26,36,0.04)',
    rankBadgeBg: '#E2553F',
    rankBadgeText: '#FFFFFF',
    fontFamily: '"Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif',
    titleFont: '"Helvetica Neue", "PingFang SC", sans-serif',
  },
  'sticker-journal': {
    bg: '#FFF9EE',
    bgGradient: 'linear-gradient(135deg, #FFF9EE 0%, #FFF3D6 50%, #FFEED0 100%)',
    text: '#2D2418',
    textSecondary: '#5E4D38',
    textMuted: '#9A8A70',
    accent: '#E88B30',
    accentLight: '#F4A848',
    cardBg: '#FFFEF8ee',
    cardBorder: '#E8DCC0',
    divider: '#F0E4C8',
    qrBg: '#FFFEF8',
    watermarkColor: 'rgba(45,36,24,0.05)',
    rankBadgeBg: '#E88B30',
    rankBadgeText: '#FFF9EE',
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
    titleFont: '"Songti SC", "Noto Serif SC", serif',
  },
  /* ------ 新增模板主题 ------ */
  'glass-morphism': {
    bg: '#1A1A2E',
    bgGradient: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 40%, #0F3460 100%)',
    text: '#F0F0FF',
    textSecondary: '#C0C0E0',
    textMuted: '#8080AA',
    accent: '#64FFDA',
    accentLight: '#B2FFEE',
    cardBg: 'rgba(255,255,255,0.08)',
    cardBorder: 'rgba(255,255,255,0.15)',
    divider: 'rgba(255,255,255,0.08)',
    qrBg: 'rgba(255,255,255,0.06)',
    watermarkColor: 'rgba(100,255,218,0.06)',
    rankBadgeBg: '#64FFDA',
    rankBadgeText: '#1A1A2E',
    fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
    titleFont: '"Inter", "PingFang SC", sans-serif',
  },
  brutalist: {
    bg: '#F8F8F8',
    bgGradient: 'linear-gradient(180deg, #F8F8F8 0%, #F0F0F0 100%)',
    text: '#000000',
    textSecondary: '#1A1A1A',
    textMuted: '#444444',
    accent: '#FFD700',
    accentLight: '#FFEE58',
    cardBg: '#FFFFFF',
    cardBorder: '#000000',
    divider: '#000000',
    qrBg: '#FFFFFF',
    watermarkColor: 'rgba(0,0,0,0.06)',
    rankBadgeBg: '#000000',
    rankBadgeText: '#FFD700',
    fontFamily: '"Helvetica Neue", "Arial Black", "PingFang SC", sans-serif',
    titleFont: '"Helvetica Neue", "Arial Black", "PingFang SC", sans-serif',
  },
  'paper-fold': {
    bg: '#FDF8F0',
    bgGradient: 'linear-gradient(135deg, #FDF8F0 0%, #F8F0E5 30%, #F5ECD8 100%)',
    text: '#3D2C1E',
    textSecondary: '#5C4636',
    textMuted: '#8B7355',
    accent: '#D4956B',
    accentLight: '#E8B08D',
    cardBg: 'rgba(255,252,245,0.85)',
    cardBorder: '#E0D5C5',
    divider: '#E8DCC8',
    qrBg: '#FFFCF5',
    watermarkColor: 'rgba(61,44,30,0.05)',
    rankBadgeBg: '#D4956B',
    rankBadgeText: '#FDF8F0',
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
    titleFont: '"KaiTi", "STKaiti", "Noto Serif SC", serif',
  },
  'cosmic-dust': {
    bg: '#0A0A2E',
    bgGradient: 'linear-gradient(135deg, #0A0A2E 0%, #120A3A 30%, #1A0A3E 60%, #0A0A2E 100%)',
    text: '#E8E0FF',
    textSecondary: '#C0B8E8',
    textMuted: '#7870AA',
    accent: '#FF61D2',
    accentLight: '#FF90E0',
    cardBg: 'rgba(30,20,60,0.7)',
    cardBorder: 'rgba(120,100,200,0.25)',
    divider: 'rgba(120,100,200,0.15)',
    qrBg: 'rgba(30,20,60,0.6)',
    watermarkColor: 'rgba(255,97,210,0.05)',
    rankBadgeBg: '#FF61D2',
    rankBadgeText: '#0A0A2E',
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
    titleFont: '"PingFang SC", "Microsoft YaHei", sans-serif',
  },
  vaporwave: {
    bg: '#1A0A30',
    bgGradient: 'linear-gradient(180deg, #1A0A30 0%, #3D0A5C 40%, #6B1A8A 100%)',
    text: '#FFEEF8',
    textSecondary: '#FFCCE8',
    textMuted: '#C090D0',
    accent: '#FF6B9D',
    accentLight: '#FF90B8',
    cardBg: 'rgba(40,20,60,0.7)',
    cardBorder: 'rgba(200,100,180,0.3)',
    divider: 'rgba(200,100,180,0.15)',
    qrBg: 'rgba(40,20,60,0.6)',
    watermarkColor: 'rgba(255,107,157,0.06)',
    rankBadgeBg: '#FF6B9D',
    rankBadgeText: '#1A0A30',
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
    titleFont: '"PingFang SC", "Microsoft YaHei", sans-serif',
  },
  'grid-poster': {
    bg: '#F5F5F5',
    bgGradient: 'linear-gradient(180deg, #F5F5F5 0%, #EBEBEB 100%)',
    text: '#111111',
    textSecondary: '#2D2D2D',
    textMuted: '#6B6B6B',
    accent: '#E62E2E',
    accentLight: '#FF5050',
    cardBg: '#FFFFFF',
    cardBorder: '#D0D0D0',
    divider: '#D0D0D0',
    qrBg: '#FFFFFF',
    watermarkColor: 'rgba(17,17,17,0.04)',
    rankBadgeBg: '#E62E2E',
    rankBadgeText: '#FFFFFF',
    fontFamily: '"Helvetica Neue", "Helvetica", "PingFang SC", sans-serif',
    titleFont: '"Helvetica Neue", "Helvetica", "Arial", "PingFang SC", sans-serif',
  },
  'data-tableau': {
    bg: '#0D0D14',
    bgGradient: 'linear-gradient(180deg, #0D0D14 0%, #11111C 50%, #0D0D14 100%)',
    text: '#F0F0F0',
    textSecondary: '#C0C0C8',
    textMuted: '#606068',
    accent: '#FF3B30',
    accentLight: '#FF6B60',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
    divider: 'rgba(255,255,255,0.06)',
    qrBg: '#181820',
    watermarkColor: 'rgba(255,59,48,0.04)',
    rankBadgeBg: '#FF3B30',
    rankBadgeText: '#0D0D14',
    fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", "PingFang SC", "Microsoft YaHei", monospace',
    titleFont: '"Inter", "Helvetica Neue", "PingFang SC", sans-serif',
  },
};

/* ============================================================
   QR SVG 生成器（satori 兼容）
   ============================================================ */

function QRSvg({ value, size = 200, fgColor, bgColor }: { value: string; size?: number; fgColor?: string; bgColor?: string }) {
  /* 简易 QR 编码 — 用固定模式替代，satori 不支持第三方组件 */
  /* 我们生成一个简洁的 SVG 占位二维码图案（satori 内联使用） */
  const cellSize = Math.floor(size / 25);
  const actualSize = cellSize * 25;
  const modules = generateQRModules(value);

  const rects: React.ReactElement[] = [];
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      if (modules[y * 25 + x]) {
        rects.push(
          <rect
            key={`qr-${y}-${x}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={fgColor || '#1A1A24'}
          />
        );
      }
    }
  }

  return (
    <svg
      width={actualSize}
      height={actualSize}
      viewBox={`0 0 ${actualSize} ${actualSize}`}
      style={{ display: 'block' }}
    >
      <rect width={actualSize} height={actualSize} fill={bgColor || '#FFFFFF'} rx="4" />
      {rects}
    </svg>
  );
}

/** 极简 QR 模块生成器 — 仅用于分享卡内嵌（不是完整 QR 编码） */
function generateQRModules(value: string): boolean[] {
  /* 用哈希生成固定伪随机图案，包含定位图案 */
  const modules: boolean[] = new Array(25 * 25).fill(false);

  // 定位图案 (7x7, 左上、右上、左下)
  const positions = [
    { x: 0, y: 0 },
    { x: 18, y: 0 },
    { x: 0, y: 18 },
  ];
  for (const { x: px, y: py } of positions) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const idx = (py + dy) * 25 + (px + dx);
        // 外框全填、中间 3x3 全填
        if (dy === 0 || dy === 6 || dx === 0 || dx === 6 || (dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4)) {
          modules[idx] = true;
        } else {
          modules[idx] = false;
        }
      }
    }
  }

  // 用字符串哈希填充数据区域
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = ((seed << 5) - seed + value.charCodeAt(i)) | 0;
  }
  seed = Math.abs(seed);

  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      // 跳过定位图案区域
      const inFinder =
        (x < 8 && y < 8) || (x >= 18 && y < 8) || (x < 8 && y >= 18);
      if (inFinder) continue;

      // 定时图案
      if (x === 6 || y === 6) {
        modules[y * 25 + x] = (x + y) % 2 === 0;
        continue;
      }

      // 用哈希生成数据区域
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      modules[y * 25 + x] = (seed % 3) !== 0;
    }
  }

  return modules;
}

/* ============================================================
   通用数据矩阵布局 — 所有模板复用
   ============================================================ */

function DataMatrixLayout({
  data, orientation, theme, fontSizeScale = 1,
}: {
  data: ShareCardData;
  orientation: CardOrientation;
  theme: typeof THEMES['rice-ink'];
  fontSizeScale?: number;
}) {
  const t = theme;
  const s = fontSizeScale ?? 1;
  const isPortrait = orientation === 'portrait';
  const w = isPortrait ? 1080 : 1200;
  const h = isPortrait ? 1920 : 675;
  const pd = isPortrait ? 60 : 36;
  const topN = data.entries.slice(0, isPortrait ? 6 : 4);
  const dims = data.dimensions ?? [];
  const maxScale = 10;

  const algoName = data.algorithmId
    ? data.algorithmId.toUpperCase().replace(/-/g, ' ')
    : 'WEIGHTED MEAN';
  const scaleLabel = data.scale ?? '1-10';

  return (
    <div style={{
      width: w, height: h,
      background: t.bgGradient || t.bg,
      display: 'flex', flexDirection: 'column',
      padding: pd,
      fontFamily: t.fontFamily,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 工程网格背景 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(128,128,128,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(128,128,128,0.03) 1px, transparent 1px)
        `,
        backgroundSize: `${isPortrait ? 40 : 30}px ${isPortrait ? 40 : 30}px`,
        pointerEvents: 'none',
      }} />

      {/* 头图区域 */}
      {data.coverUrl && (
        <div style={{
          width: '100%',
          height: isPortrait ? 260 : 120,
          marginBottom: isPortrait ? 24 : 14,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 0,
          borderBottom: `1px solid ${t.divider}`,
        }}>
          <img
            src={data.coverUrl}
            alt="cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {/* 覆盖渐变蒙版 */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '40%',
            background: `linear-gradient(to top, ${t.bg}, transparent)`,
          }} />
        </div>
      )}

      {/* 技术标签行 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: isPortrait ? 20 : 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: isPortrait ? 12 : 8,
        }}>
          {/* 彩色竖线 */}
          <div style={{
            width: isPortrait ? 3 : 2,
            height: isPortrait ? 44 : 24,
            background: `linear-gradient(180deg, ${t.accent}, ${t.accentLight})`,
          }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              fontSize: (isPortrait ? 44 : 24) * s,
              fontWeight: 800,
              color: t.text,
              margin: 0,
              lineHeight: 1.1,
              fontFamily: t.titleFont,
              letterSpacing: isPortrait ? -1 : 0,
            }}>
              {data.title}
            </h1>
            {data.subtitle && (
              <p style={{
                fontSize: (isPortrait ? 16 : 11) * s,
                color: t.textMuted,
                margin: 0,
                marginTop: 4,
                letterSpacing: 1,
                fontFamily: t.fontFamily,
              }}>
                {data.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 右上角技术标签 */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          gap: 4,
        }}>
          <span style={{
            fontSize: (isPortrait ? 9 : 6) * s,
            color: t.textMuted,
            letterSpacing: 3,
            textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          }}>
            {algoName} · {scaleLabel}
          </span>
        </div>
      </div>

      {/* 表格表头 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        paddingBottom: isPortrait ? 8 : 5,
        marginBottom: isPortrait ? 4 : 2,
        borderBottom: `1px solid ${t.divider}`,
      }}>
        <div style={{
          width: isPortrait ? 60 : 44,
          fontSize: (isPortrait ? 8 : 6) * s,
          color: t.textMuted,
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          RANK
        </div>
        <div style={{
          flex: isPortrait ? 2.5 : 3,
          fontSize: (isPortrait ? 8 : 6) * s,
          color: t.textMuted,
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          ITEM
        </div>
        {dims.map((dim, di) => (
          <div key={di} style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2,
          }}>
            <span style={{
              fontSize: (isPortrait ? 7 : 5) * s,
              color: t.textMuted,
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              [{dim.name.toUpperCase()}]
            </span>
            <span style={{
              fontSize: (isPortrait ? 6 : 5) * s,
              color: t.accent,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              w={dim.weight}
            </span>
          </div>
        ))}
        <div style={{
          width: isPortrait ? 70 : 52,
          textAlign: 'right',
          fontSize: (isPortrait ? 8 : 6) * s,
          color: t.textMuted,
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Σ
        </div>
      </div>

      {/* 数据行 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {topN.map((entry, i) => {
          const ds = entry.dimensionScores ?? [];
          const isHigh = i < 3;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              flex: 1,
              borderBottom: i < topN.length - 1 ? `0.5px solid ${t.divider}` : 'none',
              position: 'relative',
              background: i % 2 === 0 ? 'rgba(128,128,128,0.02)' : 'transparent',
            }}>
              {/* 超大排名水印 */}
              <div style={{
                position: 'absolute', left: isPortrait ? 0 : -6,
                top: '50%', transform: 'translateY(-50%)',
                fontSize: (isPortrait ? 78 : 42) * s,
                fontWeight: 900,
                color: isHigh ? t.watermarkColor : 'rgba(128,128,128,0.02)',
                fontFamily: t.titleFont,
                pointerEvents: 'none',
                lineHeight: 1,
                letterSpacing: -4,
                opacity: isHigh ? 1 : 0.5,
              }}>
                {String(entry.rank).padStart(2, '0')}
              </div>

              {/* Rank序号 */}
              <div style={{
                width: isPortrait ? 60 : 44,
                display: 'flex', position: 'relative', zIndex: 1,
              }}>
                <div style={{
                  width: isPortrait ? (isHigh ? 22 : 16) : (isHigh ? 14 : 11),
                  height: isPortrait ? (isHigh ? 22 : 16) : (isHigh ? 14 : 11),
                  backgroundColor: isHigh ? t.accent : 'transparent',
                  border: isHigh ? 'none' : `1px solid ${t.divider}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: (isPortrait ? (isHigh ? 10 : 7) : (isHigh ? 7 : 5)) * s,
                  fontWeight: 700,
                  color: isHigh ? t.rankBadgeText : t.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {entry.rank}
                </div>
              </div>

              {/* Name */}
              <div style={{
                flex: isPortrait ? 2.5 : 3,
                fontSize: (isPortrait ? 20 : 12) * s,
                fontWeight: 600,
                color: t.text,
                position: 'relative', zIndex: 1,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                fontFamily: t.titleFont,
              }}>
                {entry.name}
              </div>

              {/* 维度进度条 */}
              {dims.map((dim, di) => {
                const dsItem = ds.find(s => s.name === dim.name);
                const scoreVal = dsItem?.score ?? 0;
                const maxVal = dsItem?.maxScore || maxScale;
                const pct = Math.min(1, Math.max(0, scoreVal / maxVal));
                return (
                  <div key={di} style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: isPortrait ? 3 : 2,
                    padding: isPortrait ? '0 6px' : '0 4px',
                  }}>
                    <div style={{
                      width: '100%', height: isPortrait ? 4 : 2,
                      background: t.divider, position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        width: `${pct * 100}%`,
                        background: `linear-gradient(90deg, ${t.accent}cc, ${t.accentLight})`,
                        boxShadow: pct > 0.5 ? `0 0 ${isPortrait ? 4 : 2}px ${t.accentLight}40` : 'none',
                      }} />
                    </div>
                    <span style={{
                      fontSize: (isPortrait ? 9 : 7) * s,
                      fontWeight: 700,
                      color: pct > 0.7 ? t.accentLight : t.textSecondary,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {scoreVal.toFixed(1)}
                    </span>
                  </div>
                );
              })}

              {/* Total */}
              <div style={{
                width: isPortrait ? 70 : 52, textAlign: 'right',
                position: 'relative', zIndex: 1,
              }}>
                <span style={{
                  fontSize: (isPortrait ? 20 : 13) * s,
                  fontWeight: 800,
                  color: isHigh ? t.accent : t.text,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {entry.score ?? '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部信息 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: isPortrait ? 14 : 8,
        marginTop: isPortrait ? 8 : 4,
        borderTop: `1px solid ${t.divider}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isPortrait ? 10 : 6 }}>
          <div style={{
            width: isPortrait ? 32 : 20,
            height: isPortrait ? 32 : 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: (isPortrait ? 12 : 8) * s,
            color: t.accent, fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            border: `1px solid ${t.accent}40`,
          }}>
            {data.author.nickname.charAt(0)}
          </div>
          <span style={{
            fontSize: (isPortrait ? 12 : 8) * s,
            color: t.textSecondary, letterSpacing: 1,
            fontFamily: t.titleFont,
          }}>
            {data.author.nickname}
          </span>
        </div>
        <div style={{
          fontSize: (isPortrait ? 7 : 5) * s,
          color: t.textMuted, letterSpacing: 2,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {data.watermark}
        </div>
        <QRSvg value={data.listUrl} size={isPortrait ? 80 : 48} fgColor={t.text} bgColor={t.qrBg || t.bg} />
      </div>
    </div>
  );
}

/* ============================================================
   HyperMatrixLayout — 前卫热力图数据矩阵（data-tableau 专用）
   纯黑工程蓝图风格 · 维度权重全览 · 热力图色阶
   ============================================================ */

function HyperMatrixLayout({
  data, orientation, fontSizeScale = 1,
}: {
  data: ShareCardData;
  orientation: CardOrientation;
  fontSizeScale?: number;
}) {
  const isPortrait = orientation === 'portrait';
  const s = fontSizeScale ?? 1;
  const w = isPortrait ? 1080 : 1200;
  const h = isPortrait ? 1920 : 675;
  const pd = isPortrait ? 24 : 14;
  const topN = data.entries.slice(0, isPortrait ? 6 : 4);
  const dims = data.dimensions ?? [];
  const maxScale = data.scale ? parseInt(data.scale.split('-')[1] || '10', 10) : 10;

  const algoName = data.algorithmId
    ? data.algorithmId.toUpperCase().replace(/-/g, ' ')
    : 'W. MEAN';
  const scaleLabel = data.scale ?? '1-5';

  /* —— 计算每维度的最大分，用于热力图归一化 —— */
  const dimMaxScores: Record<string, number> = {};
  for (const dim of dims) {
    let max = 0;
    for (const entry of topN) {
      const ds = entry.dimensionScores?.find(s => s.name === dim.name);
      if (ds && ds.score > max) max = ds.score;
    }
    dimMaxScores[dim.name] = max || maxScale;
  }

  /* —— 主题色（硬编码，不依赖 THEMES 映射） —— */
  const bg = '#0A0A0E';
  const bgGradient =
    'linear-gradient(180deg, #0A0A0E 0%, #0D0D14 50%, #0A0A0E 100%)';
  const text = '#F0F0F0';
  const textSecondary = '#C0C0C8';
  const textMuted = '#606068';
  const accent = '#FF3B30';
  const accentLight = '#FF6B60';
  const divider = 'rgba(255,255,255,0.06)';

  return (
    <div
      style={{
        width: w,
        height: h,
        background: bgGradient,
        display: 'flex',
        flexDirection: 'column',
        padding: pd,
        fontFamily:
          '"JetBrains Mono", "SF Mono", "Fira Code", "PingFang SC", "Microsoft YaHei", monospace',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* —— 顶部红色能量线 —— */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: isPortrait ? 2 : 1,
          background: `linear-gradient(90deg, transparent 0%, ${accent} 20%, ${accentLight} 50%, ${accent} 80%, transparent 100%)`,
          opacity: 0.8,
        }}
      />

      {/* —— 工程网格背景 —— */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* —— 头图区域 —— */}
      {data.coverUrl && (
        <div
          style={{
            width: '100%',
            height: isPortrait ? 180 : 80,
            marginBottom: isPortrait ? 16 : 8,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={data.coverUrl}
            alt="cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: `linear-gradient(to top, ${bg}, transparent)`,
            }}
          />
        </div>
      )}

      {/* —— 标题 + 算法标签行 —— */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: isPortrait ? 16 : 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: (isPortrait ? 36 : 18) * s,
              fontWeight: 800,
              color: text,
              margin: 0,
              lineHeight: 1.1,
              fontFamily:
                '"Inter", "Helvetica Neue", "PingFang SC", sans-serif',
              letterSpacing: isPortrait ? -0.5 : 0,
            }}
          >
            {data.title}
          </h1>
          {data.subtitle && (
            <p
              style={{
                fontSize: (isPortrait ? 13 : 9) * s,
                color: textMuted,
                margin: 0,
                marginTop: 4,
                letterSpacing: 1,
              }}
            >
              {data.subtitle}
            </p>
          )}
        </div>

        {/* 算法标签胶囊 */}
        <span
          style={{
            fontSize: (isPortrait ? 9 : 6) * s,
            color: accent,
            letterSpacing: 2,
            fontWeight: 700,
            border: `1px solid ${accent}40`,
            padding: isPortrait ? '4px 10px' : '2px 6px',
            flexShrink: 0,
          }}
        >
          {algoName} · {scaleLabel}
        </span>
      </div>

      {/* —— 表头 —— */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingBottom: isPortrait ? 6 : 3,
          marginBottom: isPortrait ? 2 : 1,
          borderBottom: `1px solid ${divider}`,
        }}
      >
        <div
          style={{
            width: isPortrait ? 48 : 28,
            fontSize: (isPortrait ? 7 : 5) * s,
            color: textMuted,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          #
        </div>
        <div
          style={{
            flex: 2,
            fontSize: (isPortrait ? 7 : 5) * s,
            color: textMuted,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          ITEM
        </div>
        {dims.map((dim, di) => (
          <div
            key={di}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <span
              style={{
                fontSize: (isPortrait ? 8 : 5) * s,
                color: text,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              [{dim.name}]
            </span>
            <span
              style={{
                fontSize: (isPortrait ? 6 : 4) * s,
                color: accent,
                fontWeight: 700,
              }}
            >
              w={dim.weight}
            </span>
          </div>
        ))}
        <div
          style={{
            width: isPortrait ? 64 : 40,
            textAlign: 'right',
            fontSize: (isPortrait ? 7 : 5) * s,
            color: textMuted,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          Σ
        </div>
      </div>

      {/* —— 数据矩阵体 —— */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {topN.map((entry, i) => {
          const ds = entry.dimensionScores ?? [];
          const isTop = i < 3;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                flex: 1,
                borderBottom:
                  i < topN.length - 1 ? `0.5px solid ${divider}` : 'none',
                position: 'relative',
              }}
            >
              {/* —— 排名徽章 —— */}
              <div
                style={{
                  width: isPortrait ? 48 : 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: isPortrait ? (isTop ? 22 : 14) : (isTop ? 14 : 10),
                    height: isPortrait ? (isTop ? 22 : 14) : (isTop ? 14 : 10),
                    backgroundColor: isTop ? accent : 'transparent',
                    border: isTop ? 'none' : `1px solid ${divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: (isPortrait ? (isTop ? 10 : 7) : (isTop ? 7 : 5)) * s,
                    fontWeight: 700,
                    color: isTop ? '#0A0A0E' : textMuted,
                  }}
                >
                  {entry.rank}
                </div>
              </div>

              {/* —— 名称 —— */}
              <div
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: (isPortrait ? 16 : 10) * s,
                  fontWeight: 600,
                  color: isTop ? text : textSecondary,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontFamily:
                    '"Inter", "Helvetica Neue", "PingFang SC", sans-serif',
                }}
              >
                {entry.name}
              </div>

              {/* —— 维度热力图单元格 —— */}
              {dims.map((dim, di) => {
                const dsItem = ds.find(s => s.name === dim.name);
                const scoreVal = dsItem?.score ?? 0;
                const maxVal = dimMaxScores[dim.name] || maxScale;
                const ratio = maxVal > 0 ? Math.min(1, scoreVal / maxVal) : 0;

                /* 热力图色阶 */
                let cellBg: string;
                let cellTextColor: string;
                let glow: string | undefined;

                if (ratio >= 0.9) {
                  cellBg = `${accent}22`;
                  cellTextColor = accent;
                  glow = `0 0 ${isPortrait ? 6 : 3}px ${accent}40`;
                } else if (ratio >= 0.7) {
                  cellBg = `${accentLight}18`;
                  cellTextColor = accentLight;
                } else if (ratio >= 0.4) {
                  cellBg = 'rgba(128,128,128,0.04)';
                  cellTextColor = textSecondary;
                } else {
                  cellBg = 'rgba(128,128,128,0.02)';
                  cellTextColor = textMuted;
                }

                return (
                  <div
                    key={di}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: cellBg,
                      boxShadow: glow,
                      margin: isPortrait ? '4px 2px' : '2px 1px',
                      borderRadius: isPortrait ? 2 : 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: (isPortrait ? 22 : 12) * s,
                        fontWeight: 800,
                        color: cellTextColor,
                        lineHeight: 1,
                      }}
                    >
                      {scoreVal.toFixed(1)}
                    </span>
                  </div>
                );
              })}

              {/* —— 综合得分 —— */}
              <div
                style={{
                  width: isPortrait ? 64 : 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: isPortrait ? 0 : 2,
                }}
              >
                <span
                  style={{
                    fontSize: (isPortrait ? 20 : 11) * s,
                    fontWeight: 800,
                    color: isTop ? accent : text,
                  }}
                >
                  {entry.score ?? '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* —— 底部信息栏 —— */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: isPortrait ? 10 : 5,
          marginTop: isPortrait ? 6 : 3,
          borderTop: `1px solid ${divider}`,
        }}
      >
        {/* 作者 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 8 : 4,
          }}
        >
          <div
            style={{
              width: isPortrait ? 28 : 16,
              height: isPortrait ? 28 : 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: (isPortrait ? 11 : 7) * s,
              color: accent,
              fontWeight: 700,
              border: `1px solid ${accent}40`,
            }}
          >
            {data.author.nickname.charAt(0)}
          </div>
          <span
            style={{
              fontSize: (isPortrait ? 11 : 7) * s,
              color: textSecondary,
              letterSpacing: 1,
              fontFamily:
                '"Inter", "Helvetica Neue", "PingFang SC", sans-serif',
            }}
          >
            {data.author.nickname}
          </span>
        </div>

        {/* 水印 */}
        <div
          style={{
            fontSize: (isPortrait ? 7 : 5) * s,
            color: 'rgba(255,59,48,0.06)',
            letterSpacing: 2,
          }}
        >
          {data.watermark}
        </div>

        {/* QR */}
        <QRSvg
          value={data.listUrl}
          size={isPortrait ? 72 : 40}
          fgColor={text}
          bgColor={'#181820'}
        />
      </div>
    </div>
  );
}

/* ============================================================
   模板渲染器 — 12 套模板用 DataMatrixLayout，data-tableau 用 HyperMatrixLayout
   ============================================================ */

/* —— 1. rice-ink 宣纸水墨 —— */
function RiceInkCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['rice-ink']} />;
}

/* —— 2. morandi 莫兰迪 —— */
function MorandiCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES.morandi} />;
}

/* —— 3. cyber-neon 赛博霓虹 —— */
function CyberNeonCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['cyber-neon']} />;
}

/* —— 4. retro-magazine 复古杂志 —— */
function RetroMagazineCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['retro-magazine']} />;
}

/* —— 5. minimal-white 极简留白 —— */
function MinimalWhiteCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['minimal-white']} />;
}

/* —— 6. sticker-journal 手账贴纸 —— */
function StickerJournalCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['sticker-journal']} />;
}

/* —— 7. glass-morphism 毛玻璃 —— */
function GlassMorphismCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['glass-morphism']} />;
}

/* —— 8. brutalist 野兽派 —— */
function BrutalistCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES.brutalist} />;
}

/* —— 9. paper-fold 折纸手账 —— */
function PaperFoldCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['paper-fold']} />;
}

/* —— 10. cosmic-dust 宇宙星尘 —— */
function CosmicDustCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['cosmic-dust']} />;
}

/* —— 11. vaporwave 蒸汽波 —— */
function VaporwaveCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES.vaporwave} />;
}

/* —— 12. grid-poster 网格海报 —— */
function GridPosterCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <DataMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} theme={THEMES['grid-poster']} />;
}

/* —— 13. data-tableau 数据矩阵 —— */
function DataTableauCard({ data, orientation, fontSizeScale = 1 }: { data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }) {
  return <HyperMatrixLayout data={data} orientation={orientation} fontSizeScale={fontSizeScale} />;
}

const TEMPLATE_MAP: Record<CardTemplateId, React.FC<{ data: ShareCardData; orientation: CardOrientation; fontSizeScale?: number }>> = {
  'rice-ink': RiceInkCard,
  morandi: MorandiCard,
  'cyber-neon': CyberNeonCard,
  'retro-magazine': RetroMagazineCard,
  'minimal-white': MinimalWhiteCard,
  'sticker-journal': StickerJournalCard,
  'glass-morphism': GlassMorphismCard,
  brutalist: BrutalistCard,
  'paper-fold': PaperFoldCard,
  'cosmic-dust': CosmicDustCard,
  vaporwave: VaporwaveCard,
  'grid-poster': GridPosterCard,
  'data-tableau': DataTableauCard,
};

export function ShareCard({ template, orientation, data, width, height, accentHue = 0, fontSizeScale = 1 }: ShareCardProps) {
  const size = CARD_SIZES[orientation];
  const w = width ?? size.w;
  const h = height ?? size.h;
  const Template = TEMPLATE_MAP[template];

  return (
    <div style={{ width: w, height: h, display: 'flex', flexDirection: 'column', filter: accentHue !== 0 ? `hue-rotate(${accentHue}deg)` : 'none' } as React.CSSProperties}>
      <Template data={data} orientation={orientation} fontSizeScale={fontSizeScale} />
    </div>
  );
}

/** 获取所有可用模板的元信息 */
export function getTemplateList(): Array<{ id: CardTemplateId; name: string; description: string }> {
  return [
    { id: 'rice-ink', name: '宣纸水墨', description: '传统宣纸质感，朱砂点缀' },
    { id: 'morandi', name: '莫兰迪', description: '低饱和度柔色系，温和治愈' },
    { id: 'cyber-neon', name: '赛博霓虹', description: '深底霓虹光感，未来感十足' },
    { id: 'retro-magazine', name: '复古杂志', description: '报刊排版，衬线字体' },
    { id: 'minimal-white', name: '极简白', description: '大量留白，轻线条' },
    { id: 'sticker-journal', name: '手账贴纸', description: '手写风+贴纸装饰' },
    { id: 'glass-morphism', name: '毛玻璃', description: '半透明玻璃质感，渐变色块叠加，柔光氛围' },
    { id: 'brutalist', name: '野兽派', description: '纯黑白+亮黄强调，粗边框硬阴影，无圆角冲击力' },
    { id: 'paper-fold', name: '折纸质感', description: '暖色纸感，折痕阴影分割，倾斜标签+手写体' },
    { id: 'cosmic-dust', name: '宇宙星尘', description: '深空渐变，星光粒子点阵，发光银河水印' },
    { id: 'vaporwave', name: '蒸汽波', description: '粉紫渐变，网格+太阳，日文假名装饰，80s retro' },
    { id: 'grid-poster', name: '网格海报', description: '瑞士平面设计，严格网格系统，不对称大字排版' },
    { id: 'data-tableau', name: '数据矩阵', description: '热力图数据矩阵 — 维度×条目全览，权重可视化，前卫工程蓝图' },
  ];
}
