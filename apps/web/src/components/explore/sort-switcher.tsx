'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

/* ============================================================
   排序切换器
   三种排序模式图标+文字
   活跃态用靛蓝色
   ============================================================ */

export type SortMode = 'diversity' | 'consensus' | 'newest';

interface SortSwitcherProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  className?: string;
}

const sortConfig: Record<SortMode, { icon: string; labelKey: string }> = {
  diversity: { icon: '🌀', labelKey: 'sortDiversity' },
  consensus: { icon: '🤝', labelKey: 'sortConsensus' },
  newest: { icon: '🕐', labelKey: 'sortNewest' },
};

export function SortSwitcher({
  value,
  onChange,
  className = '',
}: SortSwitcherProps) {
  const t = useTranslations('explore');

  return (
    <div
      className={`inline-flex items-center gap-xs p-3xs rounded-[var(--radius-lg)] bg-rice border border-ink-100 ${className}`}
      role="radiogroup"
      aria-label={t('sortLabel')}
    >
      {(Object.keys(sortConfig) as SortMode[]).map((mode) => {
        const config = sortConfig[mode];
        const isActive = value === mode;

        return (
          <motion.button
            key={mode}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(mode)}
            className={[
              'relative inline-flex items-center gap-1 px-sm py-xs',
              'rounded-[var(--radius-md)] text-xs font-medium',
              'cursor-pointer select-none transition-colors duration-[var(--duration-fast)]',
              isActive
                ? 'text-paper'
                : 'text-ink-500 hover:text-ink-700',
            ].join(' ')}
            whileHover={
              !isActive
                ? {
                    rotate: 1,
                    transition: { type: 'spring', stiffness: 300, damping: 15 },
                  }
                : undefined
            }
            whileTap={{ scale: 0.96 }}
          >
            {/* 活跃态背景 */}
            {isActive && (
              <motion.span
                className="absolute inset-0 rounded-[var(--radius-md)] bg-indigo"
                layoutId="sort-active-bg"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ zIndex: 0 }}
              />
            )}

            {/* 水墨晕染装饰 - 活跃态 */}
            {isActive && (
              <span
                className="absolute inset-0 rounded-[var(--radius-md)] pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 30% 30%, var(--indigo-light) 0%, transparent 60%)',
                  opacity: 0.15,
                  zIndex: 1,
                }}
              />
            )}

            <span className="relative z-10">{config.icon}</span>
            <span className="relative z-10 whitespace-nowrap">
              {t(config.labelKey)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

export default SortSwitcher;