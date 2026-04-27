/**
 * 围物为心 — 共享类型定义
 *
 * 类型与 Prisma Schema 及 scoring 包对齐
 */

/* ============================================================
   评分核心类型（与 @weiwuweixin/scoring 包保持一致）
   ============================================================ */

/** 待评分条目 */
export interface Item {
  id: string;
  name: string;
  scores: Record<string, number>;
  /** 用于贝叶斯收缩的评分人数 */
  ratingCount?: number;
}

/** 评分维度 */
export interface Dimension {
  id: string;
  name: string;
  weight: number;
  /** 维度分制（如 100 分制、5 分制） */
  scale?: number;
}

/** 维度得分详情 */
export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number;
  weight: number;
  normalizedWeight: number;
}

/** 评分结果 */
export interface ScoredItem {
  item: Item;
  totalScore: number;
  rank: number;
  dimensionScores: DimensionScore[];
  explanation?: ExplanationNode;
}

/** 解释节点 */
export interface ExplanationNode {
  type: string;
  label: string;
  value: number | string;
  children?: ExplanationNode[];
}

/** 评分算法引擎接口 */
export interface ScoringEngine {
  id: string;
  name: string;
  describe(locale: 'zh' | 'en'): string;
  compute(items: Item[], dimensions: Dimension[]): ScoredItem[];
  explain?(item: ScoredItem): ExplanationNode;
}

/* ============================================================
   清单（List）类型
   ============================================================ */

/** 清单可见性 */
export type ListVisibility = 'PUBLIC' | 'LINK_ONLY' | 'PRIVATE';

/** 清单元数据 */
export interface ListMeta {
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  voteCount: number;
}

/** 清单 */
export interface List {
  id: string;
  title: string;
  subtitle: string;
  /** 列表条目 */
  items: Item[];
  /** 评分维度 */
  dimensions: Dimension[];
  /** 算法ID */
  algorithmId: string;
  /** 分制 */
  scale: string;
  visibility: ListVisibility;
  meta: ListMeta;
  /** 创建者用户ID */
  authorId: string;
  /** 封面图 URL */
  coverUrl?: string;
  /** 附加备注 */
  note?: string;
}

/* ============================================================
   用户类型
   ============================================================ */

/** 用户 */
export interface User {
  id: string;
  /** 昵称 */
  nickname: string;
  /** 头像 URL */
  avatarUrl?: string;
  /** 设备唯一标识（匿名场景） */
  deviceId?: string;
  createdAt: string;
  updatedAt: string;
}

/** 用户档案（公开视图片段） */
export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  badges: Badge[];
  authorScore: AuthorScore;
  createdAt: string;
}

/* ============================================================
   评分 / 置信度类型
   ============================================================ */

/** 作者评分 */
export interface AuthorScore {
  value: number;
  confidence: number;
  updatedAt: string;
}

/** 社区评分 */
export interface CommunityScore {
  value: number;
  confidence: number;
  voteCount: number;
  updatedAt: string;
}

/** 置信度因子 */
export interface ConfidenceFactors {
  /** 样本量因子（0-1） */
  sampleSize: number;
  /** 时间衰减因子（0-1） */
  timeDecay: number;
  /** 共识度因子（0-1） */
  consensus: number;
  /** 综合置信度（0-1） */
  overall: number;
}

/* ============================================================
   徽章
   ============================================================ */

/** 徽章编码 */
export type BadgeCode = 'first-list' | 'echo-eight' | 'chorus-100' | 'pioneer';

/** 徽章 */
export interface Badge {
  code: BadgeCode;
  name: string;
  description: string;
  /** 图标资源路径 */
  iconUrl?: string;
  earnedAt: string;
}

/* ============================================================
   评论
   ============================================================ */

/** 评论 */
export interface Comment {
  id: string;
  listId: string;
  authorId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/* ============================================================
   同好 / Rapport
   ============================================================ */

/** 同好关系 */
export interface Rapport {
  userId: string;
  targetUserId: string;
  /** 评分品味相似度（0-1） */
  similarity: number;
  /** 共同评价的清单数 */
  overlapCount: number;
  createdAt: string;
}

/* ============================================================
   批量导入解析结果
   ============================================================ */

/** 解析后的条目 */
export interface ParsedItem {
  name: string;
  note?: string;
  url?: string;
}