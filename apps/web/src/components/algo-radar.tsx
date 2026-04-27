'use client';

import { motion } from 'framer-motion';

/* ============================================================
   小型算法特征雷达图
   维度：直观性 / 抗极端值 / 均衡性 / 小样本稳健 / 计算速度
   用 SVG 绘制，配合 Framer Motion 动画
   ============================================================ */

/** 雷达图维度定义 */
export const RADAR_DIMENSIONS = [
  { key: 'intuitive', label: '直观性' },
  { key: 'robustness', label: '抗极端值' },
  { key: 'balance', label: '均衡性' },
  { key: 'sampleStability', label: '小样本稳健' },
  { key: 'speed', label: '计算速度' },
] as const;

export type RadarDimensionKey = (typeof RADAR_DIMENSIONS)[number]['key'];

export interface RadarScores {
  intuitive: number;
  robustness: number;
  balance: number;
  sampleStability: number;
  speed: number;
}

/** 5种算法的特征分值（1-5，代表特征而非优劣） */
export const ALGO_RADAR_SCORES: Record<string, RadarScores> = {
  'weighted-mean': {
    intuitive: 5,
    robustness: 2,
    balance: 3,
    sampleStability: 2,
    speed: 5,
  },
  'geometric-mean': {
    intuitive: 3,
    robustness: 3,
    balance: 5,
    sampleStability: 3,
    speed: 4,
  },
  'borda-count': {
    intuitive: 4,
    robustness: 5,
    balance: 2,
    sampleStability: 3,
    speed: 5,
  },
  'topsis': {
    intuitive: 2,
    robustness: 3,
    balance: 4,
    sampleStability: 2,
    speed: 2,
  },
  'bayesian-shrinkage': {
    intuitive: 2,
    robustness: 4,
    balance: 3,
    sampleStability: 5,
    speed: 3,
  },
};

interface AlgoRadarProps {
  algorithmId: string;
  selected?: boolean;
  size?: number;
}

/** 计算雷达图各顶点坐标 */
function getRadarPoints(
  scores: RadarScores,
  cx: number,
  cy: number,
  r: number,
): string {
  const dims = RADAR_DIMENSIONS;
  const n = dims.length;

  return dims
    .map((dim, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const value = scores[dim.key] / 5; // normalize to 0-1
      const x = cx + r * value * Math.cos(angle);
      const y = cy + r * value * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
}

/** 计算维度标签位置 */
function getLabelPositions(
  cx: number,
  cy: number,
  r: number,
): { x: number; y: number; anchor: string; dim: (typeof RADAR_DIMENSIONS)[number] }[] {
  const dims = RADAR_DIMENSIONS;
  const n = dims.length;

  return dims.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const labelR = r + 14;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    // Determine text anchor based on position
    let anchor = 'middle';
    if (Math.cos(angle) > 0.3) anchor = 'start';
    if (Math.cos(angle) < -0.3) anchor = 'end';
    return { x, y, anchor, dim };
  });
}

export function AlgoRadar({
  algorithmId,
  selected = false,
  size = 120,
}: AlgoRadarProps) {
  const scores = ALGO_RADAR_SCORES[algorithmId];
  if (!scores) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20; // padding for labels
  const n = RADAR_DIMENSIONS.length;

  // Grid ring levels (1-5, but we show rings at 20%, 40%, 60%, 80%, 100%)
  const rings = [1, 2, 3, 4, 5];

  return (
    <motion.div
      className="inline-flex"
      animate={{
        scale: selected ? 1.08 : 1,
        opacity: selected ? 1 : 0.55,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Background rings */}
        {rings.map((level) => {
          const ringR = r * (level / 5);
          return (
            <polygon
              key={level}
              points={Array.from({ length: n }, (_, i) => {
                const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                return `${cx + ringR * Math.cos(angle)},${cy + ringR * Math.sin(angle)}`;
              }).join(' ')}
              fill="none"
              stroke={selected ? 'var(--ink-100)' : 'var(--ink-100)'}
              strokeWidth={level === 5 ? 0.8 : 0.4}
              opacity={selected ? 1 : 0.5}
            />
          );
        })}

        {/* Axis lines */}
        {RADAR_DIMENSIONS.map((_, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + r * Math.cos(angle)}
              y2={cy + r * Math.sin(angle)}
              stroke="var(--ink-100)"
              strokeWidth={0.5}
              opacity={selected ? 1 : 0.5}
            />
          );
        })}

        {/* Data polygon - fill */}
        <motion.polygon
          points={getRadarPoints(scores, cx, cy, r)}
          fill={selected ? 'var(--vermilion)' : 'var(--ink-500)'}
          fillOpacity={selected ? 0.15 : 0.08}
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Data polygon - stroke */}
        <motion.polygon
          points={getRadarPoints(scores, cx, cy, r)}
          fill="none"
          stroke={selected ? 'var(--vermilion)' : 'var(--ink-500)'}
          strokeWidth={selected ? 1.5 : 1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        {/* Data points */}
        {RADAR_DIMENSIONS.map((dim, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const value = scores[dim.key] / 5;
          const px = cx + r * value * Math.cos(angle);
          const py = cy + r * value * Math.sin(angle);
          return (
            <motion.circle
              key={dim.key}
              cx={px}
              cy={py}
              r={selected ? 2.5 : 1.5}
              fill={selected ? 'var(--vermilion)' : 'var(--ink-500)'}
              initial={{ r: 0 }}
              animate={{ r: selected ? 2.5 : 1.5 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.15 + i * 0.05 }}
            />
          );
        })}

        {/* Dimension labels (only show when selected for cleaner layout) */}
        {selected &&
          getLabelPositions(cx, cy, r).map(({ x, y, anchor, dim }) => (
            <text
              key={dim.key}
              x={x}
              y={y + 3}
              textAnchor={anchor as "start" | "middle" | "end" | "inherit"}
              fill="var(--ink-700)"
              fontSize={7}
              fontFamily="var(--font-body)"
            >
              {dim.label}
            </text>
          ))}
      </svg>
    </motion.div>
  );
}