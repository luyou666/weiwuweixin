/* ============================================================
   围物为心 — PNG 分享卡 JSX 模板
   6 套模板 · satori 兼容（inline style only，无 tailwind）
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
  | 'sticker-journal';

export interface ShareCardEntry {
  rank: number;
  name: string;
  score?: string;
  note?: string;
}

export interface ShareCardData {
  title: string;
  subtitle?: string;
  entries: ShareCardEntry[];
  author: { nickname: string; avatarUrl?: string };
  listUrl: string;
  logoUrl?: string;
  watermark?: string;
}

export interface ShareCardProps {
  /** 模板 ID */
  template: CardTemplateId;
  /** 竖版 / 横版 */
  orientation: CardOrientation;
  /** 卡片数据 */
  data: ShareCardData;
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
    textMuted: '#9090A4',
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
  
  let rects: string[] = [];
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      if (modules[y * 25 + x]) {
        rects.push(
          `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fgColor || '#1A1A24'}" />`
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
      dangerouslySetInnerHTML={{
        __html: `
          <rect width="${actualSize}" height="${actualSize}" fill="${bgColor || '#FFFFFF'}" rx="4" />
          ${rects.join('\n')}
        `,
      }}
    />
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
   装饰性 SVG 元素
   ============================================================ */

/** 水墨印章 — 用于 rice-ink 模板 */
function InkSeal({ size = 48, color = '#E2553F' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }}>
      <rect x="2" y="2" width="44" height="44" rx="4" fill="none" stroke={color} strokeWidth="2.5" />
      <rect x="6" y="6" width="36" height="36" rx="2" fill={color} opacity="0.12" />
      {/* 印章文字 "心" */}
      <text
        x="24"
        y="32"
        textAnchor="middle"
        fill={color}
        fontSize="20"
        fontFamily='"Songti SC", "SimSun", serif'
        fontWeight="700"
      >
        心
      </text>
    </svg>
  );
}

/** 赛博霓虹装饰线 */
function NeonLine({ width, color = '#00FFC8' }: { width: number; color?: string }) {
  return (
    <svg width={width} height="2" viewBox={`0 0 ${width} 2`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`neon-${color.replace('#', '')}`} x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={width} height="2" fill={`url(#neon-${color.replace('#', '')})`} />
    </svg>
  );
}

/** 贴纸装饰元素 */
function StickerDecor({ type, color }: { type: 'star' | 'circle' | 'heart' | 'dash'; color: string }) {
  const size = 20;
  if (type === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'block' }}>
        <polygon
          points="10,1 12.5,7.5 19,7.5 14,12 16,19 10,15 4,19 6,12 1,7.5 7.5,7.5"
          fill={color}
          opacity="0.6"
        />
      </svg>
    );
  }
  if (type === 'circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'block' }}>
        <circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
      </svg>
    );
  }
  if (type === 'heart') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'block' }}>
        <path
          d="M10 18s-7-5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 17 8c0 5-7 10-7 10z"
          fill={color}
          opacity="0.4"
        />
      </svg>
    );
  }
  // dash — 小横线
  return (
    <div
      style={{
        width: '16px',
        height: '3px',
        backgroundColor: color,
        opacity: 0.4,
        borderRadius: '2px',
        transform: 'rotate(-12deg)',
      }}
    />
  );
}

/* ============================================================
   模板渲染器
   ============================================================ */

/* —— 1. rice-ink 宣纸水墨 —— */
function RiceInkCard({ data, orientation }: { data: ShareCardData; orientation: CardOrientation }) {
  const t = THEMES['rice-ink'];
  const isPortrait = orientation === 'portrait';
  const w = isPortrait ? 1080 : 1200;
  const h = isPortrait ? 1920 : 675;
  const pd = isPortrait ? 80 : 50; // padding
  const topN = data.entries.slice(0, isPortrait ? 5 : 3);

  return (
    <div style={{
      width: w, height: h,
      background: t.bgGradient,
      display: 'flex', flexDirection: 'column',
      padding: pd,
      fontFamily: t.fontFamily,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 水墨晕染背景装饰 */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: w * 0.5, height: h * 0.4,
        background: 'radial-gradient(ellipse at 70% 30%, rgba(26,26,36,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: w * 0.4, height: h * 0.3,
        background: 'radial-gradient(ellipse at 30% 70%, rgba(226,85,63,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* 头部区域 */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: isPortrait ? 32 : 16 }}>
        {/* 朱砂竖线装饰 */}
        <div style={{ width: 4, height: isPortrait ? 48 : 32, backgroundColor: t.accent, borderRadius: 2, marginBottom: 12 }} />
        <h1 style={{
          fontSize: isPortrait ? 52 : 32,
          fontWeight: 700,
          color: t.text,
          margin: 0,
          lineHeight: 1.2,
          fontFamily: t.titleFont,
          letterSpacing: isPortrait ? 4 : 1,
        }}>
          {data.title}
        </h1>
        {data.subtitle && (
          <p style={{
            fontSize: isPortrait ? 22 : 15,
            color: t.textMuted,
            margin: 0,
            marginTop: 8,
            lineHeight: 1.5,
            fontFamily: t.titleFont,
          }}>
            {data.subtitle}
          </p>
        )}
      </div>

      {/* 排名列表 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isPortrait ? 16 : 10 }}>
        {topN.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 20 : 14,
            paddingTop: isPortrait ? 14 : 10,
            paddingBottom: isPortrait ? 14 : 10,
            borderBottom: i < topN.length - 1 ? `1px solid ${t.divider}` : 'none',
          }}>
            {/* 排名徽章 */}
            <div style={{
              width: isPortrait ? 44 : 32,
              height: isPortrait ? 44 : 32,
              borderRadius: '50%',
              backgroundColor: i < 3 ? t.rankBadgeBg : t.divider,
              color: i < 3 ? t.rankBadgeText : t.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isPortrait ? 20 : 14,
              fontWeight: 700,
              fontFamily: t.fontFamily,
              flexShrink: 0,
            }}>
              {entry.rank}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: isPortrait ? 28 : 18,
                fontWeight: 600,
                color: t.text,
                fontFamily: t.titleFont,
              }}>
                {entry.name}
              </span>
              {entry.note && (
                <span style={{
                  fontSize: isPortrait ? 16 : 12,
                  color: t.textMuted,
                  marginTop: 2,
                }}>
                  {entry.note}
                </span>
              )}
            </div>
            {entry.score && (
              <span style={{
                fontSize: isPortrait ? 24 : 16,
                fontWeight: 600,
                color: t.accent,
                fontFamily: t.fontFamily,
              }}>
                {entry.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 底部信息区 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: isPortrait ? 24 : 16,
        borderTop: `1px solid ${t.divider}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 头像占位 */}
          <div style={{
            width: isPortrait ? 48 : 36,
            height: isPortrait ? 48 : 36,
            borderRadius: '50%',
            backgroundColor: 'rgba(226,85,63,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isPortrait ? 20 : 14,
            color: t.accent,
            fontFamily: t.titleFont,
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {data.author.nickname.charAt(0)}
          </div>
          <span style={{
            fontSize: isPortrait ? 18 : 13,
            color: t.textSecondary,
          }}>
            {data.author.nickname}
          </span>
        </div>
        <QRSvg value={data.listUrl} size={isPortrait ? 120 : 80} fgColor={t.text} bgColor={t.qrBg} />
      </div>

      {/* 产品 Logo + 水印 */}
      <div style={{
        position: 'absolute',
        bottom: pd,
        left: pd,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: 0.6,
      }}>
        <InkSeal size={isPortrait ? 28 : 20} color={t.accent} />
        <span style={{
          fontSize: isPortrait ? 14 : 10,
          color: t.textMuted,
          letterSpacing: 2,
        }}>
          围物为心
        </span>
      </div>

      {/* 背景水印 */}
      <div style={{
        position: 'absolute',
        right: pd,
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: isPortrait ? 200 : 100,
        color: t.watermarkColor,
        fontFamily: t.titleFont,
        fontWeight: 700,
        pointerEvents: 'none',
        lineHeight: 1,
      }}>
        {data.watermark || '心'}
      </div>
    </div>
  );
}

/* —— 2. morandi 莫兰迪 —— */
function MorandiCard({ data, orientation }: { data: ShareCardData; orientation: CardOrientation }) {
  const t = THEMES.morandi;
  const isPortrait = orientation === 'portrait';
  const w = isPortrait ? 1080 : 1200;
  const h = isPortrait ? 1920 : 675;
  const pd = isPortrait ? 80 : 50;
  const topN = data.entries.slice(0, isPortrait ? 5 : 3);

  return (
    <div style={{
      width: w, height: h,
      background: t.bgGradient,
      display: 'flex', flexDirection: 'column',
      padding: pd,
      fontFamily: t.fontFamily,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 柔和色块装饰 */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 280, height: 280,
        borderRadius: '50%',
        background: 'rgba(166,139,122,0.15)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 80, left: -60,
        width: 200, height: 200,
        borderRadius: '50%',
        background: 'rgba(196,175,160,0.12)',
        pointerEvents: 'none',
      }} />

      {/* 标题 */}
      <div style={{ marginBottom: isPortrait ? 40 : 20 }}>
        <div style={{
          fontSize: isPortrait ? 16 : 11,
          color: t.accent,
          textTransform: 'uppercase',
          letterSpacing: 4,
          marginBottom: 8,
          fontWeight: 500,
        }}>
          围物为心 · 莫兰迪
        </div>
        <h1 style={{
          fontSize: isPortrait ? 48 : 28,
          fontWeight: 600,
          color: t.text,
          margin: 0,
          lineHeight: 1.3,
          fontFamily: t.titleFont,
        }}>
          {data.title}
        </h1>
        {data.subtitle && (
          <p style={{
            fontSize: isPortrait ? 20 : 14,
            color: t.textMuted,
            margin: 0,
            marginTop: 8,
          }}>
            {data.subtitle}
          </p>
        )}
      </div>

      {/* 排名卡片 — 莫兰迪色圆角卡 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isPortrait ? 12 : 8 }}>
        {topN.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 16 : 10,
            padding: isPortrait ? '14px 20px' : '8px 14px',
            backgroundColor: t.cardBg,
            borderRadius: isPortrait ? 16 : 10,
            border: `1px solid ${t.cardBorder}`,
          }}>
            <div style={{
              width: isPortrait ? 36 : 26,
              height: isPortrait ? 36 : 26,
              borderRadius: '50%',
              backgroundColor: i < 3 ? t.accent : 'rgba(166,139,122,0.2)',
              color: i < 3 ? t.rankBadgeText : t.textMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isPortrait ? 16 : 12,
              fontWeight: 600,
              flexShrink: 0,
            }}>
              {entry.rank}
            </div>
            <span style={{
              flex: 1,
              fontSize: isPortrait ? 24 : 16,
              color: t.text,
              fontWeight: 500,
            }}>
              {entry.name}
            </span>
            {entry.note && (
              <span style={{
                fontSize: isPortrait ? 14 : 10,
                color: t.textMuted,
              }}>
                {entry.note}
              </span>
            )}
            {entry.score && (
              <span style={{
                fontSize: isPortrait ? 20 : 14,
                fontWeight: 600,
                color: t.accent,
              }}>
                {entry.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 底部 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: isPortrait ? 24 : 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: isPortrait ? 44 : 32,
            height: isPortrait ? 44 : 32,
            borderRadius: '50%',
            backgroundColor: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isPortrait ? 18 : 13,
            color: t.rankBadgeText,
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {data.author.nickname.charAt(0)}
          </div>
          <span style={{ fontSize: isPortrait ? 16 : 12, color: t.textSecondary }}>
            {data.author.nickname}
          </span>
        </div>
        <QRSvg value={data.listUrl} size={isPortrait ? 110 : 72} fgColor={t.text} bgColor={t.qrBg} />
      </div>

      {/* 水印 */}
      <div style={{
        position: 'absolute', right: pd, top: '50%',
        transform: 'translateY(-50%)',
        fontSize: isPortrait ? 180 : 90,
        color: t.watermarkColor,
        fontFamily: t.titleFont,
        fontWeight: 700,
        pointerEvents: 'none',
      }}>
        {data.watermark || '心'}
      </div>
    </div>
  );
}

/* —— 3. cyber-neon 赛博霓虹 —— */
function CyberNeonCard({ data, orientation }: { data: ShareCardData; orientation: CardOrientation }) {
  const t = THEMES['cyber-neon'];
  const isPortrait = orientation === 'portrait';
  const w = isPortrait ? 1080 : 1200;
  const h = isPortrait ? 1920 : 675;
  const pd = isPortrait ? 80 : 50;
  const topN = data.entries.slice(0, isPortrait ? 5 : 3);

  return (
    <div style={{
      width: w, height: h,
      background: t.bgGradient,
      display: 'flex', flexDirection: 'column',
      padding: pd,
      fontFamily: t.fontFamily,
      position: 'relative',
      overflow: 'hidden',
      color: t.text,
    }}>
      {/* 霓虹网格线装饰 */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(0,255,200,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* 霓虹光晕 */}
      <div style={{
        position: 'absolute', top: -100, left: '30%',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,200,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, right: '10%',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(100,100,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* 标题区域 */}
      <div style={{ marginBottom: isPortrait ? 32 : 16 }}>
        <div style={{
          fontSize: isPortrait ? 14 : 10,
          color: t.accent,
          letterSpacing: 6,
          marginBottom: 8,
          fontWeight: 500,
          fontFamily: t.titleFont,
        }}>
          围物为心 // CYBER NEON
        </div>
        <h1 style={{
          fontSize: isPortrait ? 48 : 28,
          fontWeight: 700,
          color: t.text,
          margin: 0,
          lineHeight: 1.2,
          fontFamily: t.titleFont,
          letterSpacing: 2,
        }}>
          {data.title}
        </h1>
        {data.subtitle && (
          <p style={{
            fontSize: isPortrait ? 18 : 13,
            color: t.textSecondary,
            margin: 0,
            marginTop: 8,
          }}>
            {data.subtitle}
          </p>
        )}
        <NeonLine width={isPortrait ? 200 : 140} color={t.accent} />
      </div>

      {/* 排名列表 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isPortrait ? 14 : 8 }}>
        {topN.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 16 : 10,
            padding: isPortrait ? '12px 20px' : '8px 14px',
            backgroundColor: t.cardBg,
            borderRadius: isPortrait ? 10 : 6,
            border: `1px solid ${i < 3 ? t.accent : t.cardBorder}`,
            borderLeft: i < 3 ? `3px solid ${t.accent}` : `1px solid ${t.cardBorder}`,
          }}
          >
            <div style={{
              width: isPortrait ? 36 : 26,
              fontFamily: t.titleFont,
              fontSize: isPortrait ? 18 : 12,
              fontWeight: 700,
              color: i < 3 ? t.accent : t.textMuted,
              flexShrink: 0,
            }}>
              #{entry.rank}
            </div>
            <span style={{
              flex: 1,
              fontSize: isPortrait ? 24 : 16,
              fontWeight: i < 3 ? 600 : 400,
              color: i < 3 ? '#FFFFFF' : t.textSecondary,
            }}>
              {entry.name}
            </span>
            {entry.note && (
              <span style={{ fontSize: isPortrait ? 14 : 10, color: t.textMuted }}>
                {entry.note}
              </span>
            )}
            {entry.score && (
              <span style={{
                fontSize: isPortrait ? 22 : 14,
                fontWeight: 700,
                color: i < 3 ? t.accent : t.textMuted,
                fontFamily: t.titleFont,
              }}>
                {entry.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 底部 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: isPortrait ? 24 : 14,
        borderTop: `1px solid ${t.divider}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: isPortrait ? 44 : 32,
            height: isPortrait ? 44 : 32,
            borderRadius: '50%',
            border: `2px solid ${t.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isPortrait ? 18 : 13,
            color: t.accent,
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {data.author.nickname.charAt(0)}
          </div>
          <span style={{ fontSize: isPortrait ? 16 : 12, color: t.textSecondary }}>
            {data.author.nickname}
          </span>
        </div>
        <QRSvg value={data.listUrl} size={isPortrait ? 110 : 72} fgColor={t.accent} bgColor={t.qrBg} />
      </div>

      {/* 水印 */}
      <div style={{
        position: 'absolute', right: pd, top: '50%',
        transform: 'translateY(-50%)',
        fontSize: isPortrait ? 180 : 90,
        color: t.watermarkColor,
        fontFamily: t.titleFont,
        fontWeight: 700,
        pointerEvents: 'none',
        letterSpacing: 8,
      }}>
        {data.watermark || 'WWX'}
      </div>
    </div>
  );
}

/* —— 4. retro-magazine 复古杂志 —— */
function RetroMagazineCard({ data, orientation }: { data: ShareCardData; orientation: CardOrientation }) {
  const t = THEMES['retro-magazine'];
  const isPortrait = orientation === 'portrait';
  const w = isPortrait ? 1080 : 1200;
  const h = isPortrait ? 1920 : 675;
  const pd = isPortrait ? 80 : 50;
  const topN = data.entries.slice(0, isPortrait ? 5 : 3);

  return (
    <div style={{
      width: w, height: h,
      background: t.bgGradient,
      display: 'flex', flexDirection: 'column',
      padding: pd,
      fontFamily: t.fontFamily,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 报刊双栏线装饰 */}
      <div style={{
        position: 'absolute', top: pd, left: pd, right: pd,
        height: 2,
        backgroundColor: t.text,
        opacity: 0.15,
      }} />
      <div style={{
        position: 'absolute', top: pd + 4, left: pd, right: pd,
        height: 1,
        backgroundColor: t.text,
        opacity: 0.08,
      }} />

      {/* 顶部刊头 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isPortrait ? 24 : 12,
        marginTop: isPortrait ? 20 : 8,
      }}>
        <span style={{
          fontSize: isPortrait ? 12 : 9,
          color: t.textMuted,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}>
          围物为心 · 周刊
        </span>
        <span style={{
          fontSize: isPortrait ? 12 : 9,
          color: t.textMuted,
          letterSpacing: 1,
        }}>
          Vol.{String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}
        </span>
      </div>

      {/* 标题 — 大号衬线体 */}
      <div style={{ marginBottom: isPortrait ? 36 : 18 }}>
        <h1 style={{
          fontSize: isPortrait ? 56 : 34,
          fontWeight: 700,
          color: t.text,
          margin: 0,
          lineHeight: 1.15,
          fontFamily: t.titleFont,
          letterSpacing: 2,
          textAlign: 'center',
        }}>
          {data.title}
        </h1>
        {data.subtitle && (
          <p style={{
            fontSize: isPortrait ? 18 : 13,
            color: t.textMuted,
            margin: 0,
            marginTop: 8,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            ── {data.subtitle} ──
          </p>
        )}
        <div style={{
          width: isPortrait ? 120 : 60,
          height: 3,
          backgroundColor: t.accent,
          margin: `${isPortrait ? 16 : 8}px auto 0`,
        }} />
      </div>

      {/* 排名列表 — 报刊风格 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {topN.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 20 : 12,
            padding: `${isPortrait ? 14 : 8}px 0`,
            borderBottom: `1px solid ${t.divider}`,
          }}>
            <span style={{
              fontSize: isPortrait ? 36 : 22,
              fontWeight: 700,
              color: i < 3 ? t.accent : t.textMuted,
              fontFamily: '"Georgia", serif',
              width: isPortrait ? 48 : 32,
              flexShrink: 0,
              lineHeight: 1,
            }}>
              {entry.rank}.
            </span>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: isPortrait ? 24 : 16,
                fontWeight: 600,
                color: t.text,
                fontFamily: t.titleFont,
              }}>
                {entry.name}
              </span>
              {entry.note && (
                <span style={{
                  fontSize: isPortrait ? 14 : 10,
                  color: t.textMuted,
                  marginLeft: 8,
                  fontStyle: 'italic',
                }}>
                  — {entry.note}
                </span>
              )}
            </div>
            {entry.score && (
              <span style={{
                fontSize: isPortrait ? 22 : 14,
                fontWeight: 700,
                color: i < 3 ? t.accent : t.textSecondary,
                fontFamily: '"Georgia", serif',
              }}>
                {entry.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 底部 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: isPortrait ? 24 : 14,
        borderTop: `2px solid ${t.text}`,
        opacity: 0.15,
        marginTop: isPortrait ? 20 : 10,
      }}>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: isPortrait ? -24 : -14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: isPortrait ? 44 : 32,
            height: isPortrait ? 44 : 32,
            borderRadius: '50%',
            backgroundColor: t.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isPortrait ? 18 : 13,
            color: t.bg,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {data.author.nickname.charAt(0)}
          </div>
          <div>
            <span style={{ fontSize: isPortrait ? 16 : 12, color: t.text, fontWeight: 600 }}>
              {data.author.nickname}
            </span>
            <span style={{ fontSize: isPortrait ? 12 : 9, color: t.textMuted, marginLeft: 8 }}>
              撰文
            </span>
          </div>
        </div>
        <QRSvg value={data.listUrl} size={isPortrait ? 100 : 66} fgColor={t.text} bgColor={t.qrBg} />
      </div>

      {/* 水印 */}
      <div style={{
        position: 'absolute', right: pd, top: '50%',
        transform: 'translateY(-50%) rotate(-15deg)',
        fontSize: isPortrait ? 160 : 80,
        color: t.watermarkColor,
        fontFamily: '"Georgia", serif',
        fontWeight: 700,
        pointerEvents: 'none',
        letterSpacing: 10,
      }}>
        围物为心
      </div>
    </div>
  );
}

/* —— 5. minimal-white 极简白 —— */
function MinimalWhiteCard({ data, orientation }: { data: ShareCardData; orientation: CardOrientation }) {
  const t = THEMES['minimal-white'];
  const isPortrait = orientation === 'portrait';
  const w = isPortrait ? 1080 : 1200;
  const h = isPortrait ? 1920 : 675;
  const pd = isPortrait ? 80 : 50;
  const topN = data.entries.slice(0, isPortrait ? 5 : 3);

  return (
    <div style={{
      width: w, height: h,
      background: t.bgGradient,
      display: 'flex', flexDirection: 'column',
      padding: pd,
      fontFamily: t.fontFamily,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 细线装饰 */}
      <div style={{
        position: 'absolute', top: pd + 30, left: pd,
        width: isPortrait ? 40 : 24,
        height: 2,
        backgroundColor: t.accent,
      }} />

      {/* 大量留白 + 标题 */}
      <div style={{
        marginTop: isPortrait ? 60 : 30,
        marginBottom: isPortrait ? 48 : 24,
      }}>
        <h1 style={{
          fontSize: isPortrait ? 44 : 28,
          fontWeight: 300,
          color: t.text,
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: 2,
        }}>
          {data.title}
        </h1>
        {data.subtitle && (
          <p style={{
            fontSize: isPortrait ? 18 : 13,
            color: t.textMuted,
            margin: 0,
            marginTop: 12,
            fontWeight: 300,
          }}>
            {data.subtitle}
          </p>
        )}
      </div>

      {/* 排名列表 — 轻线条 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {topN.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 20 : 14,
            padding: `${isPortrait ? 18 : 10}px 0`,
            borderBottom: `1px solid ${t.divider}`,
          }}>
            <span style={{
              fontSize: isPortrait ? 14 : 10,
              fontWeight: 400,
              color: t.textMuted,
              width: isPortrait ? 30 : 20,
              flexShrink: 0,
            }}>
              {String(entry.rank).padStart(2, '0')}
            </span>
            <span style={{
              flex: 1,
              fontSize: isPortrait ? 24 : 16,
              fontWeight: 400,
              color: t.text,
              letterSpacing: 1,
            }}>
              {entry.name}
            </span>
            {entry.note && (
              <span style={{
                fontSize: isPortrait ? 13 : 9,
                color: t.textMuted,
                fontWeight: 300,
              }}>
                {entry.note}
              </span>
            )}
            {entry.score && (
              <span style={{
                fontSize: isPortrait ? 20 : 13,
                fontWeight: 300,
                color: i < 3 ? t.accent : t.textMuted,
              }}>
                {entry.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 底部极简 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: isPortrait ? 32 : 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: isPortrait ? 32 : 24,
            height: isPortrait ? 32 : 24,
            borderRadius: '50%',
            border: `1px solid ${t.textMuted}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isPortrait ? 13 : 10,
            color: t.textMuted,
            flexShrink: 0,
          }}>
            {data.author.nickname.charAt(0)}
          </div>
          <span style={{ fontSize: isPortrait ? 14 : 10, color: t.textMuted, fontWeight: 300 }}>
            {data.author.nickname}
          </span>
        </div>
        <QRSvg value={data.listUrl} size={isPortrait ? 90 : 60} fgColor={t.textMuted} bgColor={t.qrBg} />
      </div>

      {/* 水印 — 极淡 */}
      <div style={{
        position: 'absolute', right: pd, bottom: pd,
        fontSize: isPortrait ? 10 : 8,
        color: 'rgba(144,144,164,0.3)',
        letterSpacing: 2,
      }}>
        围物为心
      </div>
    </div>
  );
}

/* —— 6. sticker-journal 手账贴纸 —— */
function StickerJournalCard({ data, orientation }: { data: ShareCardData; orientation: CardOrientation }) {
  const t = THEMES['sticker-journal'];
  const isPortrait = orientation === 'portrait';
  const w = isPortrait ? 1080 : 1200;
  const h = isPortrait ? 1920 : 675;
  const pd = isPortrait ? 80 : 50;
  const topN = data.entries.slice(0, isPortrait ? 5 : 3);

  const stickerColors = [t.accent, '#E2553F', '#7FB3A3', '#3B4A8C', '#F4B860'];
  const stickerTypes: Array<'star' | 'circle' | 'heart' | 'dash'> = ['star', 'circle', 'heart', 'dash'];

  return (
    <div style={{
      width: w, height: h,
      background: t.bgGradient,
      display: 'flex', flexDirection: 'column',
      padding: pd,
      fontFamily: t.fontFamily,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 和纸胶带装饰 — 顶部 */}
      <div style={{
        position: 'absolute', top: 0, left: pd * 1.5,
        width: isPortrait ? 200 : 120,
        height: 18,
        backgroundColor: 'rgba(232,139,48,0.5)',
        transform: 'rotate(-2deg)',
        opacity: 0.7,
      }} />
      <div style={{
        position: 'absolute', top: 8, right: pd * 1.2,
        width: isPortrait ? 140 : 80,
        height: 14,
        backgroundColor: 'rgba(127,179,163,0.5)',
        transform: 'rotate(3deg)',
        opacity: 0.7,
      }} />

      {/* 散落贴纸装饰 */}
      <div style={{ position: 'absolute', top: pd * 0.8, right: pd }}>
        <StickerDecor type="star" color={stickerColors[0]} />
      </div>
      <div style={{ position: 'absolute', top: pd * 2.5, right: pd * 0.5 }}>
        <StickerDecor type="heart" color={stickerColors[2]} />
      </div>
      <div style={{ position: 'absolute', bottom: pd * 3, left: pd * 0.3 }}>
        <StickerDecor type="circle" color={stickerColors[3]} />
      </div>

      {/* 标题 — 手写风格感 */}
      <div style={{ marginBottom: isPortrait ? 32 : 16 }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 16px',
          backgroundColor: 'rgba(232,139,48,0.15)',
          borderRadius: 20,
          marginBottom: 12,
        }}>
          <span style={{
            fontSize: isPortrait ? 14 : 10,
            color: t.accent,
            letterSpacing: 2,
          }}>
            ✦ 围物为心 ✦
          </span>
        </div>
        <h1 style={{
          fontSize: isPortrait ? 48 : 28,
          fontWeight: 600,
          color: t.text,
          margin: 0,
          lineHeight: 1.3,
          fontFamily: t.titleFont,
        }}>
          {data.title}
        </h1>
        {data.subtitle && (
          <p style={{
            fontSize: isPortrait ? 18 : 13,
            color: t.textMuted,
            margin: 0,
            marginTop: 6,
            fontStyle: 'italic',
          }}>
            {data.subtitle}
          </p>
        )}
        <StickerDecor type="dash" color={t.accent} />
      </div>

      {/* 排名列表 — 便签风格 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isPortrait ? 10 : 6 }}>
        {topN.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 16 : 10,
            padding: isPortrait ? '12px 18px' : '8px 12px',
            backgroundColor: i === 0 ? 'rgba(232,139,48,0.08)' : 'rgba(255,254,248,0.8)',
            borderRadius: isPortrait ? 12 : 8,
            border: `2px solid ${i < 3 ? t.accent : 'rgba(232,220,192,0.6)'}`,
            borderStyle: i < 3 ? 'solid' : 'dashed',
            transform: i % 2 === 0 ? 'rotate(0deg)' : 'rotate(-0.5deg)',
          }}>
            <div style={{
              width: isPortrait ? 32 : 24,
              height: isPortrait ? 32 : 24,
              borderRadius: '50%',
              backgroundColor: stickerColors[i % stickerColors.length],
              opacity: 0.2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isPortrait ? 14 : 10,
              fontWeight: 700,
              color: t.text,
              flexShrink: 0,
              position: 'relative',
            }}>
              <span style={{ position: 'relative', zIndex: 1, color: i < 3 ? '#FFFFFF' : t.text }}>
                {entry.rank}
              </span>
            </div>
            <span style={{
              flex: 1,
              fontSize: isPortrait ? 22 : 15,
              fontWeight: i < 3 ? 600 : 400,
              color: t.text,
            }}>
              {entry.name}
            </span>
            {entry.note && (
              <span style={{
                fontSize: isPortrait ? 13 : 9,
                color: t.textMuted,
                fontStyle: 'italic',
              }}>
                {entry.note}
              </span>
            )}
            {entry.score && (
              <span style={{
                fontSize: isPortrait ? 18 : 12,
                fontWeight: 600,
                color: i < 3 ? t.accent : t.textSecondary,
              }}>
                {entry.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 底部 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: isPortrait ? 24 : 14,
        borderTop: `2px dashed ${t.divider}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: isPortrait ? 44 : 32,
            height: isPortrait ? 44 : 32,
            borderRadius: '50%',
            backgroundColor: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isPortrait ? 18 : 13,
            color: '#FFFFFF',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {data.author.nickname.charAt(0)}
          </div>
          <div>
            <span style={{ fontSize: isPortrait ? 16 : 12, color: t.text, fontWeight: 600 }}>
              {data.author.nickname}
            </span>
            <span style={{ fontSize: isPortrait ? 12 : 9, color: t.textMuted, marginLeft: 6 }}>
              的榜单
            </span>
          </div>
        </div>
        <QRSvg value={data.listUrl} size={isPortrait ? 110 : 72} fgColor={t.text} bgColor={t.qrBg} />
      </div>

      {/* 水印 */}
      <div style={{
        position: 'absolute', right: pd, top: '50%',
        transform: 'translateY(-50%) rotate(5deg)',
        fontSize: isPortrait ? 160 : 80,
        color: t.watermarkColor,
        fontFamily: t.titleFont,
        fontWeight: 700,
        pointerEvents: 'none',
      }}>
        {data.watermark || '心'}
      </div>
    </div>
  );
}

/* ============================================================
   主出口组件
   ============================================================ */

const TEMPLATE_MAP: Record<CardTemplateId, React.FC<{ data: ShareCardData; orientation: CardOrientation }>> = {
  'rice-ink': RiceInkCard,
  morandi: MorandiCard,
  'cyber-neon': CyberNeonCard,
  'retro-magazine': RetroMagazineCard,
  'minimal-white': MinimalWhiteCard,
  'sticker-journal': StickerJournalCard,
};

export function ShareCard({ template, orientation, data, width, height }: ShareCardProps) {
  const size = CARD_SIZES[orientation];
  const w = width ?? size.w;
  const h = height ?? size.h;
  const Template = TEMPLATE_MAP[template];

  return (
    <div style={{ width: w, height: h }}>
      <Template data={data} orientation={orientation} />
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
  ];
}