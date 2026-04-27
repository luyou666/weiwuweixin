import { describe, it, expect } from 'vitest';
import { weightedMeanEngine } from './weighted-mean';
import type { Item, Dimension } from '../types';

describe('加权平均算法 (Weighted Mean)', () => {
  // 测试组1：基本场景 - 三个候选人四个维度
  it('基本场景：三个候选人四个维度评分', () => {
    const items: Item[] = [
      { id: 'a', name: '张三', scores: { quality: 90, price: 80, service: 85, brand: 70 } },
      { id: 'b', name: '李四', scores: { quality: 70, price: 95, service: 60, brand: 80 } },
      { id: 'c', name: '王五', scores: { quality: 80, price: 70, service: 90, brand: 60 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'quality', name: '质量', weight: 0.4 },
      { id: 'price', name: '价格', weight: 0.3 },
      { id: 'service', name: '服务', weight: 0.2 },
      { id: 'brand', name: '品牌', weight: 0.1 },
    ];

    const result = weightedMeanEngine.compute(items, dimensions);

    expect(result).toHaveLength(3);
    // 张三: 90*0.4 + 80*0.3 + 85*0.2 + 70*0.1 = 36+24+17+7 = 84
    // 李四: 70*0.4 + 95*0.3 + 60*0.2 + 80*0.1 = 28+28.5+12+8 = 76.5
    // 王五: 80*0.4 + 70*0.3 + 90*0.2 + 60*0.1 = 32+21+18+6 = 77
    expect(result[0].item.id).toBe('a');
    expect(result[0].totalScore).toBeCloseTo(84, 10);
    expect(result[0].rank).toBe(1);
    expect(result[1].item.id).toBe('c');
    expect(result[1].totalScore).toBeCloseTo(77, 10);
    expect(result[2].item.id).toBe('b');
    expect(result[2].totalScore).toBeCloseTo(76.5, 10);
  });

  // 测试组2：权重归一化 - 权重总和不为1
  it('权重归一化：总权重不为1时自动归一化', () => {
    const items: Item[] = [
      { id: 'x', name: '产品X', scores: { a: 80, b: 60 } },
      { id: 'y', name: '产品Y', scores: { a: 60, b: 80 } },
    ];
    // 总权重是 4+6=10, 归一化后 a=0.4, b=0.6
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 4 },
      { id: 'b', name: '维度B', weight: 6 },
    ];

    const result = weightedMeanEngine.compute(items, dimensions);

    // 产品X: 80*0.4 + 60*0.6 = 32+36 = 68
    // 产品Y: 60*0.4 + 80*0.6 = 24+48 = 72
    expect(result[0].item.id).toBe('y');
    expect(result[0].totalScore).toBeCloseTo(72, 10);
    expect(result[1].totalScore).toBeCloseTo(68, 10);
  });

  // 测试组3：全零权重 - 均等分配
  it('边界情况：全零权重时均等分配', () => {
    const items: Item[] = [
      { id: 'p', name: '产品P', scores: { a: 90, b: 60 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0 },
      { id: 'b', name: '维度B', weight: 0 },
    ];

    const result = weightedMeanEngine.compute(items, dimensions);

    // 均等权重: a=0.5, b=0.5
    // 90*0.5 + 60*0.5 = 75
    expect(result).toHaveLength(1);
    expect(result[0].totalScore).toBeCloseTo(75, 10);
    expect(result[0].rank).toBe(1);
  });

  // 测试组4：全零分数
  it('边界情况：所有分数为零', () => {
    const items: Item[] = [
      { id: 'z1', name: '零分者1', scores: { a: 0, b: 0 } },
      { id: 'z2', name: '零分者2', scores: { a: 0, b: 0 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = weightedMeanEngine.compute(items, dimensions);

    expect(result).toHaveLength(2);
    expect(result[0].totalScore).toBe(0);
    expect(result[1].totalScore).toBe(0);
  });

  // 测试组5：单条目
  it('边界情况：单个条目', () => {
    const items: Item[] = [
      { id: 'only', name: '唯一', scores: { a: 100, b: 50 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 1 },
      { id: 'b', name: '维度B', weight: 1 },
    ];

    const result = weightedMeanEngine.compute(items, dimensions);

    expect(result).toHaveLength(1);
    expect(result[0].totalScore).toBeCloseTo(75, 10);
    expect(result[0].rank).toBe(1);
  });

  // 测试组6：负分数处理
  it('边界情况：负分数', () => {
    const items: Item[] = [
      { id: 'neg', name: '负分项', scores: { a: -10, b: 30 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = weightedMeanEngine.compute(items, dimensions);

    expect(result[0].totalScore).toBeCloseTo(10, 10);
  });

  // 测试组7：describe 方法
  it('describe方法返回中英文描述', () => {
    const zh = weightedMeanEngine.describe('zh');
    const en = weightedMeanEngine.describe('en');
    expect(zh).toContain('加权平均');
    expect(en).toContain('Weighted Mean');
  });

  // 测试组8：explain 方法
  it('explain方法返回有意义的解释节点', () => {
    const items: Item[] = [
      { id: 't', name: '测试', scores: { a: 80, b: 60 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.6 },
      { id: 'b', name: '维度B', weight: 0.4 },
    ];

    const result = weightedMeanEngine.compute(items, dimensions);
    const explanation = weightedMeanEngine.explain!(result[0]);

    expect(explanation.type).toBe('weighted-mean');
    expect(explanation.label).toBe('加权平均得分');
    expect(explanation.value).toBeCloseTo(72, 10);
    expect(explanation.children).toHaveLength(2);
    expect(explanation.children![0].type).toBe('dimension');
  });

  // 测试组9：缺失维度分数默认为0
  it('缺失维度分数默认为0', () => {
    const items: Item[] = [
      { id: 'miss', name: '缺失维度', scores: { a: 100 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = weightedMeanEngine.compute(items, dimensions);
    // 100*0.5 + 0*0.5 = 50
    expect(result[0].totalScore).toBeCloseTo(50, 10);
  });
});