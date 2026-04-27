import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { CardProps } from '../types';

const sizeClasses: Record<string, { padding: string }> = {
  sm: { padding: 'var(--space-sm)' },
  md: { padding: 'var(--space-lg)' },
  lg: { padding: 'var(--space-xl)' },
};

/**
 * 纸面纹理 + 贴纸阴影卡片
 * hover时2°倾斜 + spring弹跳动画 + dark mode
 *
 * 暗色适配：
 *   - 边框色跟随 --color-border 变量（暗色下自动变深）
 *   - 纸面纹理叠层在暗色下降低不透明度
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      size = 'md',
      interactive = true,
      textured = true,
      tiltAngle = 2,
      className = '',
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const { padding } = sizeClasses[size];

    return (
      <motion.div
        ref={ref}
        onClick={onClick}
        className={[
          'weiwu-card',
          'relative rounded-[var(--radius-lg)]',
          textured ? 'paper-texture' : '',
          'border border-[var(--color-border)]',
          'transition-[box-shadow,border-color]',
          'duration-[var(--duration-normal)]',
          interactive ? 'cursor-pointer' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          padding,
          boxShadow: 'var(--shadow-sticker)',
        }}
        whileHover={
          interactive
            ? {
                rotate: tiltAngle,
                y: -4,
                boxShadow: 'var(--shadow-sticker-hover)',
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                },
              }
            : undefined
        }
        whileTap={
          interactive
            ? {
                scale: 0.98,
                transition: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                },
              }
            : undefined
        }
      >
        {/* 纸面纹理叠层 — 暗色模式下使用较低对比度 */}
        {textured && (
          <span
            className="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] dark:opacity-50"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(90,78,56,0.015) 2px,
                  rgba(90,78,56,0.015) 4px
                )
              `,
            }}
          />
        )}

        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  },
);

Card.displayName = 'Card';

export default Card;