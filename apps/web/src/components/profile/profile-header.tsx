'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { ProfileData } from '@/lib/mock-data';

/* ============================================================
   ProfileHeader — 个人信息头部
   圆形头像 + 水墨晕染边框 + 统计数字
   ============================================================ */

interface ProfileHeaderProps {
  profile: ProfileData;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const t = useTranslations('profile');

  return (
    <motion.section
      className="ink-wash relative flex flex-col items-center py-3xl px-lg text-center overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* 水墨晕染装饰 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, var(--vermilion) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, var(--celadon) 0%, transparent 40%)',
          opacity: 0.06,
        }}
      />

      {/* ─── 头像区域 ─── */}
      <div className="relative z-10 mb-lg">
        {/* 外圈水墨晕染装饰边框 */}
        <div
          className="absolute -inset-2 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, transparent 55%, var(--ink-500) 65%, transparent 80%)',
            opacity: 0.12,
          }}
        />
        <div
          className="absolute -inset-1 rounded-full pointer-events-none"
          style={{
            border: '2px solid var(--ink-300)',
            opacity: 0.25,
          }}
        />
        {/* 头像圆形 */}
        <div
          className="relative w-20 h-20 rounded-full overflow-hidden"
          style={{
            background: profile.avatarUrl ? undefined : 'var(--rice)',
            border: '3px solid var(--ink-100)',
            boxShadow: 'var(--shadow-sticker)',
          }}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-heading text-3xl text-ink-500">
              {profile.nickname.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* ─── 昵称 ─── */}
      <motion.h1
        className="relative z-10 font-heading text-3xl text-ink-900 tracking-wider mb-3xs"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      >
        {profile.nickname}
      </motion.h1>

      {/* ─── Handle（靛蓝色） ─── */}
      <motion.p
        className="relative z-10 text-sm mb-sm"
        style={{ color: 'var(--indigo)', fontFamily: 'Space Grotesk, var(--font-body), sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        @{profile.handle}
      </motion.p>

      {/* ─── Bio ─── */}
      {profile.bio && (
        <motion.p
          className="relative z-10 text-ink-500 max-w-md leading-relaxed mb-xl"
          style={{ fontSize: 'var(--text-sm)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        >
          {profile.bio}
        </motion.p>
      )}

      {/* ─── 统计数字（Space Grotesk 数字体） ─── */}
      <motion.div
        className="relative z-10 flex gap-2xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
      >
        <StatItem value={profile.stats.listCount} label={t('listCount')} />
        <StatItem value={profile.stats.rapportCount} label={t('rapportCount')} />
        <StatItem value={profile.stats.bookmarkedCount} label={t('bookmarkedCount')} />
      </motion.div>
    </motion.section>
  );
}

/* ─── 统计数字条 ─── */
function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3xs">
      <span
        className="text-2xl text-ink-900"
        style={{ fontFamily: 'Space Grotesk, var(--font-body), sans-serif', fontWeight: 700 }}
      >
        {value}
      </span>
      <span className="text-xs text-ink-300">{label}</span>
    </div>
  );
}