import { describe, it, expect } from 'vitest';
import { analyzeSentiment } from './sentiment';

describe('analyzeSentiment', () => {
  it('中性文本返回 ≈0', () => {
    const result = analyzeSentiment('今天天气一般');
    expect(Math.abs(result)).toBeLessThan(0.3);
  });

  it('纯正面中文词返回 >0', () => {
    const result = analyzeSentiment('很好 推荐 喜欢');
    expect(result).toBeGreaterThan(0);
  });

  it('纯负面中文词返回 <0', () => {
    const result = analyzeSentiment('差 烂 垃圾');
    expect(result).toBeLessThan(0);
  });

  it('混合正负面词返回接近 0', () => {
    const result = analyzeSentiment('好 差 喜欢 讨厌');
    expect(Math.abs(result)).toBeLessThan(0.5);
  });

  it('英文正面词返回 >0', () => {
    const result = analyzeSentiment('This is great and amazing');
    expect(result).toBeGreaterThan(0);
  });

  it('英文负面词返回 <0', () => {
    const result = analyzeSentiment('This is terrible and awful');
    expect(result).toBeLessThan(0);
  });

  it('中英混合', () => {
    const result = analyzeSentiment('很good 非常bad');
    // good + bad 互相抵消，接近 0
    expect(Math.abs(result)).toBeLessThan(0.5);
  });

  it('空字符串返回 0', () => {
    expect(analyzeSentiment('')).toBe(0);
  });

  it('无匹配词返回 ≈0', () => {
    const result = analyzeSentiment('keyboard mouse screen');
    expect(Math.abs(result)).toBeLessThan(0.01);
  });

  it('结果在 [-1, +1] 区间内', () => {
    const result = analyzeSentiment('非常好 好优秀棒赞');
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(1);
  });
});