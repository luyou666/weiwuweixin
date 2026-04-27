import { describe, it, expect } from 'vitest';
import { bayesianShrinkageEngine, createBayesianShrinkageEngine } from './bayesian-shrinkage';
import type { Item, Dimension } from '../types';

describe('贝叶斯收缩算法 (Bayesian Shrinkage)', () => {
  // 测试组1：基本场景 - 评分人数少的条目更向均值收缩
  it('基本场景：评分人数少的条目向全局均值收缩', () => {
    const items: Item[] = [
      { id: 'few', name: '少评分', scores: { quality: 100, price: 100 }, ratingCount: 1 },
      { id: 'many', name: '多评分', scores: { quality: 100, price: 100 }, ratingCount: 100 },
      { id: 'avg', name: '平均分', scores: { quality: 70, price: 70 }, ratingCount: 50 },
    ];
    const dimensions: Dimension[] = [
      { id: 'quality', name: '质量', weight: 0.5 },
      { id: 'price', name: '价格', weight: 0.5 },
    ];

    const result = bayesianShrinkageEngine.compute(items, dimensions);
    expect(result).toHaveLength(3);

    const fewItem = result.find(r => r.item.id === 'few')!;
    const manyItem = result.find(r => r.item.id === 'many')!;

    expect(manyItem.totalScore).toBeGreaterThan(fewItem.totalScore);
    expect(manyItem.totalScore).toBeCloseTo(99.09, 1);
  });

  // 测试组2：自定义先验强度
  it('自定义先验强度参数', () => {
    const customEngine = createBayesianShrinkageEngine({ priorStrength: 5 });

    const items: Item[] = [
      { id: 'a', name: '测试A', scores: { x: 95 }, ratingCount: 5 },
      { id: 'b', name: '测试B', scores: { x: 85 }, ratingCount: 5 },
    ];
    const dimensions: Dimension[] = [
      { id: 'x', name: '维度X', weight: 1 },
    ];

    const result = customEngine.compute(items, dimensions);
    const aItem = result.find(r => r.item.id === 'a')!;
    const bItem = result.find(r => r.item.id === 'b')!;
    expect(aItem.totalScore).toBeCloseTo(92.5, 5);
    expect(bItem.totalScore).toBeCloseTo(87.5, 5);
  });

  // 测试组3：全零分数
  it('边界情况：全零分数', () => {
    const items: Item[] = [
      { id: 'z1', name: '零分1', scores: { a: 0, b: 0 }, ratingCount: 10 },
      { id: 'z2', name: '零分2', scores: { a: 0, b: 0 }, ratingCount: 5 },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = bayesianShrinkageEngine.compute(items, dimensions);
    expect(result[0].totalScore).toBeCloseTo(0, 10);
    expect(result[1].totalScore).toBeCloseTo(0, 10);
  });

  // 测试组4：单条目
  it('边界情况：单条目', () => {
    const items: Item[] = [
      { id: 'only', name: '唯一', scores: { a: 80, b: 90 }, ratingCount: 20 },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = bayesianShrinkageEngine.compute(items, dimensions);
    expect(result[0].totalScore).toBeCloseTo(85, 5);
    expect(result[0].rank).toBe(1);
  });

  // 测试组5：默认ratingCount为1
  it('默认ratingCount为1', () => {
    const items: Item[] = [
      { id: 'no_rating', name: '无评分人数', scores: { a: 90 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 1 },
    ];

    const result = bayesianShrinkageEngine.compute(items, dimensions);
    expect(result[0].totalScore).toBeCloseTo(90, 5);
  });

  // 测试组6：评分人数极大时接近原始分
  it('评分人数极大时收缩因子接近1', () => {
    const items: Item[] = [
      { id: 'large', name: '大评分量', scores: { a: 95, b: 85 }, ratingCount: 10000 },
      { id: 'small', name: '小评分量', scores: { a: 20, b: 30 }, ratingCount: 1 },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = bayesianShrinkageEngine.compute(items, dimensions);
    const largeItem = result.find(r => r.item.id === 'large')!;
    expect(largeItem.totalScore).toBeCloseTo(90, 0);
  });

  // 测试组7：权重归一化
  it('权重归一化：总权重不为1', () => {
    const items: Item[] = [
      { id: 'p1', name: 'P1', scores: { a: 90, b: 60 }, ratingCount: 10 },
      { id: 'p2', name: 'P2', scores: { a: 60, b: 90 }, ratingCount: 10 },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 3 },
      { id: 'b', name: '维度B', weight: 1 },
    ];

    const result = bayesianShrinkageEngine.compute(items, dimensions);
    const p1 = result.find(r => r.item.id === 'p1')!;
    const p2 = result.find(r => r.item.id === 'p2')!;
    expect(p1.totalScore).toBeCloseTo(78.75, 3);
    expect(p2.totalScore).toBeCloseTo(71.25, 3);
  });

  // 测试组8：describe和explain方法
  it('describe和explain方法', () => {
    const zh = bayesianShrinkageEngine.describe('zh');
    const en = bayesianShrinkageEngine.describe('en');
    expect(zh).toContain('贝叶斯收缩');
    expect(en).toContain('Bayesian');

    const items: Item[] = [
      { id: 't', name: '测试', scores: { a: 80 }, ratingCount: 10 },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 1 },
    ];

    const result = bayesianShrinkageEngine.compute(items, dimensions);
    const explanation = bayesianShrinkageEngine.explain!(result[0]);

    expect(explanation.type).toBe('bayesian-shrinkage');
    expect(explanation.label).toBe('贝叶斯收缩得分');
    const sfNode = explanation.children!.find(c => c.type === 'shrinkage-factor');
    expect(sfNode).toBeDefined();
    expect(sfNode!.value).toBeCloseTo(10 / 20, 5);
  });

  // 测试组9：缺失维度分数默认为0
  it('边界情况：缺失维度键默认为0', () => {
    const items: Item[] = [
      { id: 'miss', name: '缺失维度', scores: { a: 100 }, ratingCount: 10 },
      { id: 'full', name: '完整维度', scores: { a: 50, b: 50 }, ratingCount: 10 },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = bayesianShrinkageEngine.compute(items, dimensions);
    expect(result).toHaveLength(2);
    result.forEach(r => {
      expect(isFinite(r.totalScore)).toBe(true);
    });
  });

  // 测试组10：describe方法带自定义先验强度
  it('自定义先验强度的describe方法', () => {
    const customEngine = createBayesianShrinkageEngine({ priorStrength: 20 });
    const zh = customEngine.describe('zh');
    expect(zh).toContain('20');
  });
});
