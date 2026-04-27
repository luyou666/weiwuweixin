/**
 * 围物为心 — 反刷分检测引擎
 *
 * 纯函数实现，无外部依赖。
 * 检测可疑评分行为并计算最终权重系数。
 */

/* ============================================================
   类型定义
   ============================================================ */

/** 反刷分输入参数 */
export interface AntiCheatInput {
  /** 此次评分耗时（毫秒） */
  durationMs: number;
  /** 评分者设备唯一标识 */
  deviceId: string;
  /** 榜单 ID */
  listId: string;
  /** 各维度评分值数组 */
  scores: number[];
  /** 评分量表最大值（如 5、10、100） */
  maxScale: number;
  /** 评分量表最小值（通常为 0 或 1） */
  minScale: number;
  /** 同设备+同榜单 24h 内已有的评分次数（含本次） */
  sameDeviceListVotes24h: number;
}

/** 反刷分检测结果 */
export interface AntiCheatResult {
  /** 是否标记为可疑 */
  isSuspicious: boolean;
  /** 是否需要人工审核 */
  needsReview: boolean;
  /** 降权/标记原因列表 */
  flags: AntiCheatFlag[];
  /** 临时权重系数（0.0-1.0），由 detectSuspiciousScore 计算 */
  preliminaryWeight: number;
}

/** 反刷分标记类型 */
export type AntiCheatFlag =
  | 'too-fast'         // 评分过快（< 3s）
  | 'duplicate-device' // 同设备同榜单 24h 内重复
  | 'low-variance'     // 评分方差异常低
  | 'extreme-high'     // 极端偏高评分
  | 'extreme-low';     // 极端偏低评分

/* ============================================================
   常量
   ============================================================ */

/** 评分过快阈值（毫秒） */
const MIN_DURATION_MS = 3000;

/** 过快评分的降权系数 */
const TOO_FAST_WEIGHT = 0.2;

/** 同设备重复评分的降权系数（仅保留 1 次有效） */
const DUPLICATE_WEIGHT = 0;

/** 低方差评分的降权系数 */
const LOW_VARIANCE_WEIGHT = 0.5;

/** 最终权重下限 */
const MIN_WEIGHT = 0.0;

/** 最终权重上限 */
const MAX_WEIGHT = 1.0;

/* ============================================================
   辅助函数
   ============================================================ */

/** 计算数组标准差 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** 检测所有维度是否给出相同分数 */
function allScoresIdentical(scores: number[]): boolean {
  if (scores.length <= 1) return false;
  return scores.every((s) => s === scores[0]);
}

/** 检测极端偏高评分：所有维度 >= (maxScale - 0.5) */
function isExtremeHigh(scores: number[], maxScale: number): boolean {
  if (scores.length === 0) return false;
  return scores.every((s) => s >= (maxScale - 0.5));
}

/** 检测极端偏低评分：所有维度 <= (minScale + 0.5) */
function isExtremeLow(scores: number[], minScale: number): boolean {
  if (scores.length === 0) return false;
  return scores.every((s) => s <= (minScale + 0.5));
}

/* ============================================================
   主函数
   ============================================================ */

/**
 * 检测可疑评分行为
 *
 * 规则：
 * 1. durationMs < 3000 → 标记降权 0.2
 * 2. 同设备+同榜单 24h 内仅记一次有效评分 → 降权至 0
 * 3. 评分方差异常低（所有维度相同分数 OR 标准差 < 0.5）→ 降权 0.5
 * 4. 极端评分（全部 ≥ maxScale-0.5 或 全部 ≤ minScale+0.5）→ 标记待审核
 */
export function detectSuspiciousScore(params: AntiCheatInput): AntiCheatResult {
  const flags: AntiCheatFlag[] = [];
  let needsReview = false;

  // 规则 1：评分过快
  if (params.durationMs < MIN_DURATION_MS) {
    flags.push('too-fast');
  }

  // 规则 2：同设备同榜单 24h 内重复评价
  if (params.sameDeviceListVotes24h > 1) {
    flags.push('duplicate-device');
  }

  // 规则 3：评分方差异常低
  const identical = allScoresIdentical(params.scores);
  const stdDev = standardDeviation(params.scores);
  if (identical || stdDev < 0.5) {
    flags.push('low-variance');
  }

  // 规则 4：极端评分
  if (isExtremeHigh(params.scores, params.maxScale)) {
    flags.push('extreme-high');
    needsReview = true;
  }
  if (isExtremeLow(params.scores, params.minScale)) {
    flags.push('extreme-low');
    needsReview = true;
  }

  // 计算初步权重：取所有触发的降权中最低值
  let preliminaryWeight = 1.0;

  for (const flag of flags) {
    switch (flag) {
      case 'too-fast':
        preliminaryWeight = Math.min(preliminaryWeight, TOO_FAST_WEIGHT);
        break;
      case 'duplicate-device':
        preliminaryWeight = Math.min(preliminaryWeight, DUPLICATE_WEIGHT);
        break;
      case 'low-variance':
        preliminaryWeight = Math.min(preliminaryWeight, LOW_VARIANCE_WEIGHT);
        break;
      case 'extreme-high':
      case 'extreme-low':
        // 极端评分标记待审核，不直接降权（审核后再决定）
        break;
    }
  }

  const isSuspicious = flags.length > 0;

  return {
    isSuspicious,
    needsReview,
    flags,
    preliminaryWeight,
  };
}

/**
 * 计算最终权重系数
 *
 * 结合检测结果与榜单总投票数，确定最终权重。规则：
 * - 无标记 → 1.0
 * - 有 duplicate-device → 0（同设备 24h 内重复直接归零）
 * - 有 too-fast → 0.2
 * - 有 low-variance → 0.5
 * - needsReview 时按投票人数浮动：投票越多，审核中评分权重越低
 * - 投票数 ≤ 10 时信任度衰减更快
 *
 * @param baseResult  detectSuspiciousScore 的返回值
 * @param voteCount   榜单总投票人数
 * @returns 最终权重系数 0.0 - 1.0
 */
export function computeWeight(baseResult: AntiCheatResult, voteCount: number): number {
  // 无任何标记 → 全权重
  if (baseResult.flags.length === 0) {
    return 1.0;
  }

  let weight = baseResult.preliminaryWeight;

  // 需要审核的评分，根据总体投票数进一步衰减
  if (baseResult.needsReview) {
    // 投票越多说明榜单越成熟，嫌疑评分的可信度越低
    const reviewPenalty = voteCount > 10 ? 0.7 : 0.85;
    weight = Math.min(weight, reviewPenalty);
  }

  // 限制在 [0, 1] 范围
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, weight));
}