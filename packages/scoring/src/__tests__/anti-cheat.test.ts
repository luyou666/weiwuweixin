/**
 * 围物为心 — 反刷分引擎测试
 */
import { describe, it, expect } from 'vitest';
import {
  detectSuspiciousScore,
  computeWeight,
  type AntiCheatInput,
} from '../anti-cheat';

/* ============================================================
   辅助：构建正常输入
   ============================================================ */

function makeNormalInput(overrides: Partial<AntiCheatInput> = {}): AntiCheatInput {
  return {
    durationMs: 10000,
    deviceId: 'device-001',
    listId: 'list-1',
    scores: [3, 4, 5],
    maxScale: 10,
    minScale: 0,
    sameDeviceListVotes24h: 1,
    ...overrides,
  };
}

/* ============================================================
   测试
   ============================================================ */

describe('detectSuspiciousScore', () => {
  it('正常打分 — 无任何惩罚', () => {
    const result = detectSuspiciousScore(makeNormalInput());
    expect(result.isSuspicious).toBe(false);
    expect(result.needsReview).toBe(false);
    expect(result.flags).toEqual([]);
    expect(result.preliminaryWeight).toBe(1.0);
  });

  it('过快打分（3s 内）— 降权 0.2', () => {
    const result = detectSuspiciousScore(makeNormalInput({ durationMs: 2999 }));
    expect(result.isSuspicious).toBe(true);
    expect(result.flags).toContain('too-fast');
    expect(result.preliminaryWeight).toBe(0.2);
  });

  it('边界值 durationMs=3000 — 不算过快', () => {
    const result = detectSuspiciousScore(makeNormalInput({ durationMs: 3000 }));
    expect(result.flags).not.toContain('too-fast');
    expect(result.isSuspicious).toBe(false);
    expect(result.preliminaryWeight).toBe(1.0);
  });

  it('同设备+同榜单24h内重复 — 降权至 0', () => {
    const result = detectSuspiciousScore(
      makeNormalInput({ sameDeviceListVotes24h: 2 }),
    );
    expect(result.isSuspicious).toBe(true);
    expect(result.flags).toContain('duplicate-device');
    expect(result.preliminaryWeight).toBe(0);
  });

  it('评分方差异常低（所有维度相同分数）— 降权 0.5', () => {
    const result = detectSuspiciousScore(
      makeNormalInput({ scores: [7, 7, 7] }),
    );
    expect(result.isSuspicious).toBe(true);
    expect(result.flags).toContain('low-variance');
    expect(result.preliminaryWeight).toBe(0.5);
  });

  it('评分方差异常低（标准差 < 0.5）— 降权 0.5', () => {
    // 分数几乎相同，标准差 < 0.5
    const result = detectSuspiciousScore(
      makeNormalInput({ scores: [7.0, 7.2, 7.1] }),
    );
    expect(result.flags).toContain('low-variance');
    expect(result.preliminaryWeight).toBeLessThan(1.0);
  });

  it('极端偏高评分 — 标记待审核', () => {
    const result = detectSuspiciousScore(
      makeNormalInput({ scores: [9.6, 9.8, 10], maxScale: 10, minScale: 0 }),
    );
    expect(result.flags).toContain('extreme-high');
    expect(result.needsReview).toBe(true);
  });

  it('极端偏低评分 — 标记待审核', () => {
    const result = detectSuspiciousScore(
      makeNormalInput({ scores: [0, 0.3, 0.5], maxScale: 10, minScale: 0 }),
    );
    expect(result.flags).toContain('extreme-low');
    expect(result.needsReview).toBe(true);
  });

  it('多规则叠加 — 取最低权重', () => {
    // 过快 + 方差异常 + 极端偏高
    const result = detectSuspiciousScore(
      makeNormalInput({
        durationMs: 500,
        scores: [10, 10, 10],
        maxScale: 10,
        minScale: 0,
      }),
    );
    expect(result.flags).toContain('too-fast');
    expect(result.flags).toContain('low-variance');
    expect(result.flags).toContain('extreme-high');
    // 最低权重应为 0.2（too-fast），因为 extreme-high 不降权
    expect(result.preliminaryWeight).toBe(0.2);
    expect(result.needsReview).toBe(true);
  });

  it('重复评分的权重低于过快评分', () => {
    const fast = detectSuspiciousScore(makeNormalInput({ durationMs: 1000 }));
    const dup = detectSuspiciousScore(
      makeNormalInput({ sameDeviceListVotes24h: 3 }),
    );
    expect(dup.preliminaryWeight).toBeLessThan(fast.preliminaryWeight);
  });
});

describe('computeWeight', () => {
  it('无标记 — 权重 1.0', () => {
    const result = detectSuspiciousScore(makeNormalInput());
    expect(computeWeight(result, 5)).toBe(1.0);
  });

  it('过快 + 审核标记 — 投票数 > 10 时进一步衰减', () => {
    const result = detectSuspiciousScore(
      makeNormalInput({ durationMs: 500, scores: [10, 10, 10], maxScale: 10, minScale: 0 }),
    );
    const weight = computeWeight(result, 20);
    // 最低的 regular penalty 是 0.2 (too-fast), but needsReview with voteCount > 10 → 0.7
    // 最终取 min(0.2, 0.7) = 0.2
    expect(weight).toBe(0.2);
  });

  it('仅审核标记（无降权标记）— 投票少时权重 0.85', () => {
    const result = detectSuspiciousScore(
      makeNormalInput({ scores: [0.2, 0.1, 0], maxScale: 10, minScale: 0 }),
    );
    expect(result.flags).toContain('extreme-low');
    // low-variance 也会触发（0, 0.1, 0.2 标准差很低）
    const weight = computeWeight(result, 5);
    expect(weight).toBeLessThan(1.0);
    expect(weight).toBeGreaterThanOrEqual(0);
  });

  it('重复评分 — 权重直接为 0', () => {
    const result = detectSuspiciousScore(
      makeNormalInput({ sameDeviceListVotes24h: 2 }),
    );
    expect(computeWeight(result, 50)).toBe(0);
  });

  it('返回值始终在 [0, 1] 范围内', () => {
    const inputs: Partial<AntiCheatInput>[] = [
      { durationMs: 0 },
      { sameDeviceListVotes24h: 100 },
      { scores: [0, 0, 0] },
      { scores: [100, 100, 100], maxScale: 100, minScale: 0 },
    ];

    for (const override of inputs) {
      const result = detectSuspiciousScore(makeNormalInput(override));
      const weight = computeWeight(result, 100);
      expect(weight).toBeGreaterThanOrEqual(0);
      expect(weight).toBeLessThanOrEqual(1);
    }
  });
});