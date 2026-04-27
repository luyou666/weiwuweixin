import { normalizeWeights } from '../types';
export const weightedMeanEngine = {
    id: 'weighted-mean',
    name: '加权平均',
    describe(locale) {
        if (locale === 'zh') {
            return '加权平均算法：总分 = ∑(Dᵢ × wᵢ) / ∑wᵢ，适合各维度独立贡献的场景。';
        }
        return 'Weighted Mean: total = ∑(Dᵢ × wᵢ) / ∑wᵢ, suitable for independent dimension contributions.';
    },
    compute(items, dimensions) {
        const normalized = normalizeWeights(dimensions);
        const scored = items.map(item => {
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
            const totalScore = dimensionScores.reduce((sum, ds) => sum + ds.score * ds.normalizedWeight, 0);
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
        const children = item.dimensionScores.map(ds => ({
            type: 'dimension',
            label: ds.dimensionName,
            value: `${ds.score} × ${ds.normalizedWeight.toFixed(2)}`,
            children: [
                { type: 'raw-score', label: '原始分数', value: ds.score },
                { type: 'normalized-weight', label: '归一化权重', value: ds.normalizedWeight },
                { type: 'contribution', label: '维度贡献', value: ds.score * ds.normalizedWeight },
            ],
        }));
        return {
            type: 'weighted-mean',
            label: '加权平均得分',
            value: item.totalScore,
            children,
        };
    },
};
//# sourceMappingURL=weighted-mean.js.map