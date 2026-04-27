/* ============================================================
   围物为心 — PNG 分享卡导出引擎
   satori + @resvg/resvg-js 纯客户端渲染
   
   ⚠️ 此文件必须仅在客户端动态导入！
   使用 dynamic import: const { exportCard } = await import('@/lib/export-card')
   ============================================================ */

import satori from 'satori';
import type { CardTemplateId, CardOrientation, ShareCardData } from '@weiwuweixin/ui';
import React from 'react';

/* ---------- 常量 ---------- */

export const CARD_SIZES: Record<CardOrientation, { w: number; h: number }> = {
  portrait: { w: 1080, h: 1920 },
  landscape: { w: 1200, h: 675 },
};

/* ---------- 类型 ---------- */

export interface ExportCardOptions {
  template: CardTemplateId;
  orientation: CardOrientation;
  data: ShareCardData;
  scale?: number;
  format?: 'png' | 'svg';
}

export interface ExportCardResult {
  data: ArrayBuffer | string;
  mimeType: string;
  width: number;
  height: number;
  extension: string;
}

/* ---------- 字体加载 ---------- */

const FONT_CACHE = new Map<string, ArrayBuffer>();

async function loadFont(url: string, cacheKey: string): Promise<ArrayBuffer> {
  if (FONT_CACHE.has(cacheKey)) {
    return FONT_CACHE.get(cacheKey)!;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load font from ${url}: ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  FONT_CACHE.set(cacheKey, buffer);
  return buffer;
}

type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = 'normal' | 'italic';
type SatoriFont = { name: string; data: ArrayBuffer; weight?: FontWeight; style?: FontStyle };

async function loadFonts(): Promise<SatoriFont[]> {
  const fonts: SatoriFont[] = [];
  const fontPairs: Array<{ name: string; url: string; weight: FontWeight; style: FontStyle }> = [
    {
      name: 'Noto Sans SC',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@400/chinese-simplified-400-normal.woff2',
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Noto Sans SC',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@700/chinese-simplified-700-normal.woff2',
      weight: 700,
      style: 'normal',
    },
    {
      name: 'Noto Serif SC',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-serif-sc@400/chinese-simplified-400-normal.woff2',
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Noto Serif SC',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-serif-sc@700/chinese-simplified-700-normal.woff2',
      weight: 700,
      style: 'normal',
    },
  ];

  const results = await Promise.allSettled(
    fontPairs.map(async (fp) => {
      const data = await loadFont(fp.url, `${fp.name}-${fp.weight}`);
      return { name: fp.name, data, weight: fp.weight, style: fp.style } as SatoriFont;
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      fonts.push(result.value);
    }
  }

  if (fonts.length === 0) {
    console.warn('[export-card] All fonts failed to load, satori will use system fonts as fallback');
  }

  return fonts;
}

/* ---------- 主渲染函数 ---------- */

/**
 * 将 ShareCard JSX 渲染为 PNG / SVG
 * ⚠️ 必须在客户端调用，通过 dynamic import 加载此模块
 */
export async function exportCard(options: ExportCardOptions): Promise<ExportCardResult> {
  const {
    template,
    orientation,
    data,
    scale = 1,
    format = 'png',
  } = options;

  const size = CARD_SIZES[orientation];
  const w = Math.round(size.w * scale);
  const h = Math.round(size.h * scale);

  // 1. 加载字体
  const fonts = await loadFonts();

  // 2. 动态导入 ShareCard + @resvg/resvg-js
  const [{ ShareCard }, { Resvg }] = await Promise.all([
    import('@weiwuweixin/ui'),
    // Dynamic import to avoid webpack bundling the native .node file
    import('@resvg/resvg-js') as Promise<typeof import('@resvg/resvg-js')>,
  ]);

  // 3. 构造 JSX
  const element = React.createElement(ShareCard, {
    template,
    orientation,
    data,
    width: size.w,
    height: size.h,
  });

  // 4. satori 渲染为 SVG
  const svgString = await satori(element, {
    width: size.w,
    height: size.h,
    fonts,
    embedFont: true,
  });

  // 如果请求 SVG，直接返回
  if (format === 'svg') {
    return {
      data: svgString,
      mimeType: 'image/svg+xml',
      width: w,
      height: h,
      extension: 'svg',
    };
  }

  // 5. resvg 渲染为 PNG
  const resvg = new Resvg(svgString, {
    fitTo: {
      mode: 'width' as const,
      value: w,
    },
  });

  const pngData = resvg.render();
  const pngUint8 = pngData.asPng();
  const arrayBuffer: ArrayBuffer = pngUint8.buffer.slice(
    pngUint8.byteOffset,
    pngUint8.byteOffset + pngUint8.byteLength
  ) as ArrayBuffer;

  return {
    data: arrayBuffer,
    mimeType: 'image/png',
    width: w,
    height: h,
    extension: 'png',
  };
}

/**
 * 触发浏览器下载
 */
export function downloadBlob(data: ArrayBuffer | string, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 生成文件名
 */
export function generateFilename(title: string, template: CardTemplateId, orientation: CardOrientation, format: 'png' | 'svg' = 'png'): string {
  const safeName = title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 30);
  const timestamp = Date.now();
  return `weiwu_${safeName}_${template}_${orientation}_${timestamp}.${format}`;
}