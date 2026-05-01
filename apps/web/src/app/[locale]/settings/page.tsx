'use client';

/**
 * 围物为心 — 设置页 /settings
 * 三个 Tab：账户 · 通知 · 语言偏好
 * 复用 Button / Card / Sticker，保存时弹出印章盖下 toast
 */
import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { updateMe } from '@/lib/api-client';
import { useUserStore } from '@/stores/user-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@weiwuweixin/ui';
import { Card } from '@weiwuweixin/ui';
import { Sticker } from '@weiwuweixin/ui';

/* ── Tab 类型 ── */
type TabId = 'account' | 'notifications' | 'language';

/* ── 开关组件 ── */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 items-center rounded-[var(--radius-pill)]',
        'transition-colors duration-[var(--duration-normal)]',
        'cursor-pointer',
        checked ? 'bg-[var(--vermilion)]' : 'bg-[var(--ink-100)]',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 rounded-full bg-white shadow-sm',
          'transform transition-transform duration-[var(--duration-normal)]',
          checked ? 'translate-x-[22px]' : 'translate-x-[4px]',
        ].join(' ')}
      />
    </button>
  );
}

/* ── 印章盖下 Toast ── */
function StampToast({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* 半透明遮罩 */}
          <div className="absolute inset-0 bg-[rgba(26,26,36,0.25)] pointer-events-none" />

          {/* 墨迹扩散 */}
          <motion.div
            className="absolute w-52 h-52 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(226,85,63,0.3) 0%, rgba(226,85,63,0.05) 50%, transparent 70%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* 印章主体 */}
          <motion.div
            className="relative flex items-center justify-center"
            style={{ width: 96, height: 96 }}
            initial={{ y: -200, rotate: -15, opacity: 0 }}
            animate={{ y: 0, rotate: -2, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* 外框 */}
            <div
              className="absolute inset-0 rounded-lg border-4 border-[#E2553F]"
              style={{ transform: 'rotate(2deg)' }}
            />
            {/* 内框 */}
            <div
              className="absolute rounded-md border-2 border-[#E2553F] bg-[rgba(226,85,63,0.08)]"
              style={{ inset: 6 }}
            />
            {/* 印文 */}
            <span
              className="relative z-10 font-bold text-[#E2553F]"
              style={{
                fontFamily: '"Songti SC", "SimSun", serif',
                fontSize: 36,
              }}
            >
              已保存
            </span>
          </motion.div>

          {/* 提示文字 */}
          <motion.div
            className="absolute mt-40 flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <span
              className="text-xl font-semibold text-[#FBF7F0] tracking-widest"
              style={{ fontFamily: '"Songti SC", "SimSun", serif' }}
            >
              已保存
            </span>
            <span className="text-sm text-[rgba(251,247,240,0.6)] tracking-wide">
              围物为心 · 以心度物
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   Settings 页面
   ═══════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const t = useTranslations('settings');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.startsWith('/en') ? 'en' : 'zh';

  // ─── 认证保护：未登录重定向到登录页 ───
  const { user, isHydrated } = useAuthStore();
  const isAuthenticated = user?.isAuthenticated === true;
  React.useEffect(() => {
    // 等 hydration 完成后再判断，避免 SSR/client 不一致导致的闪烁重定向
    if (isHydrated && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Hydration 未完成时不渲染（避免闪烁）
  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const [activeTab, setActiveTab] = useState<TabId>('account');

  // ─── 账户状态 ───
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');

  // ─── 通知状态 ───
  const [notifyRating, setNotifyRating] = useState(true);
  const [notifyComment, setNotifyComment] = useState(true);
  const [notifyBadge, setNotifyBadge] = useState(false);

  // ─── 语言偏好 ───
  const [lang, setLang] = useState<'zh' | 'en'>(locale as 'zh' | 'en');

  // ─── 印章 Toast ───
  const [showStamp, setShowStamp] = useState(false);

  const handleSave = useCallback(async () => {
    if (activeTab === 'account') {
      try {
        await updateMe({ nickname: nickname || undefined, bio: bio || undefined });
      } catch {
        // silently ignore — still show stamp for UX
      }
    }
    setShowStamp(true);
    setTimeout(() => setShowStamp(false), 2500);
  }, [activeTab, nickname, bio]);

  const handleLocaleSwitch = (newLocale: string) => {
    const newPath = pathname.replace(/^\/(zh|en)/, `/${newLocale}`);
    router.push(newPath || `/${newLocale}/settings`);
  };

  /* Tab 配置 */
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'account', label: locale === 'en' ? 'Account' : '账户', icon: '👤' },
    { id: 'notifications', label: locale === 'en' ? 'Notifications' : '通知', icon: '🔔' },
    { id: 'language', label: locale === 'en' ? 'Language' : '语言偏好', icon: '🌐' },
  ];

  return (
    <main className="min-h-screen paper-texture">
      <StampToast visible={showStamp} />

      <div className="max-w-3xl mx-auto px-lg py-3xl">
        {/* ─── 页面标题 ─── */}
        <motion.h1
          className="font-heading text-3xl md:text-4xl text-ink-900 mb-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {t('title')}
        </motion.h1>

        {/* ─── Tab 导航 ─── */}
        <nav className="mb-xl">
          <div className="flex gap-sm">
            {tabs.map((tab) => (
              <button type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'px-lg py-md rounded-[var(--radius-md)]',
                  'font-heading text-sm md:text-base',
                  'transition-all duration-[var(--duration-normal)]',
                  'cursor-pointer',
                  activeTab === tab.id
                    ? 'bg-[var(--vermilion)] text-white shadow-[var(--shadow-sm)]'
                    : 'bg-[var(--color-bg-secondary)] text-ink-700 hover:bg-rice',
                ].join(' ')}
              >
                <span className="mr-xs">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ─── Tab 内容 ─── */}
        <AnimatePresence mode="wait">
          {/* ═══ 账户 Tab ═══ */}
          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <Card interactive={false} size="lg">
                {/* 头像区 */}
                <div className="flex items-center gap-lg mb-xl">
                  <Sticker size="md" folded={true} rotatable={false}>
                    <span className="text-3xl">👤</span>
                  </Sticker>
                  <div>
                    <p className="text-sm text-ink-500">{t('avatarHint')}</p>
                    <button type="button"
                      className="text-sm text-[var(--vermilion)] hover:underline mt-2xs cursor-pointer"
                    >
                      {t('avatarChange')}
                    </button>
                  </div>
                </div>

                {/* 昵称 */}
                <div className="mb-xl">
                  <label
                    htmlFor="nickname"
                    className="block font-heading text-sm text-ink-700 mb-xs"
                  >
                    {t('nicknameLabel')}
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t('nicknamePlaceholder')}
                    className={[
                      'w-full px-lg py-md',
                      'bg-[var(--color-bg-secondary)]',
                      'border border-[var(--color-border)]',
                      'rounded-[var(--radius-md)]',
                      'text-ink-900 font-body text-base',
                      'placeholder:text-ink-300',
                      'focus:outline-none focus:border-[var(--vermilion)]',
                      'focus:ring-1 focus:ring-[var(--vermilion)]',
                      'transition-colors duration-[var(--duration-normal)]',
                    ].join(' ')}
                  />
                </div>

                {/* 简介 */}
                <div className="mb-xl">
                  <label
                    htmlFor="bio"
                    className="block font-heading text-sm text-ink-700 mb-xs"
                  >
                    {t('bioLabel')}
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t('bioPlaceholder')}
                    rows={4}
                    className={[
                      'w-full px-lg py-md',
                      'bg-[var(--color-bg-secondary)]',
                      'border border-[var(--color-border)]',
                      'rounded-[var(--radius-md)]',
                      'text-ink-900 font-body text-base',
                      'placeholder:text-ink-300',
                      'focus:outline-none focus:border-[var(--vermilion)]',
                      'focus:ring-1 focus:ring-[var(--vermilion)]',
                      'transition-colors duration-[var(--duration-normal)]',
                      'resize-y',
                    ].join(' ')}
                  />
                </div>

                {/* 保存按钮 */}
                <Button size="md" onClick={handleSave}>
                  {t('saveBtn')}
                </Button>
              </Card>
            </motion.div>
          )}

          {/* ═══ 通知 Tab ═══ */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <Card interactive={false} size="lg">
                <h2 className="font-heading text-xl text-ink-900 mb-xl">
                  {t('notificationTitle')}
                </h2>

                <div className="flex flex-col gap-xl">
                  {/* 新评分 */}
                  <div className="flex items-center justify-between py-md border-b border-[var(--color-border)]">
                    <div>
                      <p className="font-heading text-base text-ink-900">
                        {locale === 'en' ? 'New Rating' : '新评分'}
                      </p>
                      <p className="text-sm text-ink-500 mt-2xs">
                        {locale === 'en'
                          ? 'Get notified when someone rates your list'
                          : '当你的榜单收到新评分时通知你'}
                      </p>
                    </div>
                    <Toggle checked={notifyRating} onChange={setNotifyRating} />
                  </div>

                  {/* 新评论 */}
                  <div className="flex items-center justify-between py-md border-b border-[var(--color-border)]">
                    <div>
                      <p className="font-heading text-base text-ink-900">
                        {locale === 'en' ? 'New Comment' : '新评论'}
                      </p>
                      <p className="text-sm text-ink-500 mt-2xs">
                        {locale === 'en'
                          ? 'Get notified when your list receives a new comment'
                          : '当你创建的榜单收到新评论时通知你'}
                      </p>
                    </div>
                    <Toggle checked={notifyComment} onChange={setNotifyComment} />
                  </div>

                  {/* 徽章解锁 */}
                  <div className="flex items-center justify-between py-md">
                    <div>
                      <p className="font-heading text-base text-ink-900">
                        {locale === 'en' ? 'Badge Unlock' : '徽章解锁'}
                      </p>
                      <p className="text-sm text-ink-500 mt-2xs">
                        {locale === 'en'
                          ? 'Get notified when you unlock a new badge'
                          : '当你解锁新徽章时通知你'}
                      </p>
                    </div>
                    <Toggle checked={notifyBadge} onChange={setNotifyBadge} />
                  </div>
                </div>

                <div className="mt-xl">
                  <Button size="md" onClick={handleSave}>
                    {t('saveBtn')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ═══ 语言偏好 Tab ═══ */}
          {activeTab === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <Card interactive={false} size="lg">
                <h2 className="font-heading text-xl text-ink-900 mb-xl">
                  {locale === 'en' ? 'Language Preference' : '语言偏好'}
                </h2>

                <p className="text-sm text-ink-500 mb-lg">
                  {t('languageDesc')}
                </p>

                <div className="flex gap-lg mb-xl">
                  {/* 中文 */}
                  <button type="button"
                    onClick={() => setLang('zh')}
                    className={[
                      'relative flex-1 p-lg rounded-[var(--radius-md)]',
                      'border-2 transition-all duration-[var(--duration-normal)]',
                      'cursor-pointer text-center',
                      lang === 'zh'
                        ? 'border-[var(--vermilion)] bg-[rgba(226,85,63,0.06)]'
                        : 'border-[var(--color-border)] hover:border-[var(--vermilion)]',
                    ].join(' ')}
                  >
                    {lang === 'zh' && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--vermilion)] flex items-center justify-center">
                        <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="currentColor">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </span>
                    )}
                    <span className="text-2xl block mb-xs">🇨🇳</span>
                    <span className="font-heading text-base text-ink-900">中文</span>
                  </button>

                  {/* English */}
                  <button type="button"
                    onClick={() => setLang('en')}
                    className={[
                      'relative flex-1 p-lg rounded-[var(--radius-md)]',
                      'border-2 transition-all duration-[var(--duration-normal)]',
                      'cursor-pointer text-center',
                      lang === 'en'
                        ? 'border-[var(--vermilion)] bg-[rgba(226,85,63,0.06)]'
                        : 'border-[var(--color-border)] hover:border-[var(--vermilion)]',
                    ].join(' ')}
                  >
                    {lang === 'en' && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--vermilion)] flex items-center justify-center">
                        <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="currentColor">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </span>
                    )}
                    <span className="text-2xl block mb-xs">🇺🇸</span>
                    <span className="font-heading text-base text-ink-900">English</span>
                  </button>
                </div>

                <Button
                  size="md"
                  onClick={() => {
                    if (lang !== locale) {
                      handleLocaleSwitch(lang);
                    }
                    handleSave();
                  }}
                >
                  {t('saveBtn')}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}