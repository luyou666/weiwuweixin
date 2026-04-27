import { normalizeWeights } from '../types';
export const bordaCountEngine = {
    id: 'borda-count',
    name: 'Borda排位分',
    describe(locale) {
        if (locale === 'zh') {
            return 'Borda排位分算法：按每维度排名给分，第1名得n-1分，第2名得n-2分，以此类推，总分=∑(维度排名分×归一化权重)。';
        }
        return 'Borda Count: ranked scoring per dimension, 1st gets n-1 points, 2nd gets n-2, etc. Total = ∑(rank_score × normalized_weight).';
    },
    compute(items, dimensions) {
        const normalized = normalizeWeights(dimensions);
        const n = items.length;
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
            return {
                item,
                totalScore: 0,
                rank: 0,
                dimensionScores,
            };
        });
        // 对每个维度进行排名，计算Borda分
        for (const { dimension, normalizedWeight } of normalized) {
            // 按该维度分数降序排序获取排名
            const sorted = [...scored].sort((a, b) => (b.item.scores[dimension.id] ?? 0) - (a.item.scores[dimension.id] ?? 0));
            sorted.forEach((entry, rank) => {
                // Borda分：第1名得n-1分，第2名得n-2分...
                const bordaPoints = n - 1 - rank;
                entry.totalScore += bordaPoints * normalizedWeight;
            });
        }
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
            value: `${ds.score} (权重: ${ds.normalizedWeight.toFixed(2)})`,
            children: [
                { type: 'raw-score', label: '原始分数', value: ds.score },
                { type: 'normalized-weight', label: '归一化权重', value: ds.normalizedWeight },
            ],
        }));
        return {
            type: 'borda-count',
            label: 'Borda排位分',
            value: item.totalScore,
            children,
        };
    },
};
//# sourceMappingURL=borda-count.js.map