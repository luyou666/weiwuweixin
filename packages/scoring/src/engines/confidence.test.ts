import { describe, it, expect } from 'vitest';
import {
  kendallTau,
  timeDecay,
  computeConfidence,
  explainConfidence,
} from './confidence';
import type { ConfidenceParams } from './confidence';

// ─── kendallTau ─────────────────────────────────────────

describe('kendallTau', () => {
  it('完全一致的排序返回1', () => {
    const author = ['A', 'B', 'C', 'D'];
    const community = ['A', 'B', 'C', 'D'];
    expect(kendallTau(author, community)).toBeCloseTo(1, 10);
  });

  it('完全逆序返回-1', () => {
    const author = ['A', 'B', 'C', 'D'];
    const community = ['D', 'C', 'B', 'A'];
    expect(kendallTau(author, community)).toBeCloseTo(-1, 10);
  });

  it('部分逆序（一对交换）返回正确值', () => {
    const author = ['A', 'B', 'C', 'D'];
    const community = ['A', 'C', 'B', 'D'];
    // (A,B): rank(A)=0 < rank(B)=2 → concordant
    // (A,C): rank(A)=0 < rank(C)=1 → concordant
    // (A,D): rank(A)=0 < rank(D)=3 → concordant
    // (B,C): rank(B)=2 > rank(C)=1 → discordant
    // (B,D): rank(B)=2 < rank(D)=3 → concordant
    // (C,D): rank(C)=1 < rank(D)=3 → concordant
    // τ = (5-1)/6 = 0.6667
    expect(kendallTau(author, community)).toBeCloseTo(2 / 3, 5);
  });

  it('空数组或单元素返回1', () => {
    expect(kendallTau([], [])).toBe(1);
    expect(kendallTau(['A'], ['A'])).toBe(1);
  });

  it('只取交集：忽略仅在一个列表中的元素', () => {
    const author = ['A', 'B', 'C', 'X'];
    const community = ['A', 'B', 'C', 'Y'];
    expect(kendallTau(author, community)).toBeCloseTo(1, 10);
  });

  it('无共同元素时返回1（退化为单元素场景）', () => {
    const author = ['X', 'Y'];
    const community = ['A', 'B'];
    expect(kendallTau(author, community)).toBe(1);
  });
});

// ─── timeDecay ─────────────────────────────────────────

describe('timeDecay', () => {
  it('0天时衰减为1', () => {
    expect(timeDecay(0)).toBe(1);
  });

  it('负天数时衰减为1', () => {
    expect(timeDecay(-5)).toBe(1);
  });

  it('半衰期30天时，30天后衰减为0.5', () => {
    expect(timeDecay(30, 30)).toBeCloseTo(0.5, 10);
  });

  it('半衰期30天时，60天后衰减为0.25', () => {
    expect(timeDecay(60, 30)).toBeCloseTo(0.25, 10);
  });

  it('自定义半衰期：半衰期10天，10天后衰减为0.5', () => {
    expect(timeDecay(10, 10)).toBeCloseTo(0.5, 10);
  });

  it('半衰期为0或负数时返回1（防止除零）', () => {
    expect(timeDecay(10, 0)).toBe(1);
    expect(timeDecay(10, -5)).toBe(1);
  });
});

// ─── computeConfidence ──────────────────────────────────

describe('computeConfidence', () => {
  it('基本场景：N=10, tau=0.8, sentiment=0.5, daysSinceLastVote=0', () => {
    const params: ConfidenceParams = {
      N: 10,
      tau: 0.8,
      sentiment: 0.5,
      daysSinceLastVote: 0,
    };
    const result = computeConfidence(params);
    // 手动验证:
    // logFactor = 0.6 * log(11) ≈ 0.6 * 2.3979 = 1.4387
    // tauFactor = 1.2 * 0.8 = 0.96
    // sentimentFactor = 0.4 * 0.5 = 0.2
    // sigmoidInput ≈ 1.4387 + 0.96 + 0.2 = 2.5987
    // sigmoid(2.5987) ≈ 0.9312
    // timeDecay(0) = 1
    // confidence ≈ 100 * 0.9312 * 1 = 93.12
    expect(result).toBeCloseTo(93.12, 1);
  });

  it('低参与度+低共识+负面情感：结果较低', () => {
    const params: ConfidenceParams = {
      N: 1,
      tau: -0.5,
      sentiment: -0.8,
      daysSinceLastVote: 0,
    };
    const result = computeConfidence(params);
    // logFactor = 0.6 * log(2) ≈ 0.4159
    // tauFactor = 1.2 * (-0.5) = -0.6
    // sentimentFactor = 0.4 * (-0.8) = -0.32
    // sigmoidInput ≈ 0.4159 - 0.6 - 0.32 = -0.5041
    // sigmoid(-0.5041) ≈ 0.3767
    // confidence ≈ 37.67
    expect(result).toBeLessThan(50);
    expect(result).toBeCloseTo(37.67, 0);
  });

  it('时间衰减：30天后，置信度减半', () => {
    const baseParams: ConfidenceParams = {
      N: 10,
      tau: 0.5,
      sentiment: 0,
      daysSinceLastVote: 0,
    };
    const decayedParams: ConfidenceParams = {
      ...baseParams,
      daysSinceLastVote: 30,
    };
    const base = computeConfidence(baseParams);
    const decayed = computeConfidence(decayedParams);
    expect(decayed).toBeCloseTo(base * 0.5, 5);
  });

  it('自定义参数：alpha=1, beta=2, gamma=0', () => {
    const params: ConfidenceParams = {
      N: 10,
      tau: 0,
      sentiment: 0.5,
      daysSinceLastVote: 0,
      alpha: 1,
      beta: 2,
      gamma: 0,
    };
    const result = computeConfidence(params);
    // logFactor = 1 * log(11) ≈ 2.3979
    // tauFactor = 2 * 0 = 0
    // sentimentFactor = 0 * 0.5 = 0
    // sigmoidInput ≈ 2.3979
    // sigmoid(2.3979) ≈ 0.9167
    // confidence ≈ 91.67
    expect(result).toBeCloseTo(91.67, 0);
  });

  it('极大N时置信度趋近100（无衰减）', () => {
    const params: ConfidenceParams = {
      N: 100000,
      tau: 0.5,
      sentiment: 0,
      daysSinceLastVote: 0,
    };
    const result = computeConfidence(params);
    expect(result).toBeGreaterThan(99);
  });

  it('自定义半衰期', () => {
    const params: ConfidenceParams = {
      N: 10,
      tau: 0.5,
      sentiment: 0,
      daysSinceLastVote: 10,
      halfLife: 10,
    };
    const result = computeConfidence(params);
    const noDecay = computeConfidence({ ...params, daysSinceLastVote: 0, halfLife: 10 });
    expect(result).toBeCloseTo(noDecay * 0.5, 5);
  });

  it('返回值范围在0-100之间', () => {
    const extremeNeg: ConfidenceParams = {
      N: 0,
      tau: -1,
      sentiment: -1,
      daysSinceLastVote: 0,
    };
    const result = computeConfidence(extremeNeg);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

// ─── explainConfidence ──────────────────────────────────

describe('explainConfidence', () => {
  it('返回结构正确的ExplanationNode', () => {
    const params: ConfidenceParams = {
      N: 10,
      tau: 0.8,
      sentiment: 0.5,
      daysSinceLastVote: 15,
    };
    const explanation = explainConfidence(params);

    expect(explanation.type).toBe('confidence');
    expect(explanation.label).toBe('置信度');
    expect(typeof explanation.value).toBe('number');
    expect(explanation.value).toBeCloseTo(computeConfidence(params), 10);
    expect(explanation.children).toBeDefined();
    expect(explanation.children!.length).toBe(5);
  });

  it('包含所有因子子节点', () => {
    const params: ConfidenceParams = {
      N: 5,
      tau: 0.3,
      sentiment: -0.2,
      daysSinceLastVote: 10,
      alpha: 0.5,
      beta: 1.0,
      gamma: 0.3,
      halfLife: 20,
    };
    const explanation = explainConfidence(params);
    const children = explanation.children!;

    const types = children.map(c => c.type);
    expect(types).toContain('users-factor');
    expect(types).toContain('consensus-factor');
    expect(types).toContain('sentiment-factor');
    expect(types).toContain('sigmoid-value');
    expect(types).toContain('time-decay');

    // 检查 users-factor 子节点的值
    const usersFactor = children.find(c => c.type === 'users-factor')!;
    expect(usersFactor.value).toBeCloseTo(0.5 * Math.log(1 + 5), 5);

    // 检查共识因子
    const consensusFactor = children.find(c => c.type === 'consensus-factor')!;
    expect(consensusFactor.value).toBeCloseTo(1.0 * 0.3, 5);

    // 检查情感因子
    const sentimentFactor = children.find(c => c.type === 'sentiment-factor')!;
    expect(sentimentFactor.value).toBeCloseTo(0.3 * (-0.2), 5);

    // 检查时间衰减
    const timeDecayNode = children.find(c => c.type === 'time-decay')!;
    expect(timeDecayNode.value).toBeCloseTo(Math.pow(0.5, 10 / 20), 5);

    // 检查嵌套子节点
    const usersChildren = usersFactor.children!;
    expect(usersChildren.find(c => c.type === 'user-count')!.value).toBe(5);
    expect(usersChildren.find(c => c.type === 'alpha')!.value).toBe(0.5);
  });

  it('使用默认参数时子节点值正确', () => {
    const params: ConfidenceParams = {
      N: 100,
      tau: 1,
      sentiment: 1,
      daysSinceLastVote: 0,
    };
    const explanation = explainConfidence(params);
    const children = explanation.children!;

    const usersFactor = children.find(c => c.type === 'users-factor')!;
    expect(usersFactor.children!.find(c => c.type === 'alpha')!.value).toBe(0.6);

    const consensusFactor = children.find(c => c.type === 'consensus-factor')!;
    expect(consensusFactor.children!.find(c => c.type === 'beta')!.value).toBe(1.2);

    const sentimentFactor = children.find(c => c.type === 'sentiment-factor')!;
    expect(sentimentFactor.children!.find(c => c.type === 'gamma')!.value).toBe(0.4);

    const timeDecayNode = children.find(c => c.type === 'time-decay')!;
    expect(timeDecayNode.children!.find(c => c.type === 'half-life')!.value).toBe(30);
  });
});