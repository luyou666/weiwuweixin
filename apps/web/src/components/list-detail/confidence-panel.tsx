'use client';

/**
 * 围物为心 — 共识度面板
 * - 0-100 数字滚动动画
 * - 分解因子悬浮卡（N/τ/sentiment/time_decay 各自贡献）
 * - 时间序列折线图占位
 *
 * ⚠️ UI 始终称「共识度」，不叫「权威分」
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, ConfidenceSeal } from '@weiwuweixin/ui';
import { computeConfidence, explainConfidence } from '@weiwuweixin/scoring';
import type { ConfidenceParams } from '@weiwuweixin/scoring';
import { useTranslations } from 'next-intl';

/* ============================================================
   Types
   ============================================================ */

export interface ConfidencePanelProps {
  /** 共识度原始参数 */
  params: ConfidenceParams;
  /** 自定义共识度值（覆盖计算），0-100 */
  overrideValue?: number;
  className?: string;
}

/* ============================================================
   数字滚动动画组件
   ============================================================ */

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const startVal = 0;
    let rafId: number;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startVal + (value - startVal) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return (
    <span
      className="font-[var(--font-mono)] font-bold tabular-nums"
      style={{ fontSize: 'var(--text-2xl, 1.5rem)', color: 'var(--vermilion)' }}
    >
      {Math.round(displayValue)}
    </span>
  );
}

/* ============================================================
   因子分解悬浮卡
   ============================================================ */

function FactorCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md, 8px)]"
      style={{
        background: 'var(--rice)',
        border: `1px solid ${color}22`,
      }}
    >
      <span className="text-base">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[var(--text-xs)] text-[var(--ink-500)] truncate">{label}</div>
        <div
          className="font-[var(--font-mono)] font-semibold text-[var(--text-sm)]"
          style={{ color }}
        >
          {typeof value === 'number' ? value.toFixed(3) : value}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   时间序列折线图占位
   ============================================================ */

function TimeSeriesPlaceholder() {
  const t = useTranslations('listDetail');
  // 模拟 7 个数据点
  const mockPoints = [55, 60, 58, 65, 70, 68, 72];

  const width = 260;
  const height = 80;
  const padding = 8;

  const points = mockPoints.map((v, i) => {
    const x = padding + (i / (mockPoints.length - 1)) * (width - 2 * padding);
    const y = height - padding - (v / 100) * (height - 2 * padding);
    return `${x},${y}`;
  });

  return (
    <div className="mt-3">
      <div className="text-[var(--text-xs)] text-[var(--ink-500)] mb-1">
        {t('confidenceTrend') ?? '共识度趋势'}
      </div>
      <div
        className="rounded-[var(--radius-md, 8px)] overflow-hidden"
        style={{ background: 'var(--rice)', border: '1px solid var(--color-border)' }}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* 网格线 */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = height - padding - (v / 100) * (height - 2 * padding);
            return (
              <line
                key={v}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="var(--ink-100)"
                strokeWidth="0.5"
                strokeDasharray="4 2"
              />
            );
          })}
          {/* 折线 */}
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="var(--vermilion)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          {/* 渐变填充区域 */}
          <defs>
            <linearGradient id="confGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--vermilion)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--vermilion)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`${padding},${height - padding} ${points.join(' ')} ${width - padding},${height - padding}`}
            fill="url(#confGradient)"
          />
          {/* 数据点 */}
          {mockPoints.map((v, i) => {
            const x = padding + (i / (mockPoints.length - 1)) * (width - 2 * padding);
            const y = height - padding - (v / 100) * (height - 2 * padding);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2.5"
                fill="var(--paper)"
                stroke="var(--vermilion)"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ============================================================
   ConfidencePanel 主组件
   ============================================================ */

export function ConfidencePanel({ params, overrideValue, className = '' }: ConfidencePanelProps) {
  const t = useTranslations('confidence');

  const confidenceValue = overrideValue ?? computeConfidence(params);
  const normalizedConfidence = Math.min(Math.max(confidenceValue / 100, 0), 1);

  // 因子分解
  const explanation = useMemo(() => explainConfidence(params), [params]);

  // 从 explanation 提取因子
  const factors = useMemo(() => {
    const result: { label: string; value: number; icon: string; color: string }[] = [];
    if (explanation.children) {
      for (const child of explanation.children) {
        if (child.type === 'users-factor') {
          result.push({
            label: t('label') + ' · N',
            value: child.value as number,
            icon: '👥',
            color: 'var(--indigo, #5B6ABF)',
          });
        } else if (child.type === 'consensus-factor') {
          result.push({
            label: 'τ 共识因子',
            value: child.value as number,
            icon: '🤝',
            color: 'var(--celadon)',
          });
        } else if (child.type === 'sentiment-factor') {
          result.push({
            label: '💬 情感因子',
            value: child.value as number,
            icon: '💬',
            color: 'var(--apricot, #E8A849)',
          });
        } else if (child.type === 'time-decay') {
          result.push({
            label: '⏳ 时间衰减',
            value: child.value as number,
            icon: '⏳',
            color: 'var(--ink-300)',
          });
        }
      }
    }
    return result;
  }, [explanation, t]);

  // 共识度等级文案
  const levelLabel = useMemo(() => {
    if (confidenceValue < 20) return t('doubtful');
    if (confidenceValue < 40) return t('emerging');
    if (confidenceValue < 60) return t('forming');
    if (confidenceValue < 80) return t('settled');
    return t('deepAccord');
  }, [confidenceValue, t]);

  return (
    <div className={className}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: 'var(--celadon)' }}
        />
        <h3
          className="font-[var(--font-heading)] text-[var(--text-base)]"
          style={{ color: 'var(--color-text-primary, var(--ink-900))' }}
        >
          {t('label')}
        </h3>
      </div>

      <Card interactive={false} textured size="md">
        {/* 核心数字展示 */}
        <div className="flex items-center gap-4 mb-4">
          <ConfidenceSeal
            confidence={normalizedConfidence}
            size="md"
            label={levelLabel}
            spinning={false}
          />
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <AnimatedNumber value={confidenceValue} />
              <span className="text-[var(--text-sm)] text-[var(--ink-300)]">/ 100</span>
            </div>
            <div className="text-[var(--text-xs)] text-[var(--ink-500)] mt-1">
              {levelLabel}
            </div>
          </div>
        </div>

        {/* 因子分解卡 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {factors.map((factor) => (
            <FactorCard
              key={factor.label}
              label={factor.label}
              value={factor.value}
              icon={factor.icon}
              color={factor.color}
            />
          ))}
        </div>

        {/* 时间序列折线图占位 */}
        <TimeSeriesPlaceholder />
      </Card>
    </div>
  );
}

export default ConfidencePanel;