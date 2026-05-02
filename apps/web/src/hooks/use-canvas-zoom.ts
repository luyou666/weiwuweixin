'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

/* ============================================================
   画布缩放平移 Hook — useCanvasZoom
   用于导出页预览区的交互式缩放/平移
   设计参考: Figma / Excalidraw 的缩放平移行为
   ============================================================ */

export interface CanvasTransform {
  scale: number;
  x: number;
  y: number;
}

export interface UseCanvasZoomOptions {
  /** 最小缩放倍数 (default: 0.1 = 10%) */
  minScale?: number;
  /** 最大缩放倍数 (default: 5 = 500%) */
  maxScale?: number;
  /** 初始缩放倍数 (default: 1 = 100%) */
  initialScale?: number;
  /** 滚轮缩放灵敏度，越大缩放越快 (default: 1.08) */
  zoomSensitivity?: number;
}

export interface UseCanvasZoomReturn {
  /** 当前缩放倍数 */
  scale: number;
  /** 当前平移 X (px, 容器坐标系) */
  x: number;
  /** 当前平移 Y (px, 容器坐标系) */
  y: number;
  /** 绑定到外层容器的 ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 是否正在拖拽平移 */
  isPanning: boolean;
  /** 绑定到容器的 onMouseDown */
  handleMouseDown: (e: React.MouseEvent) => void;
  /** 缩放控制 — 放大 (以容器中心) */
  zoomIn: () => void;
  /** 缩放控制 — 缩小 (以容器中心) */
  zoomOut: () => void;
  /** 缩放控制 — 重置 */
  zoomReset: () => void;
  /** 缩放控制 — 缩放到指定倍数 (以容器中心) */
  zoomTo: (scale: number) => void;
}

export function useCanvasZoom(options?: UseCanvasZoomOptions): UseCanvasZoomReturn {
  const {
    minScale = 0.1,
    maxScale = 5,
    initialScale = 1,
    zoomSensitivity = 1.08,
  } = options || {};

  /* ---- 状态 ---- */
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: initialScale,
    x: 0,
    y: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- 拖拽平移 (refs for sync access in event handlers) ---- */
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // 始终保持 transformRef 最新，供缩放计算使用
  const transformRef = useRef(transform);
  transformRef.current = transform;

  /* ============================================================
     滚轮缩放 — 以鼠标位置为中心
     Figma 惯例: 不强制 Ctrl，纯滚轮缩放
     ============================================================ */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 只处理容器范围内的滚轮事件
      if (mouseX < 0 || mouseY < 0 || mouseX > rect.width || mouseY > rect.height) return;

      const factor = e.deltaY < 0 ? zoomSensitivity : 1 / zoomSensitivity;

      setTransform((prev) => {
        const newScale = Math.min(maxScale, Math.max(minScale, prev.scale * factor));
        // 以鼠标位置为中心缩放: 新位置 = 鼠标位置 - (鼠标位置 - 旧位置) * (新比例/旧比例)
        const scaleRatio = newScale / prev.scale;
        const newX = mouseX - (mouseX - prev.x) * scaleRatio;
        const newY = mouseY - (mouseY - prev.y) * scaleRatio;
        return { scale: newScale, x: newX, y: newY };
      });
    },
    [minScale, maxScale, zoomSensitivity],
  );

  /* ============================================================
     拖拽平移 — 左键拖拽
     ============================================================ */
  const startPan = useCallback((clientX: number, clientY: number) => {
    isPanningRef.current = true;
    setIsPanning(true);
    lastPosRef.current = { x: clientX, y: clientY };
  }, []);

  const updatePan = useCallback((clientX: number, clientY: number) => {
    if (!isPanningRef.current) return;
    const dx = clientX - lastPosRef.current.x;
    const dy = clientY - lastPosRef.current.y;
    lastPosRef.current = { x: clientX, y: clientY };
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const endPan = useCallback(() => {
    isPanningRef.current = false;
    setIsPanning(false);
  }, []);

  // 容器上的 React 事件处理器
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // 仅左键
      e.preventDefault();
      startPan(e.clientX, e.clientY);
    },
    [startPan],
  );

  // 全局 window 监听 — 保证拖拽移出容器时也能平滑追踪
  useEffect(() => {
    const onGlobalMouseMove = (e: MouseEvent) => updatePan(e.clientX, e.clientY);
    const onGlobalMouseUp = () => endPan();

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [updatePan, endPan]);

  // 挂载滚轮事件 (需要 passive:false 才能 preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  /* ============================================================
     缩放控件 — 以容器中心为锚点
     ============================================================ */
  const zoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      setTransform((prev) => ({ ...prev, scale: Math.min(maxScale, prev.scale * 1.3) }));
      return;
    }
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTransform((prev) => {
      const newScale = Math.min(maxScale, prev.scale * 1.3);
      const ratio = newScale / prev.scale;
      return {
        scale: newScale,
        x: cx - (cx - prev.x) * ratio,
        y: cy - (cy - prev.y) * ratio,
      };
    });
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      setTransform((prev) => ({ ...prev, scale: Math.max(minScale, prev.scale / 1.3) }));
      return;
    }
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTransform((prev) => {
      const newScale = Math.max(minScale, prev.scale / 1.3);
      const ratio = newScale / prev.scale;
      return {
        scale: newScale,
        x: cx - (cx - prev.x) * ratio,
        y: cy - (cy - prev.y) * ratio,
      };
    });
  }, [minScale]);

  const zoomReset = useCallback(() => {
    setTransform({ scale: initialScale, x: 0, y: 0 });
  }, [initialScale]);

  const zoomTo = useCallback(
    (targetScale: number) => {
      const clamped = Math.min(maxScale, Math.max(minScale, targetScale));
      setTransform((prev) => ({ ...prev, scale: clamped }));
    },
    [minScale, maxScale],
  );

  return {
    scale: transform.scale,
    x: transform.x,
    y: transform.y,
    containerRef,
    isPanning,
    handleMouseDown,
    zoomIn,
    zoomOut,
    zoomReset,
    zoomTo,
  };
}

export default useCanvasZoom;
