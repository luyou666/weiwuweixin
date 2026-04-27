import { describe, it, expect } from 'vitest';
import { bordaCountEngine } from './borda-count';
import type { Item, Dimension } from '../types';

describe('Borda排位分算法 (Borda Count)', () => {
  // 测试组1：基本场景 - 三个候选人两个维度
  it('基本场景：三个候选人两个维度', () => {
    const items: Item[] = [
      { id: 'a', name: '候选人A', scores: { quality: 90, service: 80 } },
      { id: 'b', name: '候选人B', scores: { quality: 80, service: 90 } },
      { id: 'c', name: '候选人C', scores: { quality: 70, service: 70 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'quality', name: '质量', weight: 0.5 },
      { id: 'service', name: '服务', weight: 0.5 },
    ];

    const result = bordaCountEngine.compute(items, dimensions);

    expect(result).toHaveLength(3);
    // 质量排名: A(2分), B(1分), C(0分)
    // 服务排名: B(2分), A(1分), C(0分)
    // A: 2*0.5 + 1*0.5 = 1.5
    // B: 1*0.5 + 2*0.5 = 1.5
    // C: 0*0.5 + 0*0.5 = 0
    const scoreA = result.find(r => r.item.id === 'a')!;
    const scoreB = result.find(r => r.item.id === 'b')!;
    const scoreC = result.find(r => r.item.id === 'c')!;

    expect(scoreA.totalScore).toBeCloseTo(1.5, 10);
    expect(scoreB.totalScore).toBeCloseTo(1.5, 10);
    expect(scoreC.totalScore).toBeCloseTo(0, 10);
  });

  // 测试组2：权重不等
  it('不同权重下的Borda排位分', () => {
    const items: Item[] = [
      { id: 'x', name: '产品X', scores: { a: 100, b: 50 } },
      { id: 'y', name: '产品Y', scores: { a: 50, b: 100 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.75 },
      { id: 'b', name: '维度B', weight: 0.25 },
    ];

    const result = bordaCountEngine.compute(items, dimensions);

    // 维度A排名: X(1分), Y(0分)
    // 维度B排名: Y(1分), X(0分)
    // X: 1*0.75 + 0*0.25 = 0.75
    // Y: 0*0.75 + 1*0.25 = 0.25
    expect(result[0].item.id).toBe('x');
    expect(result[0].totalScore).toBeCloseTo(0.75, 10);
    expect(result[1].item.id).toBe('y');
    expect(result[1].totalScore).toBeCloseTo(0.25, 10);
  });

  // 测试组3：单条目
  it('边界情况：单条目总是得0', () => {
    const items: Item[] = [
      { id: 'only', name: '唯一', scores: { a: 100, b: 100 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = bordaCountEngine.compute(items, dimensions);
    expect(result[0].totalScore).toBe(0);
    expect(result[0].rank).toBe(1);
  });

  // 测试组4：全零分数
  it('边界情况：全零分数', () => {
    const items: Item[] = [
      { id: 'z1', name: '零分1', scores: { a: 0, b: 0 } },
      { id: 'z2', name: '零分2', scores: { a: 0, b: 0 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = bordaCountEngine.compute(items, dimensions);
    expect(result).toHaveLength(2);
  });

  // 测试组5：权重归一化
  it('权重归一化：总权重不为1', () => {
    const items: Item[] = [
      { id: 'p1', name: 'P1', scores: { a: 10, b: 20 } },
      { id: 'p2', name: 'P2', scores: { a: 20, b: 10 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 2 },
      { id: 'b', name: '维度B', weight: 1 },
    ];

    const result = bordaCountEngine.compute(items, dimensions);

    const p1 = result.find(r => r.item.id === 'p1')!;
    const p2 = result.find(r => r.item.id === 'p2')!;
    // P1: 0*(2/3) + 1*(1/3) = 1/3
    // P2: 1*(2/3) + 0*(1/3) = 2/3
    expect(p1.totalScore).toBeCloseTo(1 / 3, 5);
    expect(p2.totalScore).toBeCloseTo(2 / 3, 5);
  });

  // 测试组6：describe和explain方法
  it('describe和explain方法', () => {
    const zh = bordaCountEngine.describe('zh');
    const en = bordaCountEngine.describe('en');
    expect(zh).toContain('Borda');
    expect(en).toContain('Borda');

    const items: Item[] = [
      { id: 't', name: '测试', scores: { a: 80, b: 70 } },
      { id: 't2', name: '测试2', scores: { a: 70, b: 80 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = bordaCountEngine.compute(items, dimensions);
    const explanation = bordaCountEngine.explain!(result[0]);

    expect(explanation.type).toBe('borda-count');
    expect(explanation.label).toBe('Borda排位分');
    expect(explanation.children).toHaveLength(2);
  });

  // 测试组7：三个条目清晰排名
  it('三个条目清晰排名场景', () => {
    const items: Item[] = [
      { id: 'top', name: '顶尖', scores: { a: 95, b: 90, c: 85 } },
      { id: 'mid', name: '中等', scores: { a: 75, b: 70, c: 65 } },
      { id: 'low', name: '较低', scores: { a: 55, b: 50, c: 45 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.4 },
      { id: 'b', name: '维度B', weight: 0.35 },
      { id: 'c', name: '维度C', weight: 0.25 },
    ];

    const result = bordaCountEngine.compute(items, dimensions);
    expect(result[0].item.id).toBe('top');
    expect(result[0].totalScore).toBeCloseTo(2, 10);
    expect(result[1].item.id).toBe('mid');
    expect(result[1].totalScore).toBeCloseTo(1, 10);
    expect(result[2].item.id).toBe('low');
    expect(result[2].totalScore).toBeCloseTo(0, 10);
  });

  // 测试组8：缺失维度分数默认为0
  it('缺失维度分数默认为0', () => {
    const items: Item[] = [
      { id: 'miss', name: '缺失维度', scores: { a: 100 } },
      { id: 'full', name: '完整维度', scores: { a: 50, b: 50 } },
    ];
    const dimensions: Dimension[] = [
      { id: 'a', name: '维度A', weight: 0.5 },
      { id: 'b', name: '维度B', weight: 0.5 },
    ];

    const result = bordaCountEngine.compute(items, dimensions);
    const missItem = result.find(r => r.item.id === 'miss')!;
    const fullItem = result.find(r => r.item.id === 'full')!;
    expect(missItem.totalScore).toBeCloseTo(0.5, 10);
    expect(fullItem.totalScore).toBeCloseTo(0.5, 10);
  });
});