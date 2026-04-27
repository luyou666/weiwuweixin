'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { EmptyState, LoadingState, ErrorState } from '@weiwuweixin/ui';
import { fetchProfile, fetchUserLists, type ProfileSortMode } from '@/lib/api';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileLists } from '@/components/profile/profile-lists';
import { BadgeShowcase } from '@/components/profile/badge-showcase';
import { ActivityTimeline, type ActivityItem } from '@/components/profile/activity-timeline';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useState } from 'react';

type ProfileTab = 'lists' | 'activity' | 'badges';

const MOCK_ACTIVITIES: Record<string, ActivityItem[]> = {
  moke: [
    { id: 'a1', type: 'create_list', title: '创建了榜单', target: '京都红叶名所 TOP 8', timestamp: new Date(Date.now() - 2 * 86400000) },
    { id: 'a2', type: 'vote', title: '为「哲学书单」投票', timestamp: new Date(Date.now() - 5 * 3600000) },
    { id: 'a3', type: 'follow_user', title: '关注了', target: '@luge', timestamp: new Date(Date.now() - 12 * 3600000) },
    { id: 'a4', type: 'earn_badge', title: '获得徽章：八方共鸣', timestamp: new Date(Date.now() - 3 * 86400000) },
    { id: 'a5', type: 'comment', title: '评论了「最佳咖啡店」', target: '第3名确实名不虚传', timestamp: new Date(Date.now() - 5 * 86400000) },
    { id: 'a6', type: 'bookmark', title: '收藏了榜单', target: '中国独立游戏推荐', timestamp: new Date(Date.now() - 7 * 86400000) },
  ],
  zhuying: [
    { id: 'b1', type: 'create_list', title: '创建了榜单', target: '春日散步路线 TOP 6', timestamp: new Date(Date.now() - 1 * 86400000) },
    { id: 'b2', type: 'vote', title: '为「京都红叶名所」投票', timestamp: new Date(Date.now() - 3 * 3600000) },
    { id: 'b3', type: 'earn_badge', title: '获得徽章：初心', timestamp: new Date(Date.now() - 10 * 86400000) },
    { id: 'b4', type: 'comment', title: '评论了「哲学书单」', timestamp: new Date(Date.now() - 4 * 86400000) },
  ],
  testuser: [
    { id: 'c1', type: 'create_list', title: '创建了榜单', target: '前端框架对决', timestamp: new Date(Date.now() - 1 * 86400000) },
    { id: 'c2', type: 'vote', title: '为「京都红叶名所」投票', timestamp: new Date(Date.now() - 8 * 3600000) },
    { id: 'c3', type: 'earn_badge', title: '获得徽章：初心', timestamp: new Date(Date.now() - 2 * 86400000) },
    { id: 'c4', type: 'bookmark', title: '收藏了榜单', target: '哲学书单', timestamp: new Date(Date.now() - 5 * 86400000) },
  ],
  luge: [
    { id: 'd1', type: 'create_list', title: '创建了榜单', target: '京都红叶名所 TOP 8', timestamp: new Date(Date.now() - 3 * 86400000) },
    { id: 'd2', type: 'create_list', title: '创建了榜单', target: '春日散步路线 TOP 6', timestamp: new Date(Date.now() - 7 * 86400000) },
    { id: 'd3', type: 'vote', title: '为「中国独立咖啡」投票', timestamp: new Date(Date.now() - 6 * 3600000) },
    { id: 'd4', type: 'follow_user', title: '关注了', target: '@moke', timestamp: new Date(Date.now() - 2 * 86400000) },
    { id: 'd5', type: 'earn_badge', title: '获得徽章：品类开拓者', timestamp: new Date(Date.now() - 10 * 86400000) },
  ],
};

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tm = useTranslations('microcopy');
  const params = useParams<{ locale: string; handle: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const isOwn = currentUser?.handle === params.handle;

  const [sortMode, setSortMode] = useState<ProfileSortMode>('consensus');
  const [activeTab, setActiveTab] = useState<ProfileTab>('lists');

  const activities = MOCK_ACTIVITIES[params.handle] || [];

  const { data: profile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', params.handle],
    queryFn: () => fetchProfile(params.handle),
  });

  const { data: lists, isLoading: listsLoading, isError: listsError } = useQuery({
    queryKey: ['user-lists', profile?.id, sortMode],
    queryFn: () => fetchUserLists(profile!.id, sortMode),
    enabled: !!profile?.id,
  });

  if (profileLoading) {
    return <main className="min-h-screen"><LoadingState message={t('loadingTitle')} showSkeletonAfter={3000} skeletonColumns={1} skeletonRows={3} /></main>;
  }

  if (profileError || !profile) {
    return <main className="min-h-screen"><ErrorState title={t('errorTitle')} description={t('errorDesc')} onRetry={() => refetchProfile()} retryLabel={tm('retryBtn')} /></main>;
  }

  return (
    <main className="min-h-screen bg-paper">
      <ProfileHeader profile={profile} isOwn={isOwn} onTabChange={setActiveTab} />

      <div className="max-w-4xl mx-auto px-lg">
        {/* Tabs */}
        <div className="flex gap-xs mb-xl border-b border-ink-100">
          <TabButton labelKey="listsSection" active={activeTab === 'lists'} onClick={() => setActiveTab('lists')} count={profile.stats.listCount} />
          <TabButton labelKey="activitySection" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} count={activities.length} />
          <TabButton labelKey="badgesSection" active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} count={profile.badges.filter(b => b.earned).length} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'lists' && (
            <motion.section key="lists" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {listsLoading && <LoadingState message={tm('loadingState')} showSkeletonAfter={2000} skeletonColumns={1} skeletonRows={2} />}
              {listsError && <ErrorState title={t('errorTitle')} description={t('errorDesc')} retryLabel={tm('retryBtn')} onRetry={() => {}} />}
              {lists && lists.length === 0 && <EmptyState scene="list-empty" title={t('emptyLists')} description={t('emptyListsDesc')} />}
              {lists && lists.length > 0 && <ProfileLists lists={lists} sortMode={sortMode} onSortChange={setSortMode} />}
            </motion.section>
          )}

          {activeTab === 'activity' && (
            <motion.section key="activity" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="py-sm">
              <ActivityTimeline activities={activities} />
            </motion.section>
          )}

          {activeTab === 'badges' && (
            <motion.section key="badges" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="py-sm">
              <BadgeShowcase badges={profile.badges} />
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <div className="h-3xl" />
    </main>
  );
}

function TabButton({ labelKey, active, onClick, count }: { labelKey: string; active: boolean; onClick: () => void; count?: number }) {
  const t = useTranslations('profile');
  return (
    <button
      onClick={onClick}
      className={['relative px-md pb-sm text-sm font-medium transition-colors focus:outline-none', active ? 'text-ink-900' : 'text-ink-400 hover:text-ink-600'].join(' ')}
    >
      <span>{t(labelKey)}</span>
      {count !== undefined && (
        <span className="ml-xs text-xs tabular-nums" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{count}</span>
      )}
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