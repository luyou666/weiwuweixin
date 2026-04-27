import { normalizeWeights } from '../types';
/** 创建贝叶斯收缩算法引擎 */
export function createBayesianShrinkageEngine(options) {
    const priorStrength = options?.priorStrength ?? 10;
    return {
        id: 'bayesian-shrinkage',
        name: '贝叶斯收缩',
        describe(locale) {
            if (locale === 'zh') {
                return `贝叶斯收缩算法：向全局均值收缩，shrinkage_factor = n/(n+m)，n为评分人数，m为先验强度(${priorStrength})。`;
            }
            return `Bayesian Shrinkage: shrinks toward global mean, factor = n/(n+m), n=ratings count, m=prior strength(${priorStrength}).`;
        },
        compute(items, dimensions) {
            const normalized = normalizeWeights(dimensions);
            // 计算全局均值（每个维度的加权全局均值）
            const dimAverages = {};
            for (const { dimension } of normalized) {
                const scores = items.map(item => item.scores[dimension.id] ?? 0);
                dimAverages[dimension.id] = scores.length > 0
                    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
                    : 0;
            }
            // 全局加权均值
            const globalWeightedAverage = normalized.reduce((sum, { dimension, normalizedWeight }) => sum + dimAverages[dimension.id] * normalizedWeight, 0);
            const scored = items.map(item => {
                const ratingCount = item.ratingCount ?? 1; // 默认评分人数为1
                const shrinkageFactor = ratingCount / (ratingCount + priorStrength);
                // 加权原始分数
                const rawWeightedScore = normalized.reduce((sum, { dimension, normalizedWeight }) => sum + (item.scores[dimension.id] ?? 0) * normalizedWeight, 0);
                // 收缩公式: score = shrinkage_factor * raw + (1 - shrinkage_factor) * global_mean
                const totalScore = shrinkageFactor * rawWeightedScore + (1 - shrinkageFactor) * globalWeightedAverage;
                const dimensionScores = normalized.map(({ dimension, normalizedWeight }) => {
                    const rawScore = item.scores[dimension.id] ?? 0;
                    const dimShrinkageFactor = shrinkageFactor;
                    const dimShrunkScore = dimShrinkageFactor * rawScore + (1 - dimShrinkageFactor) * dimAverages[dimension.id];
                    return {
                        dimensionId: dimension.id,
                        dimensionName: dimension.name,
                        score: dimShrunkScore,
                        weight: dimension.weight,
                        normalizedWeight,
                    };
                });
                return {
                    item,
                    totalScore,
                    rank: 0,
                    dimensionScores,
                };
            });
            // 按总分降序排名
            scored.sort((a, b) => b.totalScore - a.totalScore);
            scored.forEach((s, i) => {
                s.rank = i + 1;
            });
            return scored;
        },
        explain(item) {
            const ratingCount = item.item.ratingCount ?? 1;
            const shrinkageFactor = ratingCount / (ratingCount + priorStrength);
            const children = item.dimensionScores.map(ds => ({
                type: 'dimension',
                label: ds.dimensionName,
                value: `${ds.score.toFixed(2)} (收缩后)`,
                children: [
                    { type: 'shrunk-score', label: '收缩后分数', value: ds.score },
                    { type: 'normalized-weight', label: '归一化权重', value: ds.normalizedWeight },
                ],
            }));
            return {
                type: 'bayesian-shrinkage',
                label: '贝叶斯收缩得分',
                value: item.totalScore,
                children: [
                    { type: 'shrinkage-factor', label: '收缩因子', value: shrinkageFactor },
                    { type: 'prior-strength', label: '先验强度', value: priorStrength },
                    { type: 'rating-count', label: '评分人数', value: ratingCount },
                    ...children,
                ],
            };
        },
    };
}
/** 默认贝叶斯收缩引擎（先验强度m=10） */
export const bayesianShrinkageEngine = createBayesianShrinkageEngine({ priorStrength: 10 });
//# sourceMappingURL=bayesian-shrinkage.js.map