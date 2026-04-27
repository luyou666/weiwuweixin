import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  LoadingStateProps,
  ErrorStateProps,
  PageStateProps,
} from '../types';

/* ============================================================
   围物为心 — 全页面三态组件系统
   LoadingState / ErrorState / PageState（容器）
   EmptyState 增强见 EmptyState.tsx（新增 scene 变体映射）
   ============================================================ */

/* ------------------------------------------------------------
   1. LoadingState — 水墨晕圈 + 骨架屏
   ------------------------------------------------------------ */

/** 水墨晕圈动画（CSS @keyframes） */
const inkDropKeyframes = `
@keyframes weiwu-ink-drop {
  0% {
    transform: scale(0);
    opacity: 0.8;
    border-radius: 50%;
  }
  30% {
    transform: scale(1);
    opacity: 0.5;
    border-radius: 45%;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.3;
    border-radius: 40%;
  }
  70% {
    transform: scale(1.5);
    opacity: 0.15;
    border-radius: 35%;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
    border-radius: 30%;
  }
}

@keyframes weiwu-ink-brush {
  0% {
    stroke-dashoffset: 200;
    opacity: 0;
  }
  15% {
    opacity: 0.6;
  }
  50% {
    stroke-dashoffset: 0;
    opacity: 0.4;
  }
  80% {
    opacity: 0.2;
  }
  100% {
    stroke-dashoffset: -200;
    opacity: 0;
  }
}

@keyframes weiwu-ink-text-fade {
  0%, 20% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
  80%, 100% {
    opacity: 0.3;
  }
}
`;

/* 注入 keyframes（仅一次） */
if (typeof document !== 'undefined' && !document.getElementById('weiwu-ink-keyframes')) {
  const style = document.createElement('style');
  style.id = 'weiwu-ink-keyframes';
  style.textContent = inkDropKeyframes;
  document.head.appendChild(style);
}

/** 毛笔划过 SVG 动画 */
function InkBrushSVG() {
  return (
    <svg
      viewBox="0 0 160 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '140px' }}
    >
      {/* 毛笔主笔触 */}
      <path
        d="M10 10 C30 9, 50 11, 80 10 C110 9, 130 11, 150 10"
        stroke="var(--ink-500)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
        style={{
          strokeDasharray: 200,
          animation: 'weiwu-ink-brush 2.4s ease-in-out infinite',
        }}
      />
      {/* 细副笔触 */}
      <path
        d="M15 12 C40 11, 60 13, 90 12 C120 11, 140 13, 155 12"
        stroke="var(--ink-300)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
        style={{
          strokeDasharray: 180,
          animation: 'weiwu-ink-brush 2.4s ease-in-out infinite',
          animationDelay: '0.3s',
        }}
      />
    </svg>
  );
}

/** 墨晕扩散圆 */
function InkDropCircle({ delay = 0 }: { delay?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--ink-500) 0%, var(--ink-300) 40%, transparent 70%)',
        animation: `weiwu-ink-drop 3s ease-out infinite`,
        animationDelay: `${delay}s`,
        top: '50%',
        left: '50%',
        marginTop: '-30px',
        marginLeft: '-30px',
      }}
    />
  );
}

/** 骨架屏网格 */
function SkeletonGrid({ columns = 2, rows = 3 }: { columns?: number; rows?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--space-lg)',
      }}
    >
      {Array.from({ length: columns * rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '160px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--rice)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 水墨晕染扫光 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, transparent 0%, var(--ink-100) 40%, var(--ink-300) 50%, var(--ink-100) 60%, transparent 100%)',
              opacity: 0.15,
              animation: 'weiwu-ink-brush 2s ease-in-out infinite',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * LoadingState — 水墨风全页面加载态
 * - 水墨晕圈 + 毛笔划过动画
 * - 3秒后渐变显示骨架屏
 * - 底部「加载中…」文案
 */
export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    {
      message,
      showSkeletonAfter = 3000,
      skeletonColumns = 2,
      skeletonRows = 3,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const [showSkeleton, setShowSkeleton] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setShowSkeleton(true), showSkeletonAfter);
      return () => clearTimeout(timer);
    }, [showSkeletonAfter]);

    const displayMessage = message ?? '加载中…';

    return (
      <div
        ref={ref}
        className={['weiwu-loading-state', className].filter(Boolean).join(' ')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '320px',
          padding: 'var(--space-3xl) var(--space-lg)',
          position: 'relative',
          ...style,
        }}
        role="status"
        aria-live="polite"
        aria-label={displayMessage}
        {...rest}
      >
        <AnimatePresence mode="wait">
          {!showSkeleton ? (
            <motion.div
              key="ink-anim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-xl)',
                position: 'relative',
              }}
            >
              {/* 墨晕圈组 */}
              <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                <InkDropCircle delay={0} />
                <InkDropCircle delay={1} />
                <InkDropCircle delay={2} />
              </div>

              {/* 毛笔划过 */}
              <InkBrushSVG />

              {/* 加载文案 */}
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  animation: 'weiwu-ink-text-fade 2s ease-in-out infinite',
                }}
              >
                {displayMessage}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-lg)',
              }}
            >
              <SkeletonGrid columns={skeletonColumns} rows={skeletonRows} />
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    animation: 'weiwu-ink-text-fade 2s ease-in-out infinite',
                  }}
                >
                  {displayMessage}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

LoadingState.displayName = 'LoadingState';

/* ------------------------------------------------------------
   2. ErrorState — 水墨山/舟 + 重试
   ------------------------------------------------------------ */

/** 水墨山舟错误插画（纯 SVG） */
function ErrorIllustrationSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 远山 — 第一层 */}
      <path
        d="M0 85 L30 45 L55 60 L90 25 L120 55 L150 35 L180 50 L200 42 L200 85Z"
        fill={color}
        opacity="0.06"
      />
      <path
        d="M0 85 L30 45 L55 60 L90 25 L120 55 L150 35 L180 50 L200 42"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        opacity="0.3"
      />
      {/* 近山 — 第二层 */}
      <path
        d="M0 90 L20 60 L50 72 L80 48 L115 70 L145 52 L175 65 L200 58 L200 90Z"
        fill={color}
        opacity="0.1"
      />
      <path
        d="M0 90 L20 60 L50 72 L80 48 L115 70 L145 52 L175 65 L200 58"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.45"
      />
      {/* 云雾 */}
      <path
        d="M35 55 C40 53, 48 54, 52 56"
        stroke={color}
        strokeWidth="0.8"
        fill="none"
        opacity="0.2"
      />
      <path
        d="M105 35 C112 32, 122 33, 128 36"
        stroke={color}
        strokeWidth="0.7"
        fill="none"
        opacity="0.15"
      />
      {/* 小舟 */}
      <path
        d="M70 78 L80 85 C85 87, 105 87, 112 85 L118 78 Z"
        fill={color}
        opacity="0.1"
      />
      <path
        d="M70 78 L80 85 C85 87, 105 87, 112 85 L118 78"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        opacity="0.5"
      />
      {/* 桅杆 + 帆 */}
      <line x1="95" y1="78" x2="95" y2="42" stroke={color} strokeWidth="1" opacity="0.35" />
      <path
        d="M95 44 C97 44, 110 52, 112 66 L95 62Z"
        fill={color}
        opacity="0.08"
      />
      <path
        d="M95 44 C97 44, 110 52, 112 66"
        stroke={color}
        strokeWidth="0.8"
        fill="none"
        opacity="0.3"
      />
      {/* 水波纹 */}
      <path
        d="M0 88 C25 86, 50 89, 75 87 C100 85, 125 88, 150 86 C170 85, 185 87, 200 86"
        stroke={color}
        strokeWidth="0.6"
        fill="none"
        opacity="0.15"
      />
      <path
        d="M0 95 C30 93, 60 96, 90 94 C120 92, 145 95, 200 93"
        stroke={color}
        strokeWidth="0.4"
        fill="none"
        opacity="0.08"
      />
      {/* 烟雨细点 */}
      <circle cx="40" cy="50" r="1" fill={color} opacity="0.12" />
      <circle cx="130" cy="42" r="0.8" fill={color} opacity="0.1" />
      <circle cx="160" cy="56" r="0.6" fill={color} opacity="0.08" />
    </svg>
  );
}

/**
 * ErrorState — 水墨风错误页面
 * - 山舟水墨小插画 + 错误信息
 * - 古典文案：「云迷雾锁，暂不可达」
 * - 重试按钮
 */
export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title,
      description,
      onRetry,
      retryLabel,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const inkColor = 'var(--ink-500)';

    const handleRetry = useCallback(() => {
      onRetry?.();
    }, [onRetry]);

    const displayTitle = title ?? '云迷雾锁，暂不可达';
    const displayDesc = description ?? '路径暂不可寻，请稍后再试';
    const displayRetry = retryLabel ?? '重试';

    return (
      <motion.div
        ref={ref}
        className={['weiwu-error-state', className].filter(Boolean).join(' ')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'var(--space-3xl) var(--space-lg)',
          ...style,
        }}
        role="alert"
        aria-live="assertive"
        {...rest}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      >
        {/* 水墨山河插画 */}
        <motion.div
          style={{ width: '200px', marginBottom: 'var(--space-xl)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
        >
          <ErrorIllustrationSVG color={inkColor} />
        </motion.div>

        {/* 标题 */}
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-xs)',
            margin: 0,
          }}
        >
          {displayTitle}
        </h3>

        {/* 描述 */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            maxWidth: '280px',
            lineHeight: 'var(--leading-relaxed)',
            marginTop: 'var(--space-xs)',
            marginBottom: 0,
          }}
        >
          {displayDesc}
        </p>

        {/* 重试按钮 */}
        {onRetry && (
          <motion.button
            onClick={handleRetry}
            style={{
              marginTop: 'var(--space-xl)',
              padding: 'var(--space-sm) var(--space-xl)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              color: 'var(--paper)',
              backgroundColor: 'var(--vermilion)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background-color 0.2s, transform 0.15s',
            }}
            whileHover={{
              backgroundColor: 'var(--vermilion-light)',
              scale: 1.02,
            }}
            whileTap={{ scale: 0.97 }}
          >
            {displayRetry}
          </motion.button>
        )}
      </motion.div>
    );
  },
);

ErrorState.displayName = 'ErrorState';

/* ------------------------------------------------------------
   3. PageState — 三态容器
   ------------------------------------------------------------ */

/**
 * PageState — 全页面三态容器
 * 根据 pageState 切换显示 Loading / Error / 空态 / 子内容
 */
export const PageState = forwardRef<HTMLDivElement, PageStateProps>(
  (
    {
      pageState = 'content',
      loadingMessage,
      showSkeletonAfter,
      skeletonColumns,
      skeletonRows,
      errorTitle,
      errorDescription,
      onRetry,
      retryLabel,
      emptyNode,
      children,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={['weiwu-page-state', className].filter(Boolean).join(' ')}
        style={style}
        {...rest}
      >
        <AnimatePresence mode="wait">
          {pageState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingState
                message={loadingMessage}
                showSkeletonAfter={showSkeletonAfter}
                skeletonColumns={skeletonColumns}
                skeletonRows={skeletonRows}
              />
            </motion.div>
          )}

          {pageState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorState
                title={errorTitle}
                description={errorDescription}
                onRetry={onRetry}
                retryLabel={retryLabel}
              />
            </motion.div>
          )}

          {pageState === 'empty' && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {emptyNode}
            </motion.div>
          )}

          {pageState === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

PageState.displayName = 'PageState';

export default PageState;