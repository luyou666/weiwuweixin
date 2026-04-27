import { describe, it, expect } from 'vitest';
import { geometricMeanEngine } from './geometric-mean';
import type { Item, Dimension } from '../types';

describe('几何平均算法 (Geometric Mean)', () => {
  // 测试组1：基本场景 - 两个产品两个维度
  it('基本场景：惩罚短板效应', () => {
    const items: Item[] = [
      { id: 'a', name: '均衡型', scores: { quality: 80, price: 80 } },
      { id: 'b', name: '偏科型', scores: { quality: 95, price: 60 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'quality', name: '质量', weight: 0.5 },
      { id: 'price', name: '价格', weight: 0.5 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);

    expect(result).toHaveLength(2);
    expect(result[0].item.id).toBe('a');
    expect(result[0].totalScore).toBeCloseTo(80, 5);
    expect(result[1].item.id).toBe('b');
    expect(result[1].totalScore).toBeCloseTo(75.5, 1);
  });

  // 测试组2：不同权重
  it('不同权重下的几何平均', () => {
    const items: Item[] = [
      { id: 'x', name: '产品X', scores: { a: 100, b: 50 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.75 },
      { id: 'b', name: '维度B', weight: 0.25 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);
    expect(result).toHaveLength(1);
    expect(result[0].totalScore).toBeCloseTo(84.09, 1);
  });

  // 测试组3：含零分维度
  it('边界情况：含零分维度时总分惩罚为0', () => {
    const items: Item[] = [
      { id: 'zero', name: '零分项', scores: { a: 100, b: 0 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);
    expect(result[0].totalScore).toBe(0);
  });

  // 测试组4：全零分数
  it('边界情况：全零分数', () => {
    const items: Item[] = [
      { id: 'allzero', name: '全零', scores: { a: 0, b: 0 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);
    expect(result[0].totalScore).toBe(0);
  });

  // 测试组5：单条目
  it('边界情况：单个条目', () => {
    const items: Item[] = [
      { id: 'only', name: '唯一', scores: { a: 90, b: 70 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);
    expect(result).toHaveLength(1);
    expect(result[0].totalScore).toBeCloseTo(79.37, 1);
    expect(result[0].rank).toBe(1);
  });

  // 测试组6：负分数处理
  it('边界情况：负分数视为短板惩罚为0', () => {
    const items: Item[] = [
      { id: 'neg', name: '负分项', scores: { a: -5, b: 80 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);
    expect(result[0].totalScore).toBe(0);
  });

  // 测试组7：权重归一化
  it('权重归一化：总权重不为1', () => {
    const items: Item[] = [
      { id: 'p', name: '产品P', scores: { a: 100, b: 100 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 3 },
      { id: 'b', name: '维度B', weight: 7 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);
    expect(result[0].totalScore).toBeCloseTo(100, 5);
  });

  // 测试组8：缺失维度分数默认为0
  it('边界情况：缺失维度键默认为0，触发短板惩罚', () => {
    const items: Item[] = [
      { id: 'miss', name: '缺失维度', scores: { a: 100 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);
    // b缺失→0→短板惩罚，总分应为0
    expect(result[0].totalScore).toBe(0);
  });

  // 测试组9：describe和explain
  it('describe和explain方法', () => {
    const zh = geometricMeanEngine.describe('zh');
    const en = geometricMeanEngine.describe('en');
    expect(zh).toContain('几何平均');
    expect(en).toContain('Geometric Mean');

    const items: Item[] = [
      { id: 't', name: '测试', scores: { a: 80, b: 90 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = geometricMeanEngine.compute(items, dimensions);
    const explanation = geometricMeanEngine.explain!(result[0]);

    expect(explanation.type).toBe('geometric-mean');
    expect(explanation.label).toBe('几何平均得分');
    expect(explanation.children).toHaveLength(2);
  });
});
