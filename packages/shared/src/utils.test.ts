import { describe, it, expect } from 'vitest';
import { normalizeWeights, sigmoid, timeDecay, formatConfidence, cuid } from './utils';
import { CONFIDENCE_PARAMS } from './constants';

describe('normalizeWeights', () => {
  it('归一化到总和为 1', () => {
    const result = normalizeWeights([1, 2, 3]);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it('全零时均等分配', () => {
    const result = normalizeWeights([0, 0, 0]);
    result.forEach((w) => expect(w).toBeCloseTo(1 / 3, 10));
  });

  it('钳位负值为 0', () => {
    const result = normalizeWeights([-1, 2, 3]);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
    expect(result[0]).toBe(0);
  });

  it('单元素数组', () => {
    expect(normalizeWeights([5])).toEqual([1]);
  });
});

describe('sigmoid', () => {
  it('sigmoid(0) = 0.5', () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 10);
  });

  it('大正数趋近 1', () => {
    expect(sigmoid(100)).toBeCloseTo(1, 5);
  });

  it('大负数趋近 0', () => {
    expect(sigmoid(-100)).toBeCloseTo(0, 5);
  });

  it('输出在 (0, 1) 区间', () => {
    for (let x = -10; x <= 10; x += 1) {
      expect(sigmoid(x)).toBeGreaterThan(0);
      expect(sigmoid(x)).toBeLessThan(1);
    }
  });
});

describe('timeDecay', () => {
  it('0天衰减因子 = 1', () => {
    expect(timeDecay(0, 30)).toBe(1);
  });

  it('半衰期天数处衰减因子 = 0.5', () => {
    expect(timeDecay(30, 30)).toBeCloseTo(0.5, 5);
  });

  it('负天数返回 1（未来日期保护）', () => {
    expect(timeDecay(-5, 30)).toBe(1);
  });

  it('使用项目常量参数', () => {
    const result = timeDecay(30, CONFIDENCE_PARAMS.halfLifeDays);
    expect(result).toBeCloseTo(0.5, 5);
  });
});

describe('formatConfidence', () => {
  it('0 → "0%"', () => {
    expect(formatConfidence(0)).toBe('0%');
  });

  it('0.85 → "85%"', () => {
    expect(formatConfidence(0.85)).toBe('85%');
  });

  it('1 → "100%"', () => {
    expect(formatConfidence(1)).toBe('100%');
  });

  it('超范围值被钳位', () => {
    expect(formatConfidence(1.5)).toBe('100%');
    expect(formatConfidence(-0.2)).toBe('0%');
  });

  it('四舍五入', () => {
    expect(formatConfidence(0.855)).toBe('86%');
  });
});

describe('cuid', () => {
  it('以 c 开头', () => {
    expect(cuid().startsWith('c')).toBe(true);
  });

  it('每次生成不同 ID', () => {
    const ids = new Set(Array.from({ length: 100 }, cuid));
    expect(ids.size).toBe(100);
  });

  it('长度合理（>10 字符）', () => {
    expect(cuid().length).toBeGreaterThan(10);
  });
});