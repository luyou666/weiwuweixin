'use client';

import { motion } from 'framer-motion';

const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const;

export function PageTransition() {
  return (
    <>
      {/* 第一道幕：朱砂色，先退场 */}
      <motion.div
        className="fixed inset-0 z-[199] bg-vermilion origin-bottom"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1.0, ease: EASE_CURTAIN, delay: 0.3 }}
      />
      {/* 第二道幕：黑底，后退场 */}
      <motion.div
        className="fixed inset-0 z-[200] bg-ink-900 origin-bottom"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1.0, ease: EASE_CURTAIN, delay: 0.4 }}
      />
    </>
  );
}