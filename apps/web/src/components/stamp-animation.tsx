/* ============================================================
   围物为心 — 印章盖下动画组件
   导出完成后的 3 秒「印章盖下」效果
   ============================================================ */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StampAnimationProps {
  /** 是否激活动画 */
  isActive: boolean;
  /** 动画结束后回调 */
  onFinished?: () => void;
}

/**
 * 印章盖下动画
 * 
 * 阶段：
 * 1. 印章从上方落下（0-0.8s）
 * 2. 盖下瞬间墨迹扩散（0.8-1.2s）
 * 3. 印章微微弹起（1.2-1.8s）
 * 4. 放大展示 + 文字淡入（1.8-2.5s）
 * 5. 最后淡出（2.5-3.0s）
 */
export function StampAnimation({ isActive, onFinished }: StampAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'dropping' | 'stamping' | 'bounce' | 'reveal' | 'fadeout'>('idle');

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    // 启动动画序列
    setPhase('dropping');

    const timers = [
      setTimeout(() => setPhase('stamping'), 800),
      setTimeout(() => setPhase('bounce'), 1200),
      setTimeout(() => setPhase('reveal'), 1800),
      setTimeout(() => setPhase('fadeout'), 2500),
      setTimeout(() => {
        setPhase('idle');
        onFinished?.();
      }, 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive, onFinished]);

  // 印章的旋转/位移/缩放取决于阶段
  const getStampVariants = useCallback(() => {
    switch (phase) {
      case 'idle':
        return {
          y: -200,
          rotate: -15,
          scale: 1,
          opacity: 0,
        };
      case 'dropping':
        return {
          y: 0,
          rotate: -2,
          scale: 1,
          opacity: 1,
          transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
          },
        };
      case 'stamping':
        return {
          y: 4,
          rotate: 0,
          scale: 1.05,
          opacity: 1,
          transition: {
            duration: 0.15,
            ease: 'easeOut' as const,
          },
        };
      case 'bounce':
        return {
          y: -12,
          rotate: 0,
          scale: 1,
          opacity: 1,
          transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 15,
          },
        };
      case 'reveal':
        return {
          y: -12,
          rotate: 0,
          scale: 1,
          opacity: 1,
        };
      case 'fadeout':
        return {
          y: -12,
          rotate: 0,
          scale: 1.1,
          opacity: 0,
          transition: {
            duration: 0.5,
            ease: 'easeIn' as const,
          },
        };
    }
  }, [phase]);

  // 墨迹扩散动画
  const getInkSplashVariants = useCallback(() => {
    const visible = phase === 'stamping' || phase === 'bounce' || phase === 'reveal' || phase === 'fadeout';
    return {
      scale: visible ? 1 : 0,
      opacity: visible ? (phase === 'fadeout' ? 0 : 0.6) : 0,
      transition: {
        duration: phase === 'stamping' ? 0.4 : 0.5,
        ease: 'easeOut' as const,
      },
    };
  }, [phase]);

  // 文字变体
  const getTextVariants = useCallback(() => {
    const visible = phase === 'reveal' || phase === 'fadeout';
    return {
      opacity: visible ? (phase === 'fadeout' ? 0 : 1) : 0,
      y: visible ? 0 : 20,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    };
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {/* 半透明遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'fadeout' ? 0 : 0.3 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#1A1A24',
            }}
          />

          {/* 墨迹扩散 */}
          <motion.div
            animate={getInkSplashVariants()}
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(226,85,63,0.3) 0%, rgba(226,85,63,0.05) 50%, transparent 70%)',
            }}
          />

          {/* 印章主体 */}
          <motion.div
            animate={getStampVariants()}
            style={{
              position: 'relative',
              width: 96,
              height: 96,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 印章外框 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: '4px solid #E2553F',
                borderRadius: 8,
                transform: 'rotate(2deg)',
              }}
            />
            {/* 内框 */}
            <div
              style={{
                position: 'absolute',
                inset: 6,
                border: '2px solid #E2553F',
                borderRadius: 4,
                backgroundColor: 'rgba(226,85,63,0.08)',
              }}
            />
            {/* 印文 "心" */}
            <span
              style={{
                fontFamily: '"Songti SC", "SimSun", serif',
                fontSize: 36,
                fontWeight: 700,
                color: '#E2553F',
                position: 'relative',
                zIndex: 1,
              }}
            >
              心
            </span>
          </motion.div>

          {/* 提示文字 */}
          <motion.div
            animate={getTextVariants()}
            style={{
              position: 'absolute',
              marginTop: 140,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: '"Songti SC", "SimSun", serif',
                fontSize: 20,
                fontWeight: 600,
                color: '#FBF7F0',
                letterSpacing: 4,
              }}
            >
              导出完成
            </span>
            <span
              style={{
                fontSize: 13,
                color: 'rgba(251,247,240,0.6)',
                letterSpacing: 1,
              }}
            >
              围物为心 · 以心度物
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}