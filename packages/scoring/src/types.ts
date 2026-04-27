/**
 * 评分计算库 - 核心类型定义
 */

/** 待评分条目 */
export interface Item {
  id: string;
  name: string;
  scores: Record<string, number>;
  /** 用于贝叶斯收缩的评分人数 */
  ratingCount?: number;
}

/** 评分维度 */
export interface Dimension {
  id: string;
  name: string;
  weight: number;
  /** 维度分制（如100分制、5分制） */
  scale?: number;
}

/** 维度得分详情 */
export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number;
  weight: number;
  normalizedWeight: number;
}

/** 评分结果 */
export interface ScoredItem {
  item: Item;
  totalScore: number;
  rank: number;
  dimensionScores: DimensionScore[];
  explanation?: ExplanationNode;
}

/** 解释节点 */
export interface ExplanationNode {
  type: string;
  label: string;
  value: number | string;
  children?: ExplanationNode[];
}

/** 评分算法引擎接口 */
export interface ScoringEngine {
  id: string;
  name: string;
  describe(locale: 'zh' | 'en'): string;
  compute(items: Item[], dimensions: Dimension[]): ScoredItem[];
  explain?(item: ScoredItem): ExplanationNode;
}

/** 辅助：归一化权重，使总权重为1 */
export function normalizeWeights(dimensions: Dimension[]): { dimension: Dimension; normalizedWeight: number }[] {
  const totalWeight = dimensions.reduce((sum, d) => sum + Math.max(d.weight, 0), 0);
  if (totalWeight === 0) {
    // 所有权重为零时，均等分配
    return dimensions.map(d => ({ dimension: d, normalizedWeight: 1 / dimensions.length }));
  }
  return dimensions.map(d => ({
    dimension: d,
    normalizedWeight: Math.max(d.weight, 0) / totalWeight,
  }));
}