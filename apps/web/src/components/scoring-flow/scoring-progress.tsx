'use client';

/* ============================================================
   围物为心 — 打分进度条
   进度随打分推进，带墨滴晕开效果
   ============================================================ */

import React from 'react';
import { motion } from 'framer-motion';

interface ScoringProgressProps {
  /** 0 → 1 */
  progress: number;
}

export function ScoringProgress({ progress }: ScoringProgressProps) {
  const pct = Math.round(progress * 100);

  return (
    <div className="relative w-full h-1.5 overflow-hidden" style={{ background: 'var(--rice)' }}>
      {/* ── 进度填充 ── */}
      <motion.div
        className="absolute left-0 top-0 h-full"
        style={{
          background: `linear-gradient(90deg, var(--celadon) 0%, var(--vermilion) 100%)`,
          borderRadius: '0 2px 2px 0',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      />

      {/* ── 墨滴效果（进度头部发光） ── */}
      {progress > 0 && progress < 1 && (
        <motion.div
          className="absolute top-0 h-full w-6"
          style={{
            left: `calc(${pct}% - 12px)`,
            background: 'radial-gradient(circle, rgba(226,85,63,0.4) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* ── 完成时的扩散效果 ── */}
      {progress >= 1 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(226,85,63,0.3), transparent)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}