/**
 * 围物为心 — 通用工具函数
 */
/** cuid 内部计数器 */
let _cuidCounter = 0;
/**
 * 归一化权重数组，使总和为 1
 *
 * 负值会被钳位为 0；全零时均等分配。
 */
export function normalizeWeights(weights) {
    const clamped = weights.map((w) => Math.max(w, 0));
    const total = clamped.reduce((s, v) => s + v, 0);
    if (total === 0) {
        const equal = 1 / weights.length;
        return weights.map(() => equal);
    }
    return clamped.map((w) => w / total);
}
/**
 * Sigmoid 函数，将任意实数映射到 (0, 1)
 */
export function sigmoid(x) {
    if (x >= 0) {
        return 1 / (1 + Math.exp(-x));
    }
    const ex = Math.exp(x);
    return ex / (1 + ex);
}
/**
 * 时间衰减：基于半衰期的指数衰减
 *
 * @param daysSinceLastActivity 距上次活动的天数
 * @param halfLifeDays          半衰期天数
 * @returns 0-1 的衰减因子
 */
export function timeDecay(daysSinceLastActivity, halfLifeDays) {
    if (daysSinceLastActivity < 0)
        return 1;
    const lambda = Math.LN2 / halfLifeDays;
    return Math.exp(-lambda * daysSinceLastActivity);
}
/**
 * 格式化置信度为百分比字符串
 *
 * @param value 0-1 的数值
 * @returns 如 "85%" 或 "0%"
 */
export function formatConfidence(value) {
    const clamped = Math.max(0, Math.min(1, value));
    return `${Math.round(clamped * 100)}%`;
}
/**
 * 简易 ID 生成器（cuid 风格）
 *
 * 格式：c + 时间戳(36进制) + 随机数(36进制) + 递增计数(36进制)
 * 非严格 cuid，适合轻量场景；生产环境可用 uuid 替换。
 */
export function cuid() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    const counter = (_cuidCounter++).toString(36);
    return `c${timestamp}${random}${counter}`;
}
//# sourceMappingURL=utils.js.map