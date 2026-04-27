'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useRef, useEffect } from 'react';

/* ============================================================
   搜索栏 — 圆角药丸形状
   搜索图标 + 清除按钮
   搜索建议下拉（最近搜索/热门搜索）
   输入防抖 300ms
   ============================================================ */

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  recentSearches: string[];
  hotSearches: string[];
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  recentSearches,
  hotSearches,
  placeholder,
  className = '',
}: SearchBarProps) {
  const t = useTranslations('explore');
  const [isFocused, setIsFocused] = useState(false);
  const [_debouncedValue, setDebouncedValue] = useState(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const displayPlaceholder = placeholder ?? t('searchPlaceholder');

  // 防抖 300ms
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      if (value.trim()) {
        onSearch(value.trim());
      }
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, onSearch]);

  const handleClear = useCallback(() => {
    onChange('');
    onSearch('');
    inputRef.current?.focus();
  }, [onChange, onSearch]);

  const handleSuggestionClick = useCallback(
    (query: string) => {
      onChange(query);
      onSearch(query);
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [onChange, onSearch],
  );

  const showSuggestions = isFocused && !value.trim();

  return (
    <div className={`relative ${className}`}>
      {/* 药丸搜索框 */}
      <div
        className={[
          'relative flex items-center',
          'rounded-[var(--radius-pill)]',
          'border transition-all duration-[var(--duration-normal)]',
          isFocused
            ? 'border-indigo bg-paper shadow-[var(--shadow-md)]'
            : 'border-ink-100 bg-rice shadow-[var(--shadow-sm)]',
        ].join(' ')}
        style={{ padding: 'var(--space-xs) var(--space-lg)' }}
      >
        {/* 搜索图标 */}
        <span
          className={[
            'flex-shrink-0 text-base transition-colors duration-[var(--duration-normal)]',
            isFocused ? 'text-indigo' : 'text-ink-300',
          ].join(' ')}
        >
          🔍
        </span>

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // 给建议点击留时间
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder={displayPlaceholder}
          className={[
            'flex-1 ml-sm bg-transparent outline-none',
            'font-[var(--font-body)] text-sm text-ink-900',
            'placeholder:text-ink-300',
          ].join(' ')}
          aria-label={displayPlaceholder}
        />

        {/* 清除按钮 */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={handleClear}
              className="flex-shrink-0 ml-xs w-5 h-5 flex items-center justify-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-300 hover:text-paper transition-colors cursor-pointer"
              aria-label={t('clearSearch')}
            >
              <span className="text-xs leading-none">×</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 建议下拉 */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute z-[var(--z-dropdown)] mt-xs left-0 right-0 rounded-[var(--radius-lg)] bg-paper border border-ink-100 shadow-[var(--shadow-lg)] overflow-hidden"
            style={{ transformOrigin: 'top' }}
          >
            {/* 最近搜索 */}
            {recentSearches.length > 0 && (
              <div className="p-md">
                <h4 className="text-xs font-medium text-ink-500 mb-sm">
                  {t('recentSearches')}
                </h4>
                <div className="flex flex-wrap gap-xs">
                  {recentSearches.map((query) => (
                    <SuggestionPill
                      key={`recent-${query}`}
                      label={query}
                      onClick={() => handleSuggestionClick(query)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 热门搜索 */}
            {hotSearches.length > 0 && (
              <div className="p-md border-t border-ink-100">
                <h4 className="text-xs font-medium text-ink-500 mb-sm">
                  🔥 {t('hotSearches')}
                </h4>
                <div className="flex flex-wrap gap-xs">
                  {hotSearches.map((query, i) => (
                    <SuggestionPill
                      key={`hot-${query}`}
                      label={query}
                      onClick={() => handleSuggestionClick(query)}
                      hot={i < 3}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 建议词条 ─── */
function SuggestionPill({
  label,
  onClick,
  hot = false,
}: {
  label: string;
  onClick: () => void;
  hot?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1 px-sm py-3xs',
        'rounded-[var(--radius-md)] text-xs cursor-pointer',
        'border transition-colors duration-[var(--duration-fast)]',
        hot
          ? 'bg-vermilion/10 text-vermilion border-vermilion/20 hover:bg-vermilion/20'
          : 'bg-rice text-ink-700 border-ink-100 hover:bg-paper',
      ].join(' ')}
      whileHover={{
        rotate: 1,
        scale: 1.03,
        transition: { type: 'spring', stiffness: 300, damping: 15 },
      }}
      whileTap={{ scale: 0.96 }}
    >
      {hot && <span className="text-vermilion">★</span>}
      <span>{label}</span>
    </motion.button>
  );
}

export default SearchBar;