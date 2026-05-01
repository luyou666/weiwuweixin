/**
 * 围物为心 — 置信度计算服务
 *
 * 调用 @weiwuweixin/scoring 的 computeConfidence
 * 从 DB 获取评分数据和评论 sentiment
 * 支持批量重算（cron 友好）
 */

import { PrismaClient } from '@prisma/client';
import { computeConfidence, kendallTau, timeDecay } from '@weiwuweixin/scoring';
import type { ConfidenceParams } from '@weiwuweixin/scoring';
import { cache, CacheKeys, CACHE_TTL } from './cache';

// ── 类型 ──────────────────────────────────────────────

export interface ConfidenceResult {
  listId: string;
  confidence: number;
  params: ConfidenceParams;
  updatedAt: string;
}

// ── 辅助函数 ──────────────────────────────────────────

/** 计算距今天数 */
function daysSince(date: Date): number {
  const now = Date.now();
  const then = date.getTime();
  return Math.max(0, (now - then) / (1000 * 60 * 60 * 24));
}

/**
 * 获取社区评分的排序（按平均分降序）
 * 返回 itemId 数组
 */
async function getCommunityOrder(prisma: PrismaClient, listId: string): Promise<string[]> {
  const scores = await prisma.communityScore.findMany({
    where: { listId },
    orderBy: { value: 'desc' },
    select: { itemId: true, value: true },
  });

  // 按平均分排序（如果有重复 itemId 取最高）
  const itemAvg = new Map<string, number[]>();
  for (const s of scores) {
    const arr = itemAvg.get(s.itemId) ?? [];
    arr.push(s.value);
    itemAvg.set(s.itemId, arr);
  }

  const sorted = [...itemAvg.entries()]
    .map(([id, vals]) => ({ id, avg: vals.reduce((a, b) => a + b, 0) / vals.length }))
    .sort((a, b) => b.avg - a.avg);

  return sorted.map(s => s.id);
}

/**
 * 获取作者评分的排序（按 rank 或平均分降序）
 * 返回 itemId 数组
 */
async function getAuthorOrder(prisma: PrismaClient, listId: string): Promise<string[]> {
  const items = await prisma.item.findMany({
    where: { listId },
    orderBy: { rank: 'asc' },
    select: { id: true, rank: true },
  });

  // Use rank if available
  const hasRank = items.length > 0 && items[0].rank != null;
  if (hasRank) {
    return items.map(i => i.id);
  }

  // fallback: 按 authorScore 平均分排序
  const scores = await prisma.authorScore.findMany({
    where: { listId },
    orderBy: { value: 'desc' },
    select: { itemId: true, value: true },
  });

  const itemAvg = new Map<string, number[]>();
  for (const s of scores) {
    const arr = itemAvg.get(s.itemId) ?? [];
    arr.push(s.value);
    itemAvg.set(s.itemId, arr);
  }

  return [...itemAvg.entries()]
    .map(([id, vals]) => ({ id, avg: vals.reduce((a, b) => a + b, 0) / vals.length }))
    .sort((a, b) => b.avg - a.avg)
    .map(s => s.id);
}

/**
 * 计算平均 sentiment
 */
async function getAvgSentiment(prisma: PrismaClient, listId: string): Promise<number> {
  const result = await prisma.comment.aggregate({
    where: { listId },
    _avg: { sentiment: true },
  });
  return result._avg.sentiment ?? 0;
}

// ── 单榜单置信度计算 ──────────────────────────────────

/**
 * 计算单个榜单的置信度
 *
 * @param prisma  Prisma 客户端
 * @param listId  榜单 ID
 * @param useCache 是否使用缓存
 * @returns 置信度结果
 */
export async function computeListConfidence(
  prisma: PrismaClient,
  listId: string,
  useCache = true,
): Promise<ConfidenceResult> {
  // 1. 检查缓存
  if (useCache) {
    const cached = await cache.getJSON<ConfidenceResult>(CacheKeys.confidence(listId));
    if (cached) return cached;
  }

  // 2. 获取基础数据
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: {
      id: true,
      updatedAt: true,
      upvoteCount: true,
      downvoteCount: true,
      communityScores: {
        select: { userId: true, createdAt: true },
      },
    },
  });

  if (!list) {
    throw new Error(`List ${listId} not found`);
  }

  // 4. 计算参数
  // N: 独立用户数
  const uniqueUserIds = new Set(list.communityScores.map(s => s.userId).filter(Boolean));
  const N = uniqueUserIds.size;

  // tau: Kendall Tau
  const [authorOrder, communityOrder] = await Promise.all([
    getAuthorOrder(prisma, listId),
    getCommunityOrder(prisma, listId),
  ]);
  const tau = kendallTau(authorOrder, communityOrder);

  // sentiment: 评论平均情感
  const sentiment = await getAvgSentiment(prisma, listId);

  // daysSinceLastVote
  const lastVoteDate = list.communityScores.length > 0
    ? list.communityScores.reduce((latest, s) => (s.createdAt > latest ? s.createdAt : latest), list.communityScores[0].createdAt)
    : list.updatedAt;
  const daysSinceLastVote = daysSince(lastVoteDate);

  // voteConsensus: 投票共识度 upvoteRatio = upvotes / (upvotes + downvotes)
  const totalVotes = list.upvoteCount + list.downvoteCount;
  const voteConsensus = totalVotes > 0 ? list.upvoteCount / totalVotes : 0;

  // 4.5 计算置信度
  const params: ConfidenceParams = {
    N,
    tau,
    sentiment,
    daysSinceLastVote,
    voteConsensus,
  };

  const confidence = computeConfidence(params);

  const result: ConfidenceResult = {
    listId,
    confidence,
    params,
    updatedAt: new Date().toISOString(),
  };

  // 5. 写入缓存
  await cache.setJSON(CacheKeys.confidence(listId), result, CACHE_TTL.CONFIDENCE);

  return result;
}

// ── 批量重算 ──────────────────────────────────────────

/**
 * 批量重算所有公开榜单的置信度
 * 适合 cron 任务调用
 *
 * @param prisma Prisma 客户端
 * @returns 重算结果列表
 */
export async function batchRecomputeConfidence(
  prisma: PrismaClient,
): Promise<ConfidenceResult[]> {
  const lists = await prisma.list.findMany({
    where: { visibility: 'PUBLIC' },
    select: { id: true },
  });

  const results: ConfidenceResult[] = [];

  for (const list of lists) {
    try {
      // 不使用缓存，强制重新计算
      const result = await computeListConfidence(prisma, list.id, false);
      results.push(result);
    } catch (err) {
      console.error(`[Confidence] Failed to compute for list ${list.id}:`, err);
    }
  }

  // 清除所有置信度缓存，让下次请求获取新值
  await cache.delPattern('confidence:*');

  console.log(`[Confidence] Batch recompute done: ${results.length} lists`);
  return results;
}

/**
 * 获取榜单置信度（优先缓存）
 */
export async function getListConfidence(
  prisma: PrismaClient,
  listId: string,
): Promise<number> {
  const result = await computeListConfidence(prisma, listId, true);
  return result.confidence;
}