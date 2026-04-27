import { describe, it, expect } from 'vitest';
import { topsisEngine } from './topsis';
import type { Item, Dimension } from '../types';

describe('TOPSIS理想解算法', () => {
  // 测试组1：基本场景
  it('基本场景：三个方案两个维度', () => {
    const items: Item[] = [
      { id: 'a', name: '方案A', scores: { cost: 250, quality: 16 } },
      { id: 'b', name: '方案B', scores: { cost: 200, quality: 16 } },
      { id: 'c', name: '方案C', scores: { cost: 300, quality: 20 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'cost', name: '成本', weight: 0.5 },
      { id: 'quality', name: '质量', weight: 0.5 },
    ];

    const result = topsisEngine.compute(items, dimensions);

    expect(result).toHaveLength(3);
    expect(result[0].totalScore).toBeGreaterThan(0);
    expect(result[0].totalScore).toBeLessThanOrEqual(1);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].totalScore).toBeLessThanOrEqual(result[i - 1].totalScore);
    }
  });

  // 测试组2：最优方案应最接近PIS
  it('最优方案在所有维度均为最高分', () => {
    const items: Item[] = [
      { id: 'best', name: '最优', scores: { a: 100, b: 100 } },
      { id: 'worst', name: '最差', scores: { a: 10, b: 10 } },
      { id: 'mid', name: '中等', scores: { a: 50, b: 50 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    expect(result[0].item.id).toBe('best');
    expect(result[0].totalScore).toBeCloseTo(1, 5);
    expect(result[result.length - 1].item.id).toBe('worst');
    expect(result[result.length - 1].totalScore).toBeCloseTo(0, 5);
  });

  // 测试组3：全零分数
  it('边界情况：全零分数', () => {
    const items: Item[] = [
      { id: 'z1', name: '零分1', scores: { a: 0, b: 0 } },
      { id: 'z2', name: '零分2', scores: { a: 0, b: 0 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    expect(result).toHaveLength(2);
    expect(result[0].totalScore).toBe(0);
    expect(result[1].totalScore).toBe(0);
  });

  // 测试组4：单条目
  it('边界情况：单条目排名应为1', () => {
    const items: Item[] = [
      { id: 'only', name: '唯一', scores: { a: 80, b: 90 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    expect(result).toHaveLength(1);
    expect(result[0].rank).toBe(1);
    expect(result[0].totalScore).toBeGreaterThanOrEqual(0);
    expect(result[0].totalScore).toBeLessThanOrEqual(1);
  });

  // 测试组5：权重不同
  it('不同权重影响排序', () => {
    const items: Item[] = [
      { id: 'x', name: '产品X', scores: { a: 90, b: 30 } },
      { id: 'y', name: '产品Y', scores: { a: 30, b: 90 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.9 },
      { id: 'b', name: '维度B', weight: 0.1 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    expect(result[0].item.id).toBe('x');
  });

  // 测试组6：权重归一化
  it('权重归一化：总权重不为1', () => {
    const items: Item[] = [
      { id: 'p1', name: 'P1', scores: { a: 100, b: 50 } },
      { id: 'p2', name: 'P2', scores: { a: 50, b: 100 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 3 },
      { id: 'b', name: '维度B', weight: 1 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    expect(result).toHaveLength(2);
    expect(result[0].item.id).toBe('p1');
  });

  // 测试组7：describe和explain方法
  it('describe和explain方法', () => {
    const zh = topsisEngine.describe('zh');
    const en = topsisEngine.describe('en');
    expect(zh).toContain('TOPSIS');
    expect(en).toContain('TOPSIS');

    const items: Item[] = [
      { id: 't', name: '测试', scores: { a: 80, b: 70 } },
      { id: 't2', name: '测试2', scores: { a: 70, b: 80 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    const explanation = topsisEngine.explain!(result[0]);

    expect(explanation.type).toBe('topsis');
    expect(explanation.label).toBe('TOPSIS相对接近度');
    expect(explanation.children).toBeDefined();
  });

  // 测试组8：三个维度
  it('三个维度场景', () => {
    const items: Item[] = [
      { id: 'h', name: '高分', scores: { a: 95, b: 90, c: 85 } },
      { id: 'l', name: '低分', scores: { a: 50, b: 45, c: 40 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.4 },
      { id: 'b', name: '维度B', weight: 0.35 },
      { id: 'c', name: '维度C', weight: 0.25 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    expect(result[0].item.id).toBe('h');
    expect(result[0].totalScore).toBeCloseTo(1, 2);
    expect(result[1].totalScore).toBeCloseTo(0, 2);
  });

  // 测试组9：空数组
  it('边界情况：空数组', () => {
    const result = topsisEngine.compute([], [
      { id: 'a', name: '维度A', weight: 0.5 },
    ]);
    expect(result).toHaveLength(0);
  });

  // 测试组10：缺失维度分数默认为0
  it('边界情况：缺失维度键默认为0', () => {
    const items: Item[] = [
      { id: 'miss', name: '缺失维度', scores: { a: 100 } },
      { id: 'full', name: '完整维度', scores: { a: 50, b: 50 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    expect(result).toHaveLength(2);
    result.forEach(r => {
      expect(r.totalScore).toBeGreaterThanOrEqual(0);
      expect(r.totalScore).toBeLessThanOrEqual(1);
    });
  });

  // 测试组11：负分数
  it('边界情况：含负分数', () => {
    const items: Item[] = [
      { id: 'neg', name: '含负分', scores: { a: -10, b: 80 } },
      { id: 'pos', name: '全正分', scores: { a: 50, b: 50 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = topsisEngine.compute(items, dimensions);
    expect(result).toHaveLength(2);
    result.forEach(r => {
      expect(r.totalScore).toBeGreaterThanOrEqual(0);
      expect(r.totalScore).toBeLessThanOrEqual(1);
    });
  });
});
