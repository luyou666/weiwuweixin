/**
 * 本地轻量情感分析（禁用外部 API）
 *
 * 使用内置中英文正负面词典，返回 -1 到 +1 的情感分数：
 *   正面 > 0，负面 < 0，中性 ≈ 0
 */
const POSITIVE_ZH = [
    '好', '棒', '优', '喜欢', '赞', '推荐', '不错', '优秀', '满意', '爱',
];
const NEGATIVE_ZH = [
    '差', '烂', '糟', '失望', '差劲', '讨厌', '垃圾', '难用', '不满', '恨',
];
const POSITIVE_EN = [
    'good', 'great', 'excellent', 'amazing', 'love', 'wonderful', 'fantastic',
    'awesome', 'best', 'like', 'nice', 'perfect', 'recommend', 'enjoy', 'happy',
    'beautiful', 'brilliant', 'superb', 'pleasant', 'cool',
];
const NEGATIVE_EN = [
    'bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'horrible', 'disgusting',
    'ugly', 'disappointing', 'annoying', 'boring', 'dull', 'suck', 'waste',
    'mediocre', 'lame', 'fail', 'broken', 'crash',
];
const POSITIVE = [...POSITIVE_ZH, ...POSITIVE_EN];
const NEGATIVE = [...NEGATIVE_ZH, ...NEGATIVE_EN];
/**
 * 分析文本情感，返回 [-1, +1] 区间的分数
 *
 * 算法：逐词匹配内置正负面词典，正面词 +1，负面词 -1，
 * 最终归一化到 [-1, +1]——使用 tanh 压缩避免溢出。
 */
export function analyzeSentiment(text) {
    if (!text || typeof text !== 'string')
        return 0;
    // 转小写，将中英文标点视为分隔符
    const normalized = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, ' ');
    const tokens = normalized.split(/\s+/).filter(Boolean);
    if (tokens.length === 0)
        return 0;
    let score = 0;
    for (const token of tokens) {
        if (POSITIVE.includes(token)) {
            score += 1;
        }
        else if (NEGATIVE.includes(token)) {
            score -= 1;
        }
    }
    // tanh 压缩到 (-1, +1)
    return Math.tanh(score / tokens.length * 3);
}
//# sourceMappingURL=sentiment.js.map