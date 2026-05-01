/* ============================================================
  围物为心 — PNG 分享卡导出引擎
  使用 html-to-image (DOM 截图) 纯客户端渲染
  ⚠️ 此文件必须仅在客户端动态导入！
  使用 dynamic import: const { exportCard } = await import('@/lib/export-card')
  ============================================================ */

import type { CardTemplateId, CardOrientation, ShareCardData } from '@weiwuweixin/ui';

/* ---------- 常量 ---------- */

export const CARD_SIZES: Record<CardOrientation, { w: number; h: number }> = {
  portrait: { w: 1080, h: 1920 },
  landscape: { w: 1200, h: 675 },
};

/* ---------- 类型 ---------- */

export interface ExportCardOptions {
  /** 要截图的 DOM 元素 ref */
  element: HTMLElement;
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

/* ---------- 主渲染函数 ---------- */

/**
 * 将 ShareCard DOM 节点导出为 PNG / SVG
 * ⚠️ 必须在客户端调用，通过 dynamic import 加载此模块
 * element 是已渲染好的 ShareCard DOM 元素（需在页面中渲染，可设为隐藏）
 */
export async function exportCard(options: ExportCardOptions): Promise<ExportCardResult> {
  const {
    element,
    template,
    orientation,
    data,
    scale = 1,
    format = 'png',
  } = options;

  const size = CARD_SIZES[orientation];
  const w = Math.round(size.w * scale);
  const h = Math.round(size.h * scale);

  // Dynamic import html-to-image (client-only, avoids SSR issues)
  const { toPng, toSvg } = await import('html-to-image');

  if (format === 'svg') {
    const dataUrl = await toSvg(element, {
      pixelRatio: scale,
      width: size.w,
      height: size.h,
      cacheBust: true,
    });

    return {
      data: dataUrl,
      mimeType: 'image/svg+xml',
      width: w,
      height: h,
      extension: 'svg',
    };
  }

  // PNG 导出
  const dataUrl = await toPng(element, {
    pixelRatio: scale,
    width: size.w,
    height: size.h,
    cacheBust: true,
  });

  // dataUrl -> ArrayBuffer
  const resp = await fetch(dataUrl);
  const arrayBuffer = await resp.arrayBuffer();

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
