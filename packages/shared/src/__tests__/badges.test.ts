import { describe, it, expect } from 'vitest';
import { computeBadges, BadgeType } from '../badges';
import type { UserStats } from '../badges';

/* ============================================================
   围物为心 — 徽章计算测试
   ============================================================ */

const BASE_STATS: UserStats = {
  listCount: 0,
  maxConfidence: 0,
  maxVoteCount: 0,
  isPioneerInCategory: false,
  firstListCreatedAt: null,
  echoEightEarnedAt: null,
  chorus100EarnedAt: null,
  pioneerEarnedAt: null,
};

describe('computeBadges', () => {
  it('新用户：所有徽章均未获得', () => {
    const badges = computeBadges(BASE_STATS);
    expect(badges).toHaveLength(4);
    badges.forEach((b) => {
      expect(b.earned).toBe(false);
      expect(b.earnedAt).toBeNull();
    });
  });

  it('初心徽章：创建1个榜单即获得', () => {
    const stats: UserStats = {
      ...BASE_STATS,
      listCount: 1,
      firstListCreatedAt: '2024-03-15T08:00:00Z',
    };
    const badges = computeBadges(stats);
    const firstListBadge = badges.find((b) => b.type === BadgeType.FirstList);
    expect(firstListBadge?.earned).toBe(true);
    expect(firstListBadge?.earnedAt).toBe('2024-03-15T08:00:00Z');
  });

  it('初心徽章：未创建榜单时不获得', () => {
    const badges = computeBadges(BASE_STATS);
    const firstListBadge = badges.find((b) => b.type === BadgeType.FirstList);
    expect(firstListBadge?.earned).toBe(false);
    expect(firstListBadge?.earnedAt).toBeNull();
  });

  it('八方共鸣徽章：置信度≥80获得', () => {
    const stats: UserStats = {
      ...BASE_STATS,
      maxConfidence: 0.82,
      echoEightEarnedAt: '2024-04-01T10:00:00Z',
    };
    const badges = computeBadges(stats);
    const echoBadge = badges.find((b) => b.type === BadgeType.EchoEight);
    expect(echoBadge?.earned).toBe(true);
    expect(echoBadge?.earnedAt).toBe('2024-04-01T10:00:00Z');
  });

  it('八方共鸣徽章：置信度<80不获得', () => {
    const stats: UserStats = {
      ...BASE_STATS,
      maxConfidence: 0.79,
    };
    const badges = computeBadges(stats);
    const echoBadge = badges.find((b) => b.type === BadgeType.EchoEight);
    expect(echoBadge?.earned).toBe(false);
  });

  it('众声喧哗徽章：参评≥100获得', () => {
    const stats: UserStats = {
      ...BASE_STATS,
      maxVoteCount: 120,
      chorus100EarnedAt: '2024-05-01T12:00:00Z',
    };
    const badges = computeBadges(stats);
    const chorusBadge = badges.find((b) => b.type === BadgeType.Chorus100);
    expect(chorusBadge?.earned).toBe(true);
    expect(chorusBadge?.earnedAt).toBe('2024-05-01T12:00:00Z');
  });

  it('众声喧哗徽章：参评<100不获得', () => {
    const stats: UserStats = {
      ...BASE_STATS,
      maxVoteCount: 99,
    };
    const badges = computeBadges(stats);
    const chorusBadge = badges.find((b) => b.type === BadgeType.Chorus100);
    expect(chorusBadge?.earned).toBe(false);
  });

  it('品类开拓者徽章：某分类首个榜单获得', () => {
    const stats: UserStats = {
      ...BASE_STATS,
      isPioneerInCategory: true,
      pioneerEarnedAt: '2024-02-20T10:00:00Z',
    };
    const badges = computeBadges(stats);
    const pioneerBadge = badges.find((b) => b.type === BadgeType.Pioneer);
    expect(pioneerBadge?.earned).toBe(true);
    expect(pioneerBadge?.earnedAt).toBe('2024-02-20T10:00:00Z');
  });

  it('品类开拓者徽章：非分类首个不获得', () => {
    const badges = computeBadges(BASE_STATS);
    const pioneerBadge = badges.find((b) => b.type === BadgeType.Pioneer);
    expect(pioneerBadge?.earned).toBe(false);
  });

  it('全部获得：所有条件满足', () => {
    const stats: UserStats = {
      listCount: 5,
      maxConfidence: 0.93,
      maxVoteCount: 200,
      isPioneerInCategory: true,
      firstListCreatedAt: '2024-01-01T00:00:00Z',
      echoEightEarnedAt: '2024-02-01T00:00:00Z',
      chorus100EarnedAt: '2024-03-01T00:00:00Z',
      pioneerEarnedAt: '2024-02-14T10:00:00Z',
    };
    const badges = computeBadges(stats);
    badges.forEach((b) => {
      expect(b.earned).toBe(true);
      expect(b.earnedAt).not.toBeNull();
    });
  });
});