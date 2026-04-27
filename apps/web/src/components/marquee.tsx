'use client';

import { motion } from 'framer-motion';

export function Marquee({ items }: { items: string[] }) {
  const list = [...items, ...items, ...items]; // 三倍保证无缝
  return (
    <section className="relative py-2xl border-y border-ink-100 overflow-hidden bg-paper">
      <motion.div
        className="flex gap-2xl whitespace-nowrap"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {list.map((it, i) => (
          <span
            key={i}
            className="font-heading text-[80px] text-ink-900 leading-none tracking-tight inline-flex items-center gap-2xl"
          >
            {it}
            <span className="text-vermilion text-4xl">✦</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}