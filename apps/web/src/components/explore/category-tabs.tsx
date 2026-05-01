'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

/* ============================================================
   分类标签 — 水墨风贴纸感
   选中态：朱砂红底白字
   hover：轻微 2° 倾斜（贴纸感）+ 上浮 1px
   press：缩小到 96%
   支持多选筛选
   ============================================================ */

export interface CategoryTab {
  id: string;
  label: string;
  icon: string;
}

interface CategoryTabsProps {
  categories: CategoryTab[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function CategoryTabs({
  categories,
  selected,
  onChange,
  className = '',
}: CategoryTabsProps) {
  const t = useTranslations('explore');

  const handleToggle = useCallback(
    (id: string) => {
      if (id === 'all') {
        onChange([]);
        return;
      }
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    },
    [selected, onChange],
  );

  const isAllSelected = selected.length === 0;

  return (
    <div
      className={`flex flex-wrap gap-sm ${className}`}
      role="tablist"
      aria-label={t('categoryLabel')}
    >
      {/* 全部 Tab */}
      <CategoryPill
        id="all"
        label={t('allCategories')}
        icon="✦"
        active={isAllSelected}
        onClick={() => handleToggle('all')}
      />

      {categories.map((cat) => (
        <CategoryPill
          key={cat.id}
          id={cat.id}
          label={cat.label}
          icon={cat.icon}
          active={selected.includes(cat.id)}
          onClick={() => handleToggle(cat.id)}
        />
      ))}
    </div>
  );
}

/* ─── 单个标签 ─── */
function CategoryPill({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${id}`}
      onClick={onClick}
      className={[
        'relative inline-flex items-center gap-1 px-sm py-xs',
        'rounded-[var(--radius-lg)] font-[var(--font-body)]',
        'text-sm border cursor-pointer select-none',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-px hover:rotate-[2deg]',
        'active:scale-[0.96]',
        active
          ? 'bg-vermilion text-paper border-vermilion-dark shadow-md scale-100'
          : 'bg-paper text-ink-700 border-ink-100 hover:bg-rice shadow-sm',
      ].join(' ')}
    >
      {/* 水墨晕染装饰 — 选中态 */}
      {active && (
        <span
          className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none animate-in fade-in duration-300"
          style={{
            background:
              'radial-gradient(ellipse at 30% 30%, var(--vermilion-light) 0%, transparent 60%)',
            opacity: 0.2,
          }}
        />
      )}
      <span className="relative z-10 text-xs">{icon}</span>
      <span className="relative z-10 whitespace-nowrap">{label}</span>
    </button>
  );
}

export default CategoryTabs;