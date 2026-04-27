'use client';

import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
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
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />
        {/* Banner 编辑提示（自己的主页） */}
        {isOwn && (
          <button
            className="absolute top-md right-md p-sm rounded-full bg-black/20 hover:bg-black/40 text-white/60 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="更换封面"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 2l3 3L5 14H2v-3L11 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* ─── 个人信息区域 ─── */}
      <div className="relative max-w-4xl mx-auto px-lg">
        {/* 头像 — 视差 + 在线指示灯 */}
        <motion.div
          className="relative z-10 -mt-20 sm:-mt-24 mb-md"
          style={{ x: avatarX, y: avatarY }}
        >
          <div className="absolute -inset-3 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, transparent 50%, var(--ink-300) 65%, transparent 80%)', opacity: 0.1 }}
          />
          <div className="absolute -inset-1.5 rounded-full pointer-events-none"
            style={{ border: '2px solid var(--ink-200)', opacity: 0.2 }}
          />
          <button
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-vermilion/50 focus:ring-offset-2"
            style={{
              background: profile.avatarUrl ? undefined : 'var(--rice)',
              border: '4px solid var(--paper)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.nickname} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-heading text-5xl text-ink-500">
                {profile.nickname.charAt(0)}
              </div>
            )}
          </button>
          {/* 在线状态指示灯 */}
          <div
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-paper"
            style={{ background: 'var(--indigo)', boxShadow: '0 0 6px rgba(107,114,136,0.4)' }}
          />
        </motion.div>

        {/* ─── 名称 + Handle + Bio + 操作按钮 ─── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md">
          <motion.div variants={itemVariants}>
            <h1 className="font-heading text-3xl sm:text-4xl text-ink-900 tracking-wider">
              {profile.nickname}
            </h1>
            <p className="text-sm mt-2xs" style={{ color: 'var(--indigo)', fontFamily: 'Space Grotesk, var(--font-body), sans-serif' }}>
              @{profile.handle}
            </p>
            {profile.bio && (
              <p className="text-ink-500 max-w-md leading-relaxed mt-sm" style={{ fontSize: 'var(--text-sm)' }}>
                {profile.bio}
              </p>
            )}
          </motion.div>

          {/* 操作按钮 */}
          <motion.div className="flex items-center gap-sm flex-shrink-0" variants={itemVariants}>
            {isOwn ? (
              <>
                <EditProfileButton />
                <SettingsButton />
              </>
            ) : (
              <>
                <FollowButton />
                <ShareButton />
                <MoreMenuButton />
              </>
            )}
          </motion.div>
        </div>

        {/* ─── 统计数字栏 ─── */}
        <motion.div className="flex items-center gap-xl mt-lg pb-lg border-b border-ink-100" variants={itemVariants}>
          <StatItem value={profile.stats.listCount} label="榜单" href="#lists" />
          <StatItem value={profile.stats.rapportCount} label="同好" />
          <StatItem value={profile.stats.bookmarkedCount} label="收藏" />
          <div className="w-px h-8 bg-ink-100 hidden sm:block" />
          <button
            className="hidden sm:flex items-center gap-xs text-sm text-ink-400 hover:text-ink-600 transition-colors focus:outline-none"
            onClick={() => document.getElementById('badges')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: 'var(--ink-900)' }}>{earnedBadges}</span>
            <span>/</span>
            <span>{totalBadges}</span>
            <span className="ml-1">徽章</span>
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ─── 统计数字 ─── */
function StatItem({ value, label, href }: { value: number; label: string; href?: string }) {
  const el = (
    <div className="flex flex-col items-center sm:items-start cursor-default hover:opacity-70 transition-opacity">
      <span className="text-2xl text-ink-900" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>{value}</span>
      <span className="text-xs text-ink-400 mt-1">{label}</span>
    </div>
  );
  return href ? <a href={href}>{el}</a> : el;
}

/* ─── 关注按钮（状态切换 + Spring 动效） ─── */
function FollowButton() {
  const t = useTranslations('profile');
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // 模拟网络延迟
    setFollowing(!following);
    setLoading(false);
  }

  return (
    <motion.button
      onClick={toggle}
      disabled={loading}
      className={[
        'px-lg py-sm text-sm font-medium rounded-xl transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'active:scale-[0.95]',
        following
          ? 'bg-ink-50 text-ink-600 border border-ink-200 hover:border-vermilion hover:text-vermilion focus:ring-vermilion/30'
          : 'bg-ink-900 text-paper hover:bg-ink-800 focus:ring-ink-900/30',
        loading && 'opacity-70 cursor-wait',
      ].join(' ')}
      whileTap={!loading ? { scale: 0.95 } : undefined}
    >
      {loading ? (
        <span className="flex items-center gap-xs">
          <motion.span
            className="w-3.5 h-3.5 border-2 rounded-full"
            style={{ borderColor: following ? 'var(--ink-400)' : 'rgba(255,255,255,0.4)', borderTopColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </span>
      ) : following ? (
        <motion.span
          className="flex items-center gap-xs"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('unfollow')}
        </motion.span>
      ) : (
        <motion.span
          className="flex items-center gap-xs"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 3v8M3 7h8" strokeLinecap="round" />
          </svg>
          {t('follow')}
        </motion.span>
      )}
    </motion.button>
  );
}

/* ─── 分享按钮（复制链接 + 原生 API + Toast） ─── */
function ShareButton() {
  const t = useTranslations('profile');
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    // 优先用原生分享 API
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch { /* 用户取消，fallback */ }
    }

    // 复制到剪贴板
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={[
          'p-sm rounded-lg transition-all duration-200 active:scale-[0.95]',
          'focus:outline-none focus:ring-2 focus:ring-indigo/20',
          copied
            ? 'bg-vermilion/10 text-vermilion'
            : 'text-ink-400 hover:text-ink-700 hover:bg-ink-50',
        ].join(' ')}
        aria-label={t('shareProfile')}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          ) : (
            <motion.span key="share" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 4H4a1 1 0 00-1 1v11a1 1 0 001 1h11a1 1 0 001-1v-4" strokeLinecap="round" />
                <path d="M12 3h5v5M17 3L8 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {/* 复制成功 Tooltip */}
      <AnimatePresence>
        {copied && (
          <motion.span
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-vermilion bg-vermilion/10 px-sm py-1 rounded-full whitespace-nowrap z-50"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            {t('linkCopied')}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 更多菜单（举报/拉黑） ─── */
function MoreMenuButton() {
  const t = useTranslations('profile');
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-sm text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo/20"
        aria-label={t('moreOptions')}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-xs z-50 min-w-[140px] py-xs rounded-xl shadow-lg"
              style={{ background: 'rgba(26,26,46,0.96)', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <button className="w-full px-md py-sm text-sm text-white/70 hover:text-white hover:bg-white/10 text-left transition-colors" onClick={() => setOpen(false)}>
                {t('blockUser')}
              </button>
              <button className="w-full px-md py-sm text-sm text-vermilion/80 hover:text-vermilion hover:bg-vermilion/10 text-left transition-colors" onClick={() => setOpen(false)}>
                {t('reportUser')}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 编辑资料按钮（打开弹窗） ─── */
function EditProfileButton() {
  const t = useTranslations('profile');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-lg py-sm text-sm font-medium border rounded-xl transition-all
          border-ink-200 text-ink-700 bg-paper hover:bg-ink-50 hover:border-ink-300
          active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-indigo/20"
      >
        <span className="flex items-center gap-xs">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 2l1 1-7 7H4V8l7-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('editProfile')}
        </span>
      </button>
      <EditProfileDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ─── 设置按钮 ─── */
function SettingsButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/settings')}
      className="p-sm text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo/20"
      aria-label="设置"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="3" />
        <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/* ─── 编辑资料弹窗 ─── */
function EditProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('profile');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  }

  return (
    <>
      {/* 遮罩 */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      {/* 弹窗 */}
      <motion.div
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-paper rounded-2xl shadow-xl p-xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-lg">
          <h2 className="font-heading text-xl text-ink-900 tracking-wider">{t('editProfile')}</h2>
          <button onClick={onClose} className="p-xs text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-lg transition-colors focus:outline-none" aria-label={t('close')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l10 10M14 4L4 14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 昵称 */}
        <div className="mb-md">
          <label className="block text-sm font-medium text-ink-600 mb-xs">{t('nicknameLabel')}</label>
          <input
            type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
            className="w-full px-md py-sm rounded-xl border border-ink-200 text-ink-900 bg-rice placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo transition-all"
            maxLength={20}
          />
          <p className="text-xs text-ink-300 mt-1 text-right tabular-nums">{nickname.length}/20</p>
        </div>

        {/* Bio */}
        <div className="mb-lg">
          <label className="block text-sm font-medium text-ink-600 mb-xs">{t('bioLabel')}</label>
          <textarea
            value={bio} onChange={(e) => setBio(e.target.value)}
            className="w-full px-md py-sm rounded-xl border border-ink-200 text-ink-900 bg-rice placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo transition-all resize-none"
            rows={3} maxLength={120}
          />
          <p className="text-xs text-ink-300 mt-1 text-right tabular-nums">{bio.length}/120</p>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-sm">
          <button
            onClick={onClose}
            className="px-lg py-sm text-sm font-medium rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 active:scale-[0.97] transition-all focus:outline-none"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave} disabled={saving}
            className={[
              'px-lg py-sm text-sm font-medium rounded-xl transition-all active:scale-[0.97] focus:outline-none',
              saved ? 'bg-emerald-600 text-white' : 'bg-ink-900 text-paper hover:bg-ink-800',
              saving && 'opacity-70 cursor-wait',
            ].join(' ')}
          >
            {saving ? (
              <span className="flex items-center gap-xs">
                <motion.span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                {t('saving')}
              </span>
            ) : saved ? (
              <span className="flex items-center gap-xs">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t('saved')}
              </span>
            ) : t('saveBtn')}
          </button>
        </div>
      </motion.div>
    </>
  );
}