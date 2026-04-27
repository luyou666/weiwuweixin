/**
 * 评分计算库 - 核心类型定义
 */
/** 辅助：归一化权重，使总权重为1 */
export function normalizeWeights(dimensions) {
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
//# sourceMappingURL=types.js.map