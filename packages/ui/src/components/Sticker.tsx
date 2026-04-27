import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { StickerProps } from '../types';

const sizeClasses: Record<string, string> = {
  sm: 'min-w-[80px] min-h-[80px]',
  md: 'min-w-[120px] min-h-[120px]',
  lg: 'min-w-[180px] min-h-[180px]',
};

/**
 * 贴纸风格组件
 * - 轻微随机旋转
 * - 悬浮弹跳反馈
 * - 可选折角装饰
 * - dark mode 支持
 *
 * 暗色适配：
 *   - 折角渐变在暗色下使用 --rice（暗底色）和 --ink-100（暗色边）
 *   - 阴影通过 CSS 变量自动调整
 *   - 边框色跟随 --color-border
 */
export const Sticker = forwardRef<HTMLDivElement, StickerProps>(
  (
    {
      size = 'md',
      draggable = false,
      rotatable = true,
      initialRotation,
      folded = true,
      className = '',
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const rotation = initialRotation ?? ((Math.sin(children?.toString()?.length || 0) * 6) - 3);

    return (
      <motion.div
        role="group"
        ref={ref}
        onClick={onClick}
        className={[
          'weiwu-sticker',
          'relative inline-flex items-center justify-center',
          'rounded-[var(--radius-md)]',
          'paper-texture',
          'border border-[var(--color-border)]',
          'transition-[border-color,background-color]',
          'duration-[var(--duration-normal)]',
          sizeClasses[size],
          'select-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          boxShadow: 'var(--shadow-sticker)',
          transform: `rotate(${rotation}deg)`,
        }}
        whileHover={{
          scale: 1.08,
          rotate: rotatable ? 0 : undefined,
          y: -6,
          boxShadow: 'var(--shadow-sticker-hover)',
          transition: {
            type: 'spring',
            stiffness: 350,
            damping: 12,
          },
        }}
        whileTap={{
          scale: 0.95,
          transition: {
            type: 'spring',
            stiffness: 500,
            damping: 20,
          },
        }}
        drag={draggable}
        dragElastic={0.1}
        dragMomentum={false}
      >
        {/* 折角装饰 — 暗色下渐变自动跟随 */}
        {folded && (
          <span
            className="pointer-events-none absolute -top-0 -right-0 z-20"
            style={{
              width: '20px',
              height: '20px',
              /* 折角：rice 面为折起，ink-100 为底面阴影 */
              background: 'linear-gradient(225deg, var(--rice) 50%, var(--ink-100) 50%)',
              borderBottomLeftRadius: 'var(--radius-sm)',
              boxShadow: '-2px 2px 3px rgba(26,26,36,0.06)',
            }}
          />
        )}

        <div className="relative z-10 p-3 flex items-center justify-center">
          {children}
        </div>
      </motion.div>
    );
  },
);

Sticker.displayName = 'Sticker';

export default Sticker;