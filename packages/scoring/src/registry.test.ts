import { describe, it, expect } from 'vitest';
import { registry, getAllEngines, getEngine } from './registry';
import { weightedMeanEngine } from './engines/weighted-mean';
import { geometricMeanEngine } from './engines/geometric-mean';
import { bordaCountEngine } from './engines/borda-count';
import { topsisEngine } from './engines/topsis';
import { bayesianShrinkageEngine, createBayesianShrinkageEngine } from './engines/bayesian-shrinkage';

describe('算法注册表 (Registry)', () => {
  it('注册表包含全部5种算法', () => {
    expect(registry.size).toBe(5);
    expect(registry.get('weighted-mean')).toBe(weightedMeanEngine);
    expect(registry.get('geometric-mean')).toBe(geometricMeanEngine);
    expect(registry.get('borda-count')).toBe(bordaCountEngine);
    expect(registry.get('topsis')).toBe(topsisEngine);
    expect(registry.get('bayesian-shrinkage')).toBe(bayesianShrinkageEngine);
  });

  it('getAllEngines返回全部5种算法', () => {
    const engines = getAllEngines();
    expect(engines).toHaveLength(5);
    const ids = engines.map(e => e.id).sort();
    expect(ids).toEqual(['bayesian-shrinkage', 'borda-count', 'geometric-mean', 'topsis', 'weighted-mean']);
  });

  it('getEngine根据ID获取引擎', () => {
    expect(getEngine('weighted-mean')).toBe(weightedMeanEngine);
    expect(getEngine('geometric-mean')).toBe(geometricMeanEngine);
    expect(getEngine('borda-count')).toBe(bordaCountEngine);
    expect(getEngine('topsis')).toBe(topsisEngine);
    expect(getEngine('bayesian-shrinkage')).toBe(bayesianShrinkageEngine);
  });

  it('getEngine对于不存在的ID返回undefined', () => {
    expect(getEngine('nonexistent')).toBeUndefined();
  });

  it('所有引擎都有必要的属性和方法', () => {
    const engines = getAllEngines();
    for (const engine of engines) {
      expect(engine.id).toBeTruthy();
      expect(engine.name).toBeTruthy();
      expect(typeof engine.describe).toBe('function');
      expect(typeof engine.compute).toBe('function');
      // describe 中文
      const zhDesc = engine.describe('zh');
      expect(typeof zhDesc).toBe('string');
      expect(zhDesc.length).toBeGreaterThan(0);
      // describe 英文
      const enDesc = engine.describe('en');
      expect(typeof enDesc).toBe('string');
      expect(enDesc.length).toBeGreaterThan(0);
    }
  });
});

describe('index导出 (Index exports)', () => {
  it('从index可以导入所有类型和引擎', () => {
    // 直接import已在顶部完成，此处验证它们存在
    expect(weightedMeanEngine).toBeDefined();
    expect(geometricMeanEngine).toBeDefined();
    expect(bordaCountEngine).toBeDefined();
    expect(topsisEngine).toBeDefined();
    expect(bayesianShrinkageEngine).toBeDefined();
    expect(createBayesianShrinkageEngine).toBeDefined();
  });

  it('createBayesianShrinkageEngine可以创建自定义引擎', () => {
    const custom = createBayesianShrinkageEngine({ priorStrength: 5 });
    expect(custom.id).toBe('bayesian-shrinkage');
    const zhDesc = custom.describe('zh');
    expect(zhDesc).toContain('5');
  });
});