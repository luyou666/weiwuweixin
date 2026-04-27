import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { ConfidenceSealProps } from '../types';

const sizeConfig: Record<string, { dimension: number; fontSize: string; ringWidth: number }> = {
  sm: { dimension: 56, fontSize: 'var(--text-xs)', ringWidth: 3 },
  md: { dimension: 80, fontSize: 'var(--text-sm)', ringWidth: 4 },
  lg: { dimension: 112, fontSize: 'var(--text-base)', ringWidth: 5 },
};

/**
 * 篆刻纹样 SVG — 外圈装饰
 */
function SealRingSVG({ size, color }: { size: number; color: string }) {
  const r = (size / 2) - 6;
  const dashArray = `${r * 0.15} ${r * 0.08} ${r * 0.12} ${r * 0.08}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0"
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
      <circle cx={size / 2} cy={size / 2} r={r - 2} fill="none" stroke={color} strokeWidth="0.8" strokeDasharray={dashArray} opacity="0.4" />
      <circle cx={size / 2} cy={size / 2} r={r - 8} fill="none" stroke={color} strokeWidth="0.5" strokeDasharray={`${r * 0.1} ${r * 0.05}`} opacity="0.25" />
      {[
        [size / 2, size / 2 - r + 4],
        [size / 2 + r - 4, size / 2],
        [size / 2, size / 2 + r - 4],
        [size / 2 - r + 4, size / 2],
      ].map(([cx, cy], i) => (
        <rect key={i} x={cx - 2} y={cy - 1} width="4" height="2" fill={color} opacity="0.5" />
      ))}
    </svg>
  );
}

/**
 * 置信度色阶
 */
function getConfidenceColor(confidence: number): string {
  if (confidence < 0.3) return 'var(--ink-300)';
  if (confidence < 0.6) return 'var(--celadon)';
  return 'var(--vermilion)';
}

/**
 * 圆形印章置信度徽标
 * 外圈缓慢旋转篆刻纹样SVG
 */
export const ConfidenceSeal = forwardRef<HTMLDivElement, ConfidenceSealProps>(
  (
    {
      confidence,
      size = 'md',
      label,
      spinning = true,
      spinDuration = 20,
      lowText = '存疑',
      highText = '确然',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const config = sizeConfig[size];
    const color = getConfidenceColor(confidence);
    const percentage = Math.round(confidence * 100);
    const displayLabel = label ?? (confidence < 0.5 ? lowText : highText);

    const radius = config.dimension / 2 - config.ringWidth;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - confidence);

    return (
      <div
        ref={ref}
        aria-label={`置信度: ${percentage}% ${displayLabel}`}
        className={[
          'weiwu-confidence-seal',
          'relative inline-flex items-center justify-center',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: config.dimension,
          height: config.dimension,
          fontFamily: 'var(--font-heading)',
        }}
        {...rest}
      >
        {/* 外圈旋转篆刻纹样 */}
        {spinning ? (
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{
              duration: spinDuration,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <SealRingSVG size={config.dimension} color={color} />
          </motion.div>
        ) : (
          <div className="absolute inset-0">
            <SealRingSVG size={config.dimension} color={color} />
          </div>
        )}

        {/* 置信度进度弧 */}
        <svg
          className="absolute inset-0"
          width={config.dimension}
          height={config.dimension}
          viewBox={`0 0 ${config.dimension} ${config.dimension}`}
          aria-hidden="true"
        >
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={config.ringWidth}
            strokeLinecap="round"
            opacity="0.4"
          />
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.ringWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${config.dimension / 2} ${config.dimension / 2})`}
            style={{ transition: 'stroke-dashoffset 0.6s var(--ease-out)' }}
          />
        </svg>

        {/* 中央文字 */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          <span className="font-bold leading-none" style={{ fontSize: config.fontSize, color }}>
            {percentage}
            <span className="text-[0.6em] opacity-70">%</span>
          </span>
          <span
            className="text-[0.5em] mt-0.5 opacity-70 tracking-wider"
            style={{ fontSize: config.fontSize, color: 'var(--color-text-secondary)' }}
          >
            {displayLabel}
          </span>
        </motion.div>

        {/* 印章纹理叠层 */}
        <div className="pointer-events-none absolute inset-0 rounded-full seal-texture" aria-hidden="true" />
      </div>
    );
  },
);

ConfidenceSeal.displayName = 'ConfidenceSeal';

export default ConfidenceSeal;