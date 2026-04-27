'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef, type MouseEvent } from 'react';
import type { ProfileData } from '@/lib/mock-data';

/* ============================================================
   ProfileHeader — 围物为心个人主页头部
   大幅面水墨banner + 视差头像 + 统计数字 + 编辑/关注/分享
   ============================================================ */

interface ProfileHeaderProps {
  profile: ProfileData;
  isOwn?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

export function ProfileHeader({ profile, isOwn = false }: ProfileHeaderProps) {
  const t = useTranslations('profile');
  const sectionRef = useRef<HTMLElement>(null);

  // 鼠标视差 — 头像
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const avatarX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 80, damping: 25 });
  const avatarY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-4, 4]), { stiffness: 80, damping: 25 });

  function handleMouseMove(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  const earnedBadges = profile.badges.filter(b => b.earned).length;
  const totalBadges = profile.badges.length;

  return (
    <motion.section
      ref={sectionRef}
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Banner 背景：水墨渐变 + 噪点 ─── */}
      <div className="relative h-48 sm:h-56 md:h-64">
        {/* 水墨晕染渐变 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(226,85,63,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(107,142,136,0.08) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 100%, rgba(26,26,36,0.15) 0%, transparent 60%),
              linear-gradient(180deg, var(--paper) 0%, var(--rice) 100%)
            `,
          }}
        />
        {/* 噪点纹理 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />
      </div>

      {/* ─── 个人信息区域（叠在 banner 底部） ─── */}
      <div className="relative max-w-4xl mx-auto px-lg">
        {/* 头像 — 向上突出 banner  */}
        <motion.div
          className="relative z-10 -mt-20 sm:-mt-24 mb-md"
          style={{ x: avatarX, y: avatarY }}
        >
          {/* 外圈水墨晕染光环 */}
          <div
            className="absolute -inset-3 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, transparent 50%, var(--ink-300) 65%, transparent 80%)',
              opacity: 0.1,
            }}
          />
          <div
            className="absolute -inset-1.5 rounded-full pointer-events-none"
            style={{
              border: '2px solid var(--ink-200)',
              opacity: 0.2,
            }}
          />
          {/* 头像圆形 */}
          <div
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden"
            style={{
              background: profile.avatarUrl ? undefined : 'var(--rice)',
              border: '4px solid var(--paper)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-heading text-5xl text-ink-500">
                {profile.nickname.charAt(0)}
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── 名称 + Handle + Bio ─── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md">
          <motion.div variants={itemVariants}>
            {/* 昵称 */}
            <h1
              className="font-heading text-3xl sm:text-4xl text-ink-900 tracking-wider"
            >
              {profile.nickname}
            </h1>

            {/* Handle（靛蓝） */}
            <p
              className="text-sm mt-2xs"
              style={{ color: 'var(--indigo)', fontFamily: 'Space Grotesk, var(--font-body), sans-serif' }}
            >
              @{profile.handle}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-ink-500 max-w-md leading-relaxed mt-sm" style={{ fontSize: 'var(--text-sm)' }}>
                {profile.bio}
              </p>
            )}
          </motion.div>

          {/* ─── 操作按钮 ─── */}
          <motion.div
            className="flex items-center gap-sm flex-shrink-0"
            variants={itemVariants}
          >
            {isOwn ? (
              <EditButton label={t('editProfile')} />
            ) : (
              <FollowButton />
            )}
            <ShareButton label={t('shareProfile')} />
          </motion.div>
        </div>

        {/* ─── 统计数字栏 ─── */}
        <motion.div
          className="flex items-center gap-xl mt-lg pb-lg border-b border-ink-100"
          variants={itemVariants}
        >
          <StatItem value={profile.stats.listCount} label={t('listCount')} />
          <StatItem value={profile.stats.rapportCount} label={t('rapportCount')} />
          <StatItem value={profile.stats.bookmarkedCount} label={t('bookmarkedCount')} />

          {/* 分隔线 */}
          <div className="w-px h-8 bg-ink-100 hidden sm:block" />

          {/* 徽章进度 */}
          <div className="hidden sm:flex items-center gap-xs text-sm text-ink-400">
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: 'var(--ink-900)' }}>
              {earnedBadges}
            </span>
            <span>/</span>
            <span>{totalBadges}</span>
            <span className="ml-1">{t('badgesSection')}</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ─── 统计数字 ─── */
function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <span
        className="text-2xl text-ink-900"
        style={{ fontFamily: 'Space Grotesk, var(--font-body), sans-serif', fontWeight: 700 }}
      >
        {value}
      </span>
      <span className="text-xs text-ink-400 mt-1">{label}</span>
    </div>
  );
}

/* ─── 编辑资料按钮 ─── */
function EditButton({ label }: { label: string }) {
  return (
    <button
      className="px-lg py-sm text-sm font-medium border rounded-xl transition-all
        border-ink-200 text-ink-700 bg-paper hover:bg-ink-50 hover:border-ink-300
        active:scale-[0.97]"
    >
      {label}
    </button>
  );
}

/* ─── 关注按钮 ─── */
function FollowButton() {
  const t = useTranslations('profile');
  return (
    <button
      className="px-lg py-sm text-sm font-medium rounded-xl transition-all
        bg-ink-900 text-paper hover:bg-ink-800
        active:scale-[0.97]"
    >
      {t('follow')}
    </button>
  );
}

/* ─── 分享按钮 ─── */
function ShareButton({ label }: { label: string }) {
  return (
    <button
      className="p-sm text-ink-400 hover:text-ink-700 transition-colors rounded-lg
        hover:bg-ink-50 active:scale-[0.97]"
      aria-label={label}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 4H4a1 1 0 00-1 1v11a1 1 0 001 1h11a1 1 0 001-1v-4" strokeLinecap="round" />
        <path d="M12 3h5v5M17 3L8 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}