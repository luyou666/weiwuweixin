'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card, ConfidenceSeal, EmptyState, LoadingState, ErrorState } from '@weiwuweixin/ui';
import { fetchProfile, fetchUserLists, type ProfileSortMode } from '@/lib/api';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileLists } from '@/components/profile/profile-lists';
import { BadgeShowcase } from '@/components/profile/badge-showcase';
import { useParams } from 'next/navigation';
import { useState } from 'react';

/* ============================================================
   个人主页 — /u/[handle]
   Gucci式奢侈品排版 + 水墨贴纸风格 + 三态集成
   ============================================================ */

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tm = useTranslations('microcopy');
  const params = useParams<{ locale: string; handle: string }>();
  const [sortMode, setSortMode] = useState<ProfileSortMode>('consensus');
  const [activeTab, setActiveTab] = useState<'lists' | 'activity'>('lists');

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', params.handle],
    queryFn: () => fetchProfile(params.handle),
  });

  const { data: lists, isLoading: listsLoading, isError: listsError } = useQuery({
    queryKey: ['user-lists', profile?.id, sortMode],
    queryFn: () => fetchUserLists(profile!.id, sortMode),
    enabled: !!profile?.id,
  });

  /* ─── 加载态 ─── */
  if (profileLoading) {
    return (
      <main className="min-h-screen">
        <LoadingState
          message={t('loadingTitle')}
          showSkeletonAfter={3000}
          skeletonColumns={1}
          skeletonRows={3}
        />
      </main>
    );
  }

  /* ─── 错误态 ─── */
  if (profileError || !profile) {
    return (
      <main className="min-h-screen">
        <ErrorState
          title={t('errorTitle')}
          description={t('errorDesc')}
          onRetry={() => refetchProfile()}
          retryLabel={tm('retryBtn')}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      {/* ─── 个人信息头部 ─── */}
      <ProfileHeader profile={profile} />

      {/* ─── 主内容区 ─── */}
      <div className="max-w-4xl mx-auto px-lg">
        {/* ─── Tabs 切换 ─── */}
        <div className="flex gap-xs mb-xl border-b border-ink-100">
          <TabButton
            label={t('listsSection')}
            active={activeTab === 'lists'}
            onClick={() => setActiveTab('lists')}
            count={profile.stats.listCount}
          />
          {/* <TabButton
            label={t('activitySection')}
            active={activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}
          /> */}
        </div>

        {/* ─── 榜单列表 ─── */}
        {activeTab === 'lists' && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {listsLoading && (
              <LoadingState
                message={tm('loadingState')}
                showSkeletonAfter={2000}
                skeletonColumns={1}
                skeletonRows={2}
              />
            )}

            {listsError && (
              <ErrorState
                title={t('errorTitle')}
                description={t('errorDesc')}
                retryLabel={tm('retryBtn')}
                onRetry={() => {}}
              />
            )}

            {lists && lists.length === 0 && (
              <EmptyState
                scene="list-empty"
                title={t('emptyLists')}
                description={t('emptyListsDesc')}
              />
            )}

            {lists && lists.length > 0 && (
              <ProfileLists
                lists={lists}
                sortMode={sortMode}
                onSortChange={setSortMode}
              />
            )}
          </motion.section>
        )}

        {/* ─── 徽章展示 ─── */}
        <motion.section
          className="py-xl border-t border-ink-100"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="font-heading text-2xl text-ink-900 mb-lg tracking-wider">
            {t('badgesSection')}
          </h2>
          <BadgeShowcase badges={profile.badges} />
        </motion.section>
      </div>

      {/* ─── 底部间距 ─── */}
      <div className="h-3xl" />
    </main>
  );
}

/* ─── Tab 按钮 ─── */
function TabButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative px-md pb-sm text-sm font-medium transition-colors',
        active ? 'text-ink-900' : 'text-ink-400 hover:text-ink-600',
      ].join(' ')}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className="ml-xs text-xs tabular-nums"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {count}
        </span>
      )}
      {/* 底部指示线 */}
      {active && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink-900"
          layoutId="profile-tab-indicator"
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      )}
    </button>
  );
}