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
   水墨贴纸风格，三态集成
   ============================================================ */

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tm = useTranslations('microcopy');
  const params = useParams<{ locale: string; handle: string }>();
  const [sortMode, setSortMode] = useState<ProfileSortMode>('consensus');

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
    <main className="min-h-screen">
      {/* ─── 个人信息头部 ─── */}
      <ProfileHeader profile={profile} />

      {/* ─── 榜单列表 ─── */}
      <section className="max-w-4xl mx-auto px-lg pb-xl">
        <h2 className="font-heading text-2xl text-ink-900 mb-md">
          {t('listsSection')}
        </h2>

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
      </section>

      {/* ─── 徽章展示 ─── */}
      <section className="max-w-4xl mx-auto px-lg pb-3xl">
        <motion.h2
          className="font-heading text-2xl text-ink-900 mb-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {t('badgesSection')}
        </motion.h2>
        <BadgeShowcase badges={profile.badges} />
      </section>
    </main>
  );
}