import { normalizeWeights } from '../types';
function euclideanDist(a, b) {
    return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}
export const topsisEngine = {
    id: 'topsis',
    name: 'TOPSIS理想解',
    describe(locale) {
        if (locale === 'zh') {
            return 'TOPSIS理想解算法：计算正理想解(PIS)和负理想解(NIS)，通过相对接近度Cᵢ = d⁻ᵢ/(d⁺ᵢ+d⁻ᵢ)排序。';
        }
        return 'TOPSIS: Computes Positive Ideal Solution (PIS) and Negative Ideal Solution (NIS), ranks by relative closeness Cᵢ = d⁻ᵢ/(d⁺ᵢ+d⁻ᵢ).';
    },
    compute(items, dimensions) {
        const normalized = normalizeWeights(dimensions);
        if (items.length === 0)
            return [];
        // 1. 构建决策矩阵并归一化（向量归一化）
        const dimIds = normalized.map(nd => nd.dimension.id);
        const matrix = items.map(item => dimIds.map(dimId => item.scores[dimId] ?? 0));
        // 向量归一化：每列平方和的平方根
        const colNorms = dimIds.map((_, colIdx) => {
            const sumSq = matrix.reduce((sum, row) => sum + row[colIdx] ** 2, 0);
            return Math.sqrt(sumSq);
        });
        const normalizedMatrix = matrix.map(row => row.map((val, colIdx) => colNorms[colIdx] === 0 ? 0 : val / colNorms[colIdx]));
        // 2. 加权归一化矩阵
        const weightedMatrix = normalizedMatrix.map(row => row.map((val, colIdx) => val * normalized[colIdx].normalizedWeight));
        // 3. 正理想解(PIS)和负理想解(NIS)
        const numDims = dimIds.length;
        const PIS = [];
        const NIS = [];
        for (let colIdx = 0; colIdx < numDims; colIdx++) {
            const colValues = weightedMatrix.map(row => row[colIdx]);
            PIS.push(Math.max(...colValues));
            NIS.push(Math.min(...colValues));
        }
        // 4. 计算每个条目到PIS和NIS的距离
        const scored = items.map((item, idx) => {
            const dimensionScores = normalized.map(({ dimension, normalizedWeight }, colIdx) => {
                const rawScore = item.scores[dimension.id] ?? 0;
                return {
                    dimensionId: dimension.id,
                    dimensionName: dimension.name,
                    score: rawScore,
                    weight: dimension.weight,
                    normalizedWeight,
                };
            });
            const dPlus = euclideanDist(weightedMatrix[idx], PIS);
            const dMinus = euclideanDist(weightedMatrix[idx], NIS);
            // 相对接近度
            const ci = dPlus + dMinus === 0 ? 0 : dMinus / (dPlus + dMinus);
            return {
                item,
                totalScore: ci,
                rank: 0,
                dimensionScores,
            };
        });
        // 5. 按相对接近度降序排名
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
            value: `${ds.score} (×${ds.normalizedWeight.toFixed(2)})`,
            children: [
                { type: 'raw-score', label: '原始分数', value: ds.score },
                { type: 'normalized-weight', label: '归一化权重', value: ds.normalizedWeight },
            ],
        }));
        return {
            type: 'topsis',
            label: 'TOPSIS相对接近度',
            value: item.totalScore,
            children: [
                ...children,
                { type: 'closeness', label: '相对接近度Cᵢ', value: item.totalScore },
            ],
        };
    },
};
//# sourceMappingURL=topsis.js.map