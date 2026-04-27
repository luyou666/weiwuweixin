import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { EmptyStateProps, EmptyStateScene, EmptyStateVariant } from '../types';

function WhaleSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 45 C20 30, 35 18, 55 18 C75 18, 95 28, 100 42 C103 50, 98 58, 90 62 L55 65 C40 65, 22 58, 20 45Z" fill={color} opacity="0.12" />
      <path d="M20 45 C20 30, 35 18, 55 18 C75 18, 95 28, 100 42 C103 50, 98 58, 90 62 L55 65 C40 65, 22 58, 20 45Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M98 42 C104 35, 112 32, 114 38 C116 43, 108 48, 102 48" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M52 18 C50 10, 53 6, 55 3" stroke={color} strokeWidth="0.8" fill="none" opacity="0.3" strokeLinecap="round" />
      <path d="M48 20 C45 12, 47 7, 44 4" stroke={color} strokeWidth="0.6" fill="none" opacity="0.2" strokeLinecap="round" />
      <circle cx="38" cy="40" r="1.5" fill={color} opacity="0.7" />
      <path d="M10 68 C20 63, 30 68, 40 63 C50 58, 60 63, 70 63 C80 63, 90 60, 110 66" stroke={color} strokeWidth="0.8" fill="none" opacity="0.2" />
    </svg>
  );
}

function MountainSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 65 L25 30 L40 45 L60 20 L80 40 L95 28 L120 55 L120 65Z" fill={color} opacity="0.08" />
      <path d="M0 65 L25 30 L40 45 L60 20 L80 40 L95 28 L120 55" stroke={color} strokeWidth="1.2" fill="none" opacity="0.35" />
      <path d="M0 68 L20 50 L45 58 L65 42 L90 55 L120 48 L120 68Z" fill={color} opacity="0.12" />
      <path d="M0 68 L20 50 L45 58 L65 42 L90 55 L120 48" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M30 38 C35 36, 40 37, 42 39" stroke={color} strokeWidth="0.6" fill="none" opacity="0.2" />
      <path d="M70 30 C75 28, 80 29, 83 31" stroke={color} strokeWidth="0.6" fill="none" opacity="0.15" />
      <path d="M0 70 C30 68, 60 72, 90 69 C105 68, 115 70, 120 70" stroke={color} strokeWidth="0.5" fill="none" opacity="0.15" />
    </svg>
  );
}

function BoatSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 55 C20 52, 40 56, 60 53 C80 50, 100 54, 120 52" stroke={color} strokeWidth="0.6" fill="none" opacity="0.15" />
      <path d="M0 62 C25 60, 50 64, 75 61 C95 58, 110 62, 120 60" stroke={color} strokeWidth="0.5" fill="none" opacity="0.1" />
      <path d="M35 55 L45 60 C50 62, 70 62, 80 60 L85 55 Z" fill={color} opacity="0.12" />
      <path d="M35 55 L45 60 C50 62, 70 62, 80 60 L85 55" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <line x1="60" y1="55" x2="60" y2="20" stroke={color} strokeWidth="1" opacity="0.4" />
      <path d="M60 22 C62 22, 75 30, 78 45 L60 42Z" fill={color} opacity="0.1" />
      <path d="M60 22 C62 22, 75 30, 78 45" stroke={color} strokeWidth="0.8" fill="none" opacity="0.35" />
      <circle cx="60" cy="52" r="2" fill={color} opacity="0.4" />
      <path d="M85 25 C86 24, 88 24, 89 25" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <path d="M92 22 C93 21, 95 21, 96 22" stroke={color} strokeWidth="0.4" opacity="0.15" />
    </svg>
  );
}

function TeaSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M35 42 L38 62 C38 65, 82 65, 82 62 L85 42 Z" fill={color} opacity="0.1" />
      <path d="M35 42 L38 62 C38 65, 82 65, 82 62 L85 42" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5" />
      <ellipse cx="60" cy="42" rx="25" ry="4" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      <ellipse cx="60" cy="50" rx="21" ry="2.5" fill={color} opacity="0.08" />
      <ellipse cx="60" cy="66" rx="30" ry="4" stroke={color} strokeWidth="0.8" fill="none" opacity="0.25" />
      <path d="M85 46 C92 46, 96 50, 96 55 C96 60, 92 62, 86 60" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M50 38 C49 32, 52 28, 50 22" stroke={color} strokeWidth="0.7" opacity="0.15" strokeLinecap="round" />
      <path d="M58 36 C57 30, 60 26, 58 18" stroke={color} strokeWidth="0.6" opacity="0.12" strokeLinecap="round" />
      <path d="M66 37 C65 31, 68 27, 67 20" stroke={color} strokeWidth="0.5" opacity="0.1" strokeLinecap="round" />
    </svg>
  );
}

const illustrationMap: Record<EmptyStateVariant, React.FC<{ color: string }>> = {
  whale: WhaleSVG,
  mountain: MountainSVG,
  boat: BoatSVG,
  tea: TeaSVG,
};

/* ── 场景变体 → 插画/文案映射 ── */
const sceneVariantMap: Record<EmptyStateScene, EmptyStateVariant> = {
  'list-empty': 'whale',
  'comment-empty': 'mountain',
  'search-empty': 'boat',
  'user-empty': 'tea',
};

const defaultCopy: Record<EmptyStateVariant, { title: string; description: string }> = {
  whale: { title: '海阔凭鱼跃', description: '此处尚空，待君以心度之' },
  mountain: { title: '远山含烟', description: '此处尚空，待君以心度之' },
  boat: { title: '孤舟蓑笠翁', description: '此处尚空，待君以心度之' },
  tea: { title: '一盏清茗', description: '此处尚空，待君以心度之' },
};

const sceneCopy: Record<EmptyStateScene, { title: string; description: string }> = {
  'list-empty': { title: '此处尚空', description: '此处尚空，待君以心度之' },
  'comment-empty': { title: '山间尚无回响', description: '静候知音来，留墨以传心' },
  'search-empty': { title: '寻遍诸山，未见此物', description: '换个词试试，或许在云深不知处' },
  'user-empty': { title: '此人尚无榜单', description: '等风来，等他留下心迹' },
};

const sizeConfig: Record<string, { illustrationWidth: number; fontSize: string }> = {
  sm: { illustrationWidth: 120, fontSize: 'var(--text-sm)' },
  md: { illustrationWidth: 160, fontSize: 'var(--text-base)' },
  lg: { illustrationWidth: 200, fontSize: 'var(--text-lg)' },
};

/**
 * 空态组件：水墨小插画 + 克制古典文案
 * 支持 scene 场景变体（语义化快捷映射）和 variant 插画变体
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      variant,
      scene,
      title,
      description,
      action,
      size = 'md',
      className = '',
      style,
      id,
      'aria-label': ariaLabel,
      role,
    },
    ref,
  ) => {
    // scene 优先，若无 scene 则 fallback 到 variant（默认 whale）
    const resolvedVariant: EmptyStateVariant = scene
      ? sceneVariantMap[scene]
      : (variant ?? 'whale');

    const Illustration = illustrationMap[resolvedVariant];
    const config = sizeConfig[size];
    const copy = scene ? sceneCopy[scene] : defaultCopy[resolvedVariant];
    const displayTitle = title ?? copy.title;
    const displayDesc = description ?? copy.description;
    const inkColor = 'var(--ink-500)';

    return (
      <motion.div
        ref={ref}
        id={id}
        role={role}
        aria-label={ariaLabel}
        className={[
          'weiwu-empty-state',
          'flex flex-col items-center justify-center text-center',
          'py-[var(--space-xl)] px-[var(--space-lg)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      >
        <motion.div
          className="mb-[var(--space-lg)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
          style={{ width: config.illustrationWidth }}
        >
          <Illustration color={inkColor} />
        </motion.div>

        <h3
          className="mb-[var(--space-xs)] font-[var(--font-heading)] text-[var(--color-text-primary)]"
          style={{ fontSize: config.fontSize }}
        >
          {displayTitle}
        </h3>

        <p
          className="max-w-[280px] text-[var(--color-text-secondary)] leading-[var(--leading-relaxed)]"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          {displayDesc}
        </p>

        {action && <div className="mt-[var(--space-lg)]">{action}</div>}
      </motion.div>
    );
  },
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;