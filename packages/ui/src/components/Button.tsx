import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { ButtonProps } from '../types';

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[32px]',
  md: 'px-5 py-2.5 text-base min-h-[40px]',
  lg: 'px-7 py-3.5 text-lg min-h-[48px]',
};

/**
 * 朱砂红填色白字按钮
 * 顶部 1px 高光线 + hover/active 态 + dark mode 支持
 *
 * 暗色适配：
 *   - 高光线使用 --mist 变量（暗色下为半透明黑色）
 *   - 按钮色值全部使用 CSS 变量，暗色自动跟随
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      iconLeft,
      iconRight,
      htmlType = 'button',
      className = '',
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        type={htmlType}
        {...rest}
        disabled={disabled || loading}
        onClick={onClick}
        className={[
          'weiwu-btn',
          'relative inline-flex items-center justify-center gap-2',
          'font-medium select-none overflow-hidden',
          'rounded-[var(--radius-md)]',
          'transition-[box-shadow,background-color]',
          'duration-[var(--duration-fast)]',
          'bg-[var(--vermilion-dark)] text-white',
          'hover:bg-[var(--vermilion-dark)]',
          'active:bg-[var(--vermilion-dark)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vermilion)]',
          'active:scale-[0.97]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          fontFamily: 'var(--font-body)',
          boxShadow: 'var(--shadow-sm)',
        }}
        whileHover={
          disabled
            ? undefined
            : {
                scale: 1.03,
                boxShadow: 'var(--shadow-md)',
              }
        }
        whileTap={
          disabled
            ? undefined
            : {
                scale: 0.97,
              }
        }
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 20,
        }}
      >
        {/* 顶部 1px 高光线 — 暗色下 mist 为半透明黑 */}
        <span
          className="pointer-events-none absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--mist) 30%, var(--mist) 70%, transparent)',
          }}
        />

        {/* 加载态旋转指示器 */}
        {loading && (
          <span className="weiwu-btn-loader inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}

        {!loading && iconLeft && (
          <span className="inline-flex items-center">{iconLeft}</span>
        )}

        <span className="inline-flex items-center">{children}</span>

        {!loading && iconRight && (
          <span className="inline-flex items-center">{iconRight}</span>
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export default Button;