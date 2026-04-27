import React, { useCallback, useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SliderProps } from '../types';

const sizeConfig: Record<string, { trackHeight: number; thumbSize: number; fontSize: string }> = {
  sm: { trackHeight: 4, thumbSize: 16, fontSize: 'var(--text-xs)' },
  md: { trackHeight: 6, thumbSize: 20, fontSize: 'var(--text-sm)' },
  lg: { trackHeight: 8, thumbSize: 24, fontSize: 'var(--text-base)' },
};

/**
 * 墨滴晕开 SVG 滤镜定义
 */
function InkFilterSVG() {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <defs>
        <filter id="ink-drop-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="4"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <radialGradient id="ink-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--vermilion)" stopOpacity="1" />
          <stop offset="70%" stopColor="var(--vermilion)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--vermilion)" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * 评分滑杆 — 滑动时墨滴晕开效果
 *
 * 暗色适配：
 *   - 轨道背景使用 --rice（暗色下已是深色）
 *   - 拇指边框使用 --paper（暗色下是深底色）
 *   - 标签气泡使用 --ink-900 和 --paper（暗色下自动反转）
 *   - 所有颜色通过 CSS 变量驱动
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      step = 1,
      size = 'md',
      onChange,
      showLabel = true,
      inkEffect = true,
      disabled = false,
      accentColor,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const config = sizeConfig[size];

    const percentage = ((value - min) / (max - min)) * 100;
    const accent = accentColor || 'var(--vermilion)';

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        onChange(val);
      },
      [onChange],
    );

    return (
      <div
        className={`weiwu-slider relative flex flex-col items-center gap-1 w-full ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <InkFilterSVG />

        {/* 轨道容器 */}
        <div className="relative flex-1 flex items-center w-full" style={{ height: config.thumbSize + 8 }}>
          {/* 数值标签 */}
          <AnimatePresence>
            {showLabel && isDragging && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-[var(--radius-sm)] text-[var(--text-xs)] font-[var(--font-mono)]"
                style={{
                  background: 'var(--ink-900)',
                  color: 'var(--paper)',
                  fontSize: config.fontSize,
                }}
              >
                {value}
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '4px solid var(--ink-900)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 轨道 — 暗色下 rice 变量自动为深色 */}
          <div className="relative w-full rounded-[var(--radius-pill)] bg-[var(--rice)]" style={{ height: config.trackHeight }}>
            {/* 已填充轨道 */}
            <div
              className="absolute top-0 left-0 h-full rounded-[var(--radius-pill)] transition-all duration-[var(--duration-fast)]"
              style={{
                width: `${percentage}%`,
                background: accent,
              }}
            />

            {/* 墨滴晕开效果 */}
            <AnimatePresence>
              {inkEffect && isDragging && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${percentage}%`,
                    width: config.thumbSize * 1.5,
                    height: config.thumbSize * 1.5,
                    marginLeft: -(config.thumbSize * 0.75),
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent}66 0%, transparent 70%)`,
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* 隐藏的原生 input */}
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {/* 自定义拇指 — 暗色下 paper 为深色，边框视觉自然 */}
          <motion.div
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 z-20"
            style={{
              left: `calc(${percentage}% - ${config.thumbSize / 2}px)`,
              width: config.thumbSize,
              height: config.thumbSize,
            }}
            animate={isDragging ? { scale: 1.2 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div
              className="w-full h-full rounded-full border-2 border-[var(--paper)]"
              style={{
                background: accent,
                boxShadow: isDragging
                  ? `0 0 0 4px ${accent}33, var(--shadow-md)`
                  : 'var(--shadow-sm)',
                transition: 'box-shadow var(--duration-fast) var(--ease-out)',
              }}
            />
          </motion.div>
        </div>

        {/* 端值标注 */}
        {showLabel && (
          <div className="flex justify-between w-full text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5 px-0.5">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    );
  },
);

Slider.displayName = 'Slider';

export default Slider;