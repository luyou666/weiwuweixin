'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { BadgeInfo } from '@weiwuweixin/shared';

/* ============================================================
   BadgeShowcase — 围物为心徽章展示
   4种圆形SVG印章图案 + 解锁进度条 + 点击展开详情
   ============================================================ */

interface BadgeShowcaseProps {
  badges: BadgeInfo[];
}

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  const t = useTranslations('profile');
  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div id="badges">
      {/* ─── 进度条 ─── */}
      <div className="flex items-center gap-sm mb-lg">
        <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--vermilion)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / Math.max(badges.length, 1)) * 100}%` }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="text-xs text-ink-400 tabular-nums" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {t('badgeProgress', { earned: earnedCount, total: badges.length })}
        </span>
      </div>

      {/* ─── 徽章网格 ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-lg">
        {badges.map((badge, i) => (
          <BadgeItem key={badge.type} badge={badge} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── 单个徽章（点击展开详情） ─── */
const badgeNameKeys: Record<string, string> = {
  'first-list': 'badgeFirstList',
  'echo-eight': 'badgeEchoEight',
  'chorus-100': 'badgeChorus100',
  pioneer: 'badgePioneer',
};

const badgeDescKeys: Record<string, string> = {
  'first-list': 'badgeFirstListDesc',
  'echo-eight': 'badgeEchoEightDesc',
  'chorus-100': 'badgeChorus100Desc',
  pioneer: 'badgePioneerDesc',
};

function BadgeItem({ badge, index }: { badge: BadgeInfo; index: number }) {
  const t = useTranslations('profile');
  const [expanded, setExpanded] = useState(false);

  const name = t(badgeNameKeys[badge.type] as Parameters<typeof t>[0]);
  const desc = t(badgeDescKeys[badge.type] as Parameters<typeof t>[0]);

  return (
    <motion.button
      onClick={() => setExpanded(!expanded)}
      className="flex flex-col items-center p-lg rounded-2xl transition-colors group text-left
        hover:bg-ink-50/50 focus:outline-none focus:ring-2 focus:ring-indigo/20"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.08,
      }}
    >
      {/* 徽章圆形容器 */}
      <div className="relative mb-sm">
        {badge.earned ? (
          <motion.div
            className="relative"
            animate={{
              boxShadow: [
                '0 0 0px rgba(244, 184, 96, 0)',
                '0 0 12px rgba(244, 184, 96, 0.35)',
                '0 0 0px rgba(244, 184, 96, 0)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, var(--apricot-light) 0%, var(--apricot) 60%, var(--apricot-dark) 100%)',
                boxShadow: '0 0 16px rgba(244, 184, 96, 0.25), var(--shadow-sticker)',
              }}
            >
              <BadgeSVG type={badge.type} earned />
            </div>
          </motion.div>
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center opacity-35 group-hover:opacity-50 transition-opacity"
            style={{
              background: 'var(--ink-100)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <BadgeSVG type={badge.type} earned={false} />
          </div>
        )}
      </div>

      {/* 徽章名 */}
      <p className={`text-sm font-medium text-center ${badge.earned ? 'text-ink-900' : 'text-ink-400'}`}>
        {name}
      </p>

      {/* 徽章描述 / 展开动画 */}
      <AnimatePresence>
        {expanded ? (
          <motion.p
            className="text-xs text-center mt-1 max-w-[120px] leading-snug"
            style={{ color: badge.earned ? 'var(--ink-500)' : 'var(--ink-300)' }}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
          >
            {badge.earned ? desc : t('badgeLocked')}
          </motion.p>
        ) : (
          <motion.p
            className="text-xs text-center mt-1 max-w-[100px] leading-snug truncate"
            style={{ color: badge.earned ? 'var(--ink-500)' : 'var(--ink-300)' }}
            layout
          >
            {badge.earned ? desc : t('badgeLocked')}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 展开/收起提示 */}
      <motion.span
        className="text-[10px] text-ink-300 mt-1"
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        ▾
      </motion.span>
    </motion.button>
  );
}

/* ============================================================
   BadgeSVG — 圆形 SVG 印章图案（简约水墨风）
   ============================================================ */

function BadgeSVG({ type, earned }: { type: string; earned: boolean }) {
  const ink = earned ? '#1A1A24' : '#6E6E88';
  const bgOp = earned ? 0.15 : 0.08;

  switch (type) {
    case 'first-list':
      return <FirstListSeal ink={ink} bgOp={bgOp} />;
    case 'echo-eight':
      return <EchoEightSeal ink={ink} bgOp={bgOp} />;
    case 'chorus-100':
      return <ChorusHundredSeal ink={ink} bgOp={bgOp} />;
    case 'pioneer':
      return <PioneerSeal ink={ink} bgOp={bgOp} />;
    default:
      return null;
  }
}

/* ─── 初心：水墨新手卷轴图案 ─── */
function FirstListSeal({ ink, bgOp }: { ink: string; bgOp: number }) {
  return (
    <svg viewBox="0 0 80 80" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" stroke={ink} strokeWidth="1.5" opacity={0.6} />
      <rect x="28" y="22" width="24" height="36" rx="2" stroke={ink} strokeWidth="1.5" fill={ink} fillOpacity={bgOp} />
      <line x1="26" y1="22" x2="54" y2="22" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="22" r="2.5" fill={ink} opacity={0.7} />
      <circle cx="54" cy="22" r="2.5" fill={ink} opacity={0.7} />
      <line x1="26" y1="58" x2="54" y2="58" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="58" r="2.5" fill={ink} opacity={0.7} />
      <circle cx="54" cy="58" r="2.5" fill={ink} opacity={0.7} />
      <line x1="34" y1="32" x2="46" y2="32" stroke={ink} strokeWidth="1" opacity={0.5} />
      <line x1="34" y1="37" x2="44" y2="37" stroke={ink} strokeWidth="1" opacity={0.5} />
      <line x1="34" y1="42" x2="46" y2="42" stroke={ink} strokeWidth="1" opacity={0.4} />
      <line x1="34" y1="47" x2="42" y2="47" stroke={ink} strokeWidth="1" opacity={0.3} />
    </svg>
  );
}

/* ─── 八方共鸣：八瓣莲花图案 ─── */
function EchoEightSeal({ ink, bgOp }: { ink: string; bgOp: number }) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45) * (Math.PI / 180);
    const cx = 40 + 16 * Math.cos(angle);
    const cy = 40 + 16 * Math.sin(angle);
    return { cx, cy, angle };
  });

  return (
    <svg viewBox="0 0 80 80" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" stroke={ink} strokeWidth="1.5" opacity={0.6} />
      {petals.map((p, i) => (
        <ellipse
          key={i}
          cx={p.cx}
          cy={p.cy}
          rx="8"
          ry="4"
          transform={`rotate(${i * 45} ${p.cx} ${p.cy})`}
          fill={ink}
          fillOpacity={bgOp}
          stroke={ink}
          strokeWidth="1"
          opacity={0.6}
        />
      ))}
      <circle cx="40" cy="40" r="5" fill={ink} opacity={0.7} />
      <circle cx="40" cy="40" r="2" fill="white" opacity={0.5} />
    </svg>
  );
}

/* ─── 众声喧哗：百鸟朝凤图案 ─── */
function ChorusHundredSeal({ ink, bgOp }: { ink: string; bgOp: number }) {
  return (
    <svg viewBox="0 0 80 80" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" stroke={ink} strokeWidth="1.5" opacity={0.6} />
      <path
        d="M40 18 C44 24, 48 28, 46 34 C44 30, 42 28, 40 30 C38 28, 36 30, 34 34 C32 28, 36 24, 40 18Z"
        fill={ink} fillOpacity={bgOp * 2} stroke={ink} strokeWidth="1" opacity={0.7}
      />
      <path
        d="M40 34 C42 38, 46 44, 44 52 C42 48, 40 46, 40 46 C40 46, 38 48, 36 52 C34 44, 38 38, 40 34Z"
        fill={ink} fillOpacity={bgOp} stroke={ink} strokeWidth="1" opacity={0.6}
      />
      <path d="M34 52 C32 48, 30 50, 28 54" stroke={ink} strokeWidth="1" strokeLinecap="round" opacity={0.3} />
      <path d="M46 52 C48 48, 50 50, 52 54" stroke={ink} strokeWidth="1" strokeLinecap="round" opacity={0.3} />
      <circle cx="22" cy="32" r="1.5" fill={ink} opacity={0.35} />
      <circle cx="58" cy="28" r="1.5" fill={ink} opacity={0.3} />
      <circle cx="54" cy="50" r="1.2" fill={ink} opacity={0.25} />
      <circle cx="26" cy="52" r="1.2" fill={ink} opacity={0.3} />
      <circle cx="18" cy="44" r="1" fill={ink} opacity={0.2} />
      <circle cx="62" cy="40" r="1" fill={ink} opacity={0.2} />
      <circle cx="48" cy="60" r="1" fill={ink} opacity={0.2} />
      <circle cx="32" cy="62" r="1" fill={ink} opacity={0.2} />
      <circle cx="40" cy="32" r="2" fill={ink} opacity={0.5} />
    </svg>
  );
}

/* ─── 品类开拓者：山水探险者图案 ─── */
function PioneerSeal({ ink, bgOp }: { ink: string; bgOp: number }) {
  return (
    <svg viewBox="0 0 80 80" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" stroke={ink} strokeWidth="1.5" opacity={0.6} />
      <path
        d="M10 56 L24 30 L34 42 L44 24 L54 38 L64 28 L74 44 L74 56Z"
        fill={ink} fillOpacity={bgOp} stroke={ink} strokeWidth="1.2" strokeLinejoin="round" opacity={0.5}
      />
      <path
        d="M6 60 L18 38 L30 48 L40 34 L52 46 L62 36 L76 50 L76 60Z"
        fill={ink} fillOpacity={bgOp * 1.5} stroke={ink} strokeWidth="1" opacity={0.4}
      />
      <circle cx="40" cy="26" r="2.5" fill={ink} opacity={0.6} />
      <line x1="40" y1="28" x2="40" y2="36" stroke={ink} strokeWidth="1.5" opacity={0.6} />
      <line x1="40" y1="36" x2="37" y2="40" stroke={ink} strokeWidth="1" opacity={0.5} />
      <line x1="40" y1="36" x2="43" y2="40" stroke={ink} strokeWidth="1" opacity={0.5} />
      <line x1="40" y1="31" x2="36" y2="29" stroke={ink} strokeWidth="1" opacity={0.5} strokeLinecap="round" />
      <line x1="40" y1="31" x2="44" y2="29" stroke={ink} strokeWidth="1" opacity={0.5} strokeLinecap="round" />
      <line x1="44" y1="29" x2="44" y2="22" stroke={ink} strokeWidth="1" opacity={0.5} />
      <path
        d="M44 22 L49 24 L44 26Z"
        fill={ink} fillOpacity={0.3} stroke={ink} strokeWidth="0.8" opacity={0.5}
      />
    </svg>
  );
}