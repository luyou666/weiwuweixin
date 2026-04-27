import type { Item, Dimension, ScoredItem, ExplanationNode, ScoringEngine } from '../types';
import { normalizeWeights } from '../types';

export const geometricMeanEngine: ScoringEngine = {
  id: 'geometric-mean',
  name: '几何平均',

  describe(locale: 'zh' | 'en'): string {
    if (locale === 'zh') {
      return '几何平均算法：总分 = (∏(sᵢ^wᵢ))^(1/∑wᵢ)，惩罚短板效应明显。';
    }
    return 'Geometric Mean: total = (∏(sᵢ^wᵢ))^(1/∑wᵢ), penalizes weak dimensions significantly.';
  },

  compute(items: Item[], dimensions: Dimension[]): ScoredItem[] {
    const normalized = normalizeWeights(dimensions);

    const scored: ScoredItem[] = items.map(item => {
      const dimensionScores = normalized.map(({ dimension, normalizedWeight }) => {
        const rawScore = item.scores[dimension.id] ?? 0;
        return {
          dimensionId: dimension.id,
          dimensionName: dimension.name,
          score: rawScore,
          weight: dimension.weight,
          normalizedWeight,
        };
      });

      // 几何平均: ∏(sᵢ^wᵢ)^(1/∑wᵢ) = ∏(sᵢ^normalizedWeight)
      // 但需要处理零和负分数：零分→极小正数(0.01)，负分→取绝对值后标记负
      let totalScore: number;
      const allZero = dimensionScores.every(ds => ds.score === 0);

      if (allZero) {
        totalScore = 0;
      } else {
        let product = 1;
        let hasZero = false;
        for (const ds of dimensionScores) {
          // 如果任何维度分数为0，几何平均趋向0（惩罚短板）
          if (ds.score <= 0) {
            hasZero = true;
            // 将0和负数映射为极小正值用于计算，但最终结果惩罚
            product *= Math.pow(Math.max(ds.score, 0.01), ds.normalizedWeight);
          } else {
            product *= Math.pow(ds.score, ds.normalizedWeight);
          }
        }
        totalScore = hasZero ? 0 : product;
      }

      return {
        item,
        totalScore,
        rank: 0,
        dimensionScores,
      };
    });

    scored.sort((a, b) => b.totalScore - a.totalScore);
    scored.forEach((s, i) => {
      s.rank = i + 1;
    });

    return scored;
  },

  explain(item: ScoredItem): ExplanationNode {
    const children: ExplanationNode[] = item.dimensionScores.map(ds => ({
      type: 'dimension',
      label: ds.dimensionName,
      value: `${ds.score}^${ds.normalizedWeight.toFixed(2)}`,
      children: [
        { type: 'raw-score', label: '原始分数', value: ds.score },
        { type: 'exponent', label: '指数(归一化权重)', value: ds.normalizedWeight },
      ],
    }));

    return {
      type: 'geometric-mean',
      label: '几何平均得分',
      value: item.totalScore,
      children,
    };
  },
};