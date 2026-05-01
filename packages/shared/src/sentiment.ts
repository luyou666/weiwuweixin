/**
 * 本地轻量情感分析（禁用外部 API）
 *
 * 使用内置中英文正负面词典，返回 -1 到 +1 的情感分数：
 *   正面 > 0，负面 < 0，中性 ≈ 0
 */

const POSITIVE_ZH: readonly string[] = [
  '好', '棒', '优', '喜欢', '赞', '推荐', '不错', '优秀', '满意', '爱',
];

const NEGATIVE_ZH: readonly string[] = [
  '差', '烂', '糟', '失望', '差劲', '讨厌', '垃圾', '难用', '不满', '恨',
];

const POSITIVE_EN: readonly string[] = [
  'good', 'great', 'excellent', 'amazing', 'love', 'wonderful', 'fantastic',
  'awesome', 'best', 'like', 'nice', 'perfect', 'recommend', 'enjoy', 'happy',
  'beautiful', 'brilliant', 'superb', 'pleasant', 'cool',
];

const NEGATIVE_EN: readonly string[] = [
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
export function analyzeSentiment(text: string): number {
  if (!text || typeof text !== 'string') return 0;

  // 转小写
  const normalized = text.toLowerCase();

  // ── 英文分词 (空格分隔) ──
  const hasEnglish = /[a-zA-Z]/.test(normalized);
  let tokens: string[] = [];

  if (hasEnglish) {
    // 英文用空格分词
    const noPunct = normalized.replace(/[^\w\s\u4e00-\u9fff]/g, ' ');
    tokens = noPunct.split(/\s+/).filter(Boolean);
  }

  // ── 中文：逐词扫描匹配 ──
  // 对每个词典词，检查是否在文本中出现
  const allPos = hasEnglish ? POSITIVE : [...POSITIVE_ZH];
  const allNeg = hasEnglish ? NEGATIVE : [...NEGATIVE_ZH];

  let score = 0;
  let matchCount = 0;

  // 英文token匹配
  for (const token of tokens) {
    if (allPos.includes(token.toLowerCase())) { score += 1; matchCount++; }
    else if (allNeg.includes(token.toLowerCase())) { score -= 1; matchCount++; }
  }

  // 中文：对每个中文词典词做子串匹配
  // 使用中文特有词典（POSITIVE_ZH / NEGATIVE_ZH）
  for (const word of POSITIVE_ZH) {
    if (normalized.includes(word)) { score += 1; matchCount++; }
  }
  for (const word of NEGATIVE_ZH) {
    if (normalized.includes(word)) { score -= 1; matchCount++; }
  }

  // 英文词典补充（如果没被中文覆盖）
  if (hasEnglish) {
    for (const word of POSITIVE_EN) {
      if (normalized.includes(word)) { score += 1; matchCount++; }
    }
    for (const word of NEGATIVE_EN) {
      if (normalized.includes(word)) { score -= 1; matchCount++; }
    }
  }

  if (matchCount === 0) return 0;

  // tanh 压缩到 (-1, +1)
  return Math.tanh(score / matchCount * 3);
}