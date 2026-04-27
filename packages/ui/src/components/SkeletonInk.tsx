import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { SkeletonInkProps, SkeletonVariant } from '../types';

const variantStyles: Record<SkeletonVariant, React.CSSProperties> = {
  text: { width: '100%', height: '1em', borderRadius: 'var(--radius-sm)' },
  card: { width: '100%', height: '200px', borderRadius: 'var(--radius-lg)' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%' },
  custom: {},
};

/**
 * 水墨风骨架屏加载态
 */
export const SkeletonInk = forwardRef<HTMLDivElement, SkeletonInkProps>(
  (
    {
      variant = 'text',
      lines,
      size = 'md',
      animated = true,
      radius,
      width,
      height,
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    if (variant === 'text' && lines && lines > 1) {
      return (
        <div
          ref={ref}
          className={`weiwu-skeleton-ink flex flex-col gap-[var(--space-sm)] ${className}`}
          {...rest}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonLine
              key={i}
              isLast={i === lines - 1}
              animated={animated}
              lineWidth={i === lines - 1 ? '70%' : width}
              height={height}
              radius={radius}
            />
          ))}
        </div>
      );
    }

    const variantStyle = variantStyles[variant];

    return (
      <motion.div
        ref={ref}
        className={[
          'weiwu-skeleton-ink',
          'relative overflow-hidden',
          'bg-[var(--rice)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...variantStyle,
          width: width ?? variantStyle.width,
          height: height ?? variantStyle.height,
          borderRadius: radius ?? variantStyle.borderRadius,
          ...style,
        }}
        initial={animated ? { opacity: 0.4 } : undefined}
        animate={animated ? { opacity: [0.4, 0.7, 0.4] } : undefined}
        transition={animated ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        {animated && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--ink-100) 40%, var(--ink-300) 50%, var(--ink-100) 60%, transparent 100%)',
              opacity: 0.15,
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        )}
        {animated && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, var(--ink-300) 0%, transparent 70%)',
              opacity: 0.06,
            }}
            animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    );
  },
);

function SkeletonLine({
  isLast,
  animated,
  lineWidth,
  height,
  radius,
}: {
  isLast: boolean;
  animated: boolean;
  lineWidth?: string | number;
  height?: string | number;
  radius?: string;
}) {
  return (
    <motion.div
      className="weiwu-skeleton-ink-line relative overflow-hidden bg-[var(--rice)]"
      style={{
        width: lineWidth ?? (isLast ? '70%' : '100%'),
        height: height ?? '1em',
        borderRadius: radius ?? 'var(--radius-sm)',
      }}
      initial={animated ? { opacity: 0.4 } : undefined}
      animate={animated ? { opacity: [0.4, 0.7, 0.4] } : undefined}
      transition={animated ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {animated && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, var(--ink-100) 40%, var(--ink-300) 50%, var(--ink-100) 60%, transparent 100%)',
            opacity: 0.15,
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      )}
    </motion.div>
  );
}

SkeletonInk.displayName = 'SkeletonInk';

export default SkeletonInk;