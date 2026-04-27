'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

/* ============================================================
   ActivityTimeline — 个人主页活动时间线
   水墨风格时间线 + 多种活动类型 + 相对时间
   ============================================================ */

export interface ActivityItem {
  id: string;
  type: 'create_list' | 'vote' | 'follow_user' | 'earn_badge' | 'comment' | 'bookmark';
  title: string;
  target?: string;
  timestamp: Date;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const typeConfig: Record<ActivityItem['type'], { icon: string; colorKey: string }> = {
  create_list: { icon: 'list', colorKey: 'indigo' },
  vote: { icon: 'vote', colorKey: 'vermilion' },
  follow_user: { icon: 'user', colorKey: 'bronze' },
  earn_badge: { icon: 'badge', colorKey: 'apricot' },
  comment: { icon: 'comment', colorKey: 'ink' },
  bookmark: { icon: 'bookmark', colorKey: 'indigo' },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const t = useTranslations('profile');

  if (activities.length === 0) {
    return (
      <div className="text-center py-xl text-ink-400">
        <p>{t('emptyActivity')}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 中央时间线 */}
      <div
        className="absolute left-[15px] top-2 bottom-2 w-px"
        style={{ background: 'var(--ink-100)' }}
      />

      <div className="space-y-md">
        {activities.map((activity, i) => (
          <ActivityEntry key={activity.id} activity={activity} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── 单条活动 ─── */
function ActivityEntry({ activity, index }: { activity: ActivityItem; index: number }) {
  const t = useTranslations('profile');
  const config = typeConfig[activity.type];

  return (
    <motion.div
      className="relative flex items-start gap-md pl-10"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      {/* 时间线节点 — 圆形图标 */}
      <div
        className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full flex items-center justify-center z-10"
        style={{
          background: 'var(--paper)',
          border: '2px solid var(--ink-100)',
          boxShadow: '0 0 0 3px var(--paper)',
        }}
      >
        <ActivityIcon type={activity.type} />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0 pb-md">
        <p className="text-sm text-ink-700 leading-relaxed">
          {activity.title}
          {activity.target && (
            <span className="font-medium" style={{ color: 'var(--indigo)' }}>
              {' '}{activity.target}
            </span>
          )}
        </p>
        <p className="text-xs text-ink-300 mt-1 tabular-nums" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {relativeTime(activity.timestamp, t)}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── 活动类型图标 ─── */
function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const size = 14;
  switch (type) {
    case 'create_list':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="var(--indigo)" strokeWidth="1.5">
          <rect x="2" y="2" width="10" height="10" rx="2" />
          <path d="M5 5h4M5 7h4M5 9h2" strokeLinecap="round" />
        </svg>
      );
    case 'vote':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="var(--vermilion)" strokeWidth="1.5">
          <path d="M4 7l2.5 2.5L10 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'follow_user':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="var(--bronze)" strokeWidth="1.5">
          <circle cx="7" cy="5" r="2.5" />
          <path d="M2 13c0-2.5 2.2-4 5-4s5 1.5 5 4" strokeLinecap="round" />
        </svg>
      );
    case 'earn_badge':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="var(--apricot)" strokeWidth="1.5">
          <circle cx="7" cy="6" r="4" />
          <path d="M5 10.5L7 13l2-2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'comment':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="var(--ink-500)" strokeWidth="1.5">
          <path d="M3 2h8a1 1 0 011 1v6a1 1 0 01-1 1H5l-2 2V3a1 1 0 011-1z" strokeLinecap="round" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="var(--indigo)" strokeWidth="1.5">
          <path d="M4 2h6a1 1 0 011 1v9l-4-2.5L3 12V3a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

/* ─── 相对时间 ─── */
function relativeTime(date: Date, t: any): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return date.toLocaleDateString('zh-CN');
  if (days > 0) return t('daysAgo', { count: days });
  if (hours > 0) return t('hoursAgo', { count: hours });
  if (minutes > 0) return t('minutesAgo', { count: minutes });
  return t('justNow');
}