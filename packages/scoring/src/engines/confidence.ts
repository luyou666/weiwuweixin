/**
 * 置信度算法引擎
 *
 * 公式：Confidence = 100 × sigmoid(α·log(1+N) + β·τ + γ·sentiment + δ·voteConsensus) × time_decay(t)
 *
 * - N: 参与评分的独立用户数
 * - τ: 他人打分排序与作者排序的 Kendall Tau 相关系数
 * - sentiment: 评论情感倾向 (-1..+1)
 * - voteConsensus: 榜单投票共识度 (upvoteRatio)，upvotes/totalVotes，范围 0-1
 * - time_decay(t) = 0.5^(t/30)，半衰期30天
 * - 默认参数: α=0.6, β=1.2, γ=0.4, δ=0.8
 */

import type { ExplanationNode } from '../types';

// ─── 默认参数 ───────────────────────────────────────────

const DEFAULT_ALPHA = 0.6;
const DEFAULT_BETA = 1.2;
const DEFAULT_GAMMA = 0.4;
const DEFAULT_DELTA = 0.8; // 投票共识因子权重
const DEFAULT_HALFLIFE = 30;

// ─── 辅助函数 ───────────────────────────────────────────

/** sigmoid 函数 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ─── 公共接口 ───────────────────────────────────────────

/** computeConfidence 参数 */
export interface ConfidenceParams {
  /** 参与评分的独立用户数 */
  N: number;
  /** 他人打分排序与作者排序的 Kendall Tau 相关系数 */
  tau: number;
  /** 评论情感倾向 (-1..+1) */
  sentiment: number;
  /** 距最后一次投票的天数 */
  daysSinceLastVote: number;
  /** 榜单投票共识度（upvoteRatio），upvotes/totalVotes，范围 0-1。默认 0（无投票时） */
  voteConsensus?: number;
  /** 用户规模因子，默认 0.6 */
  alpha?: number;
  /** Kendall Tau 因子，默认 1.2 */
  beta?: number;
  /** 情感因子，默认 0.4 */
  gamma?: number;
  /** 投票共识因子权重，默认 0.8 */
  delta?: number;
  /** 时间衰减半衰期（天），默认 30 */
  halfLife?: number;
}

// ─── Kendall Tau ────────────────────────────────────────

/**
 * 计算两个排序列表的 Kendall Tau 相关系数
 *
 * @param authorOrder    - 作者排序，元素ID从高到低
 * @param communityOrder - 他人打分排序，元素ID从高到低
 * @returns τ ∈ [-1, +1]
 *
 * 算法：对 communityOrder 建立排名索引，遍历 authorOrder 中所有 (i < j) 对，
 *       比较它们在 communityOrder 中的相对顺序，统计 concordant / discordant 对数。
 */
export function kendallTau(authorOrder: string[], communityOrder: string[]): number {
  const n = authorOrder.length;
  if (n <= 1) return 1;

  // 排除非共同元素，只取交集
  const authorSet = new Set(authorOrder);
  const communitySet = new Set(communityOrder);
  const common = authorOrder.filter(id => communitySet.has(id));

  const m = common.length;
  if (m <= 1) return 1; // 只有一个或零个共同元素时，τ 定义为 1

  // 建立 communityOrder 中共同元素的排名
  const rank: Map<string, number> = new Map();
  let r = 0;
  for (const id of communityOrder) {
    if (authorSet.has(id)) {
      rank.set(id, r++);
    }
  }

  // 遍历所有 (i < j) 对，比较排名
  let concordant = 0;
  let discordant = 0;

  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      const ri = rank.get(common[i])!;
      const rj = rank.get(common[j])!;
      if (ri < rj) {
        concordant++;
      } else if (ri > rj) {
        discordant++;
      }
      // 相等（并列）不计入 concordant 也不计入 discordant
    }
  }

  const total = concordant + discordant;
  if (total === 0) return 1; // 全部并列

  return (concordant - discordant) / total;
}

// ─── 时间衰减 ───────────────────────────────────────────

/**
 * 时间衰减函数
 *
 * @param daysSinceLastVote - 距最后一次投票的天数
 * @param halfLife         - 半衰期（天），默认30
 * @returns 衰减系数 ∈ (0, 1]
 */
export function timeDecay(daysSinceLastVote: number, halfLife: number = DEFAULT_HALFLIFE): number {
  if (daysSinceLastVote <= 0) return 1;
  if (halfLife <= 0) return 1;
  return Math.pow(0.5, daysSinceLastVote / halfLife);
}

// ─── 主函数 ─────────────────────────────────────────────

/**
 * 计算置信度分数
 *
 * @returns 0-100 的置信度值
 */
export function computeConfidence(params: ConfidenceParams): number {
  const {
    N,
    tau,
    sentiment,
    daysSinceLastVote,
    voteConsensus = 0,
    alpha = DEFAULT_ALPHA,
    beta = DEFAULT_BETA,
    gamma = DEFAULT_GAMMA,
    delta = DEFAULT_DELTA,
    halfLife,
  } = params;

  const logFactor = alpha * Math.log(1 + N);
  const tauFactor = beta * tau;
  const sentimentFactor = gamma * sentiment;
  const voteConsensusFactor = delta * voteConsensus;

  const sigmoidInput = logFactor + tauFactor + sentimentFactor + voteConsensusFactor;
  const sigmoidValue = sigmoid(sigmoidInput);
  const decay = timeDecay(daysSinceLastVote, halfLife);

  return 100 * sigmoidValue * decay;
}

// ─── 解释性输出 ─────────────────────────────────────────

/**
 * 生成置信度的解释性因子分解
 */
export function explainConfidence(params: ConfidenceParams): ExplanationNode {
  const {
    N,
    tau,
    sentiment,
    daysSinceLastVote,
    voteConsensus = 0,
    alpha = DEFAULT_ALPHA,
    beta = DEFAULT_BETA,
    gamma = DEFAULT_GAMMA,
    delta = DEFAULT_DELTA,
    halfLife = DEFAULT_HALFLIFE,
  } = params;

  const logFactor = alpha * Math.log(1 + N);
  const tauFactor = beta * tau;
  const sentimentFactor = gamma * sentiment;
  const voteConsensusFactor = delta * voteConsensus;

  const sigmoidInput = logFactor + tauFactor + sentimentFactor + voteConsensusFactor;
  const sigmoidValue = sigmoid(sigmoidInput);
  const decay = timeDecay(daysSinceLastVote, halfLife);
  const confidence = 100 * sigmoidValue * decay;

  return {
    type: 'confidence',
    label: '置信度',
    value: confidence,
    children: [
      {
        type: 'users-factor',
        label: '用户规模因子',
        value: logFactor,
        children: [
          { type: 'user-count', label: '参与用户数(N)', value: N },
          { type: 'alpha', label: 'α', value: alpha },
          { type: 'log-term', label: 'log(1+N)', value: Math.log(1 + N) },
        ],
      },
      {
        type: 'consensus-factor',
        label: '共识因子',
        value: tauFactor,
        children: [
          { type: 'kendall-tau', label: 'Kendall Tau(τ)', value: tau },
          { type: 'beta', label: 'β', value: beta },
        ],
      },
      {
        type: 'sentiment-factor',
        label: '情感因子',
        value: sentimentFactor,
        children: [
          { type: 'sentiment', label: '情感倾向', value: sentiment },
          { type: 'gamma', label: 'γ', value: gamma },
        ],
      },
      {
        type: 'vote-consensus-factor',
        label: '投票共识因子',
        value: voteConsensusFactor,
        children: [
          { type: 'vote-consensus', label: '投票共识度', value: voteConsensus },
          { type: 'delta', label: 'δ', value: delta },
        ],
      },
      {
        type: 'sigmoid-value',
        label: 'sigmoid值',
        value: sigmoidValue,
      },
      {
        type: 'time-decay',
        label: '时间衰减',
        value: decay,
        children: [
          { type: 'days-since-last-vote', label: '距末次投票天数', value: daysSinceLastVote },
          { type: 'half-life', label: '半衰期', value: halfLife },
        ],
      },
    ],
  };
}