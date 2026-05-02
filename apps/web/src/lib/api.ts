/**
 * 围物为心 — API 请求层（真实后端 v2）
 *
 * 直接调用 localhost:3001 的真实 API，不再依赖 mock-data。
 * 类型定义与后端响应结构对齐。
 */

import { get, post } from './api-client';

/* ============================================================
   类型定义
   ============================================================ */

/** 排序模式 */
export type SortMode = 'diversity' | 'consensus' | 'newest';

/** 个人主页排序模式 */
export type ProfileSortMode = 'consensus' | 'hot' | 'time';

/** 榜单列表项（GET /api/lists 返回） */
export interface FeedList {
  id: string;
  title: string;
  subtitle: string;
  algorithmId: string;
  voteCount: number;
  upvoteCount?: number;
  downvoteCount?: number;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
  author: {
    id: string;
    nickname: string;
    handle: string;
    avatarUrl: string | null;
  };
  _count?: {
    items: number;
    comments: number;
    communityScores: number;
  };
  dimensions?: {
    id: string;
    name: string;
    weight: number;
  }[];
  coverUrl?: string | null;
  note?: string | null;
  scale?: string;
  visibility?: string;
  /** 置信度 (0-1)，优先使用后端返回 */
  confidence?: number;
  /** 前端计算字段 — 等价于 _count.items */
  itemCount: number;
  /** 前端计算字段 — 从 dimensions 提取的标签名 */
  tags: string[];
}

/** 话题聚合项 */
export interface TopicAggregationItem {
  id: string;
  title: string;
  confidence: number;
  authorName: string;
  itemCount: number;
  tags?: string[];
  upvoteCount?: number;
  downvoteCount?: number;
  myVote?: 'up' | 'down' | null;
  scoreCount?: number;
}

/** 话题聚合 */
export interface TopicAggregation {
  topicId?: string;
  topicName: string;
  categoryIcon?: string;
  mergedCount: number;
  items: TopicAggregationItem[];
}

/** 算法元数据 */
export interface AlgorithmMeta {
  id: string;
  name: string;
  description: string;
  formula: string;
  recommendation: string;
  pros: string[];
  cons: string[];
}

/** 榜单详情 (GET /api/lists/:id) */
export interface ListDetail {
  id: string;
  title: string;
  subtitle: string | null;
  algorithmId: string;
  scale: string | null;
  visibility: string;
  coverUrl: string | null;
  note: string | null;
  viewCount: number;
  voteCount: number;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    nickname: string;
    handle: string;
    avatarUrl: string | null;
  };
  dimensions: {
    id: string;
    name: string;
    weight: number;
  }[];
  items: {
    id: string;
    name: string;
    note: string | null;
    url: string | null;
    rank: number;
    listId: string;
    authorScores: { dimensionId: string; value: number }[];
    communityScores: { id: string; confidence: number; voterFingerprint: string }[];
  }[];
  communityScores: { id: string; confidence: number; voterFingerprint: string }[];
  comments: any[];
  confidence: number | null;
  engineConfidence: number | null;
  confidenceParams: any;
  voteConsensus: number | null;
  stats: any;
}

/** 评论项 (GET /api/lists/:id/comments) */
export interface CommentItem {
  id: string;
  content: string;
  sentiment: number;
  listId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    nickname: string;
    handle: string;
    avatarUrl: string | null;
  };
}

/** 用户档案 */
export interface ProfileData {
  id: string;
  nickname: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  stats: {
    listCount: number;
    totalVotes: number;
    avgConfidence: number;
    rapportCount?: number;
    bookmarkedCount?: number;
  };
  badges: any[];
}

/* ============================================================
   常量
   ============================================================ */

/** 分类定义（与后端 /api/explore 对齐） */
export const EXPLORE_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'movie', label: '影视', icon: '🎬' },
  { id: 'music', label: '音乐', icon: '🎵' },
  { id: 'food', label: '美食', icon: '🍜' },
  { id: 'travel', label: '旅行', icon: '🗺️' },
  { id: 'tech', label: '科技', icon: '💻' },
  { id: 'book', label: '读书', icon: '📖' },
  { id: 'sports', label: '运动', icon: '⚽' },
];

/** 分类标签列表（新建榜单页使用） */
export const CATEGORY_TAGS = [
  '音乐', '电影', '书籍', '游戏', '技术',
  '旅行', '美食', '数码', '生活', '文学',
  '设计', '运动', '教育', '艺术', '其他',
];

/* ============================================================
   工具函数
   ============================================================ */

/** 置信度计算（与后端 calcConfidence 保持完全一致） */
function calcConfidence(item: {
  upvoteCount?: number | null;
  downvoteCount?: number | null;
  scoreCount?: number;
}): number {
  const scoreCount = item.scoreCount ?? 0;
  const upvotes = item.upvoteCount ?? 0;
  const downvotes = item.downvoteCount ?? 0;
  const totalVotes = upvotes + downvotes;
  const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;
  const base = scoreCount > 0 ? 0.2 : 0.05;
  const participationBoost = Math.min(0.4, (scoreCount / 30) * 0.2);
  const consensusBoost = totalVotes > 0 ? Math.min(0.3, voteRatio * 0.3) : 0;
  return Math.min(0.99, Math.max(0.05, base + participationBoost + consensusBoost));
}

/** 将后端原始数据补全为 FeedList */
function enrichList(raw: any): FeedList {
  const confidence =
    typeof raw.confidence === 'number' && raw.confidence > 0
      ? raw.confidence
      : calcConfidence({
          upvoteCount: raw.upvoteCount ?? 0,
          downvoteCount: raw.downvoteCount ?? 0,
          scoreCount: raw._count?.communityScores ?? 0,
        });

  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle ?? '',
    algorithmId: raw.algorithmId ?? 'weighted-mean',
    voteCount: raw.voteCount ?? 0,
    upvoteCount: raw.upvoteCount ?? 0,
    downvoteCount: raw.downvoteCount ?? 0,
    viewCount: raw.viewCount ?? 0,
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt,
    author: raw.author ?? { id: '', nickname: '', handle: '', avatarUrl: null },
    _count: raw._count ?? { items: 0, comments: 0, communityScores: 0 },
    dimensions: raw.dimensions ?? [],
    coverUrl: raw.coverUrl ?? null,
    note: raw.note ?? null,
    scale: raw.scale,
    visibility: raw.visibility,
    confidence,
    itemCount: raw._count?.items ?? raw.itemCount ?? 0,
    tags: raw.dimensions?.map((d: any) => d.name) ?? [],
  };
}

/* ============================================================
   API 方法
   ============================================================ */

/** 获取首页 Feed 列表 */
export async function fetchFeedLists(): Promise<FeedList[]> {
  const res = await get('/api/lists?sort=popular&pageSize=10');
  const data = await res.json();
  return (data.data ?? []).map(enrichList);
}

/** 获取发现页榜单（带分类筛选和排序） */
export async function fetchExploreLists(params?: {
  categories?: string[];
  sort?: SortMode;
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ lists: FeedList[]; hasMore: boolean }> {
  const { sort = 'diversity', query = '', page = 1, pageSize = 8, categories = [] } = params ?? {};

  const sortMap: Record<string, string> = {
    diversity: 'popular',
    consensus: 'popular',
    newest: 'latest',
  };

  const apiSort = sortMap[sort] ?? 'latest';
  const qsParts: string[] = [];
  if (query) qsParts.push(`search=${encodeURIComponent(query)}`);
  if (categories.length > 0) qsParts.push(`categories=${categories.join(',')}`);

  const res = await get(
    `/api/lists?sort=${apiSort}&page=${page}&pageSize=${pageSize}${qsParts.length > 0 ? '&' + qsParts.join('&') : ''}`
  );
  const data = await res.json();

  return {
    lists: (data.data ?? []).map(enrichList),
    hasMore: page * pageSize < (data.total ?? 0),
  };
}

/** 获取话题聚合 */
export async function fetchTopicAggregations(_params?: {
  categories?: string[];
  query?: string;
}): Promise<TopicAggregation[]> {
  const res = await get('/api/explore');
  const data = await res.json();
  const topicAggs = data.topicAggregations ?? [];
  return topicAggs.map((agg: any, i: number) => ({
    topicId: agg.topicId ?? `topic-${i}`,
    topicName: agg.topicName ?? '',
    categoryIcon: agg.categoryIcon ?? '📋',
    mergedCount: agg.mergedCount ?? 1,
    items: (agg.items ?? []).map((item: any) => ({
      id: item.id,
      title: item.title,
      confidence: item.confidence ?? 0.1,
      authorName: item.authorName ?? '',
      itemCount: item.itemCount ?? 0,
      tags: item.tags ?? [],
      upvoteCount: item.upvoteCount ?? 0,
      downvoteCount: item.downvoteCount ?? 0,
      myVote: null,
      scoreCount: item.scoreCount ?? 0,
    })),
  }));
}

/** 获取热门搜索 */
export async function fetchHotSearches(): Promise<string[]> {
  const res = await get('/api/explore');
  const data = await res.json();
  return data.hotSearches ?? [];
}

/** 获取最近搜索 */
export async function fetchRecentSearches(): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('wwx-recent-searches');
  return stored ? JSON.parse(stored) : [];
}

/* ============================================================
   静态常量（算法元数据 + 类型）
   ============================================================ */

/** 算法元信息 */
export interface AlgorithmMeta {
  id: string;
  name: string;
  formula: string;
  description: string;
  recommendation: string;
  pros: string[];
  cons: string[];
}

/* ============================================================
   榜单详情 + 评论
   ============================================================ */

/** 获取榜单详情 */
export async function fetchListById(id: string): Promise<ListDetail> {
  const res = await get(`/api/lists/${id}`);
  return res.json();
}

/** 获取评论列表 */
export async function fetchComments(listId: string, params?: {
  page?: number;
  pageSize?: number;
  sentiment?: string;
}): Promise<{ data: CommentItem[]; total: number; page: number; pageSize: number; sentimentCounts: Record<string, number> }> {
  const { page = 1, pageSize = 50, sentiment = 'all' } = params ?? {};
  const qs = `page=${page}&pageSize=${pageSize}&sentiment=${sentiment}`;
  const res = await get(`/api/lists/${listId}/comments?${qs}`);
  return res.json();
}

/** 发布评论 */
export async function postComment(listId: string, content: string): Promise<CommentItem> {
  const res = await post(`/api/lists/${listId}/comments`, { content });
  return res.json();
}

/* ============================================================
   排行榜
   ============================================================ */

/** 排行榜响应 */
export interface LeaderboardResponse {
  leaderboard: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    upvoteCount: number;
    downvoteCount: number;
    viewCount: number;
    voteCount: number;
    hotness: number;
    createdAt: string;
    algorithmId: string;
    coverUrl: string | null;
    author: {
      id: string;
      nickname: string;
      handle: string;
      avatarUrl: string | null;
    };
    _count: {
      items: number;
      communityScores: number;
      comments: number;
    };
  }>;
  generatedAt: string;
}

/** 获取热度排行榜 */
export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const res = await get('/api/leaderboard');
  return res.json();
}

/* ============================================================
   创建榜单
   ============================================================ */

/** 创建榜单的请求体 */
export interface CreateListInput {
  title: string;
  subtitle?: string;
  algorithmId?: string;
  scale?: string;
  visibility?: 'PUBLIC' | 'LINK_ONLY' | 'PRIVATE';
  note?: string;
  /** 维度列表 */
  dimensions: { name: string; weight?: number; scale?: number }[];
  /** 物品列表 */
  items: { name: string; note?: string; url?: string; rank?: number }[];
  /** 作者评分矩阵: [itemIdx][dimIdx] */
  authorScores?: number[][];
}

/** 创建新榜单 */
export async function createList(input: CreateListInput): Promise<{ id: string }> {
  const res = await post('/api/lists', input);
  return res.json();
}

export const ALGORITHM_METAS: AlgorithmMeta[] = [
  {
    id: 'weighted-mean',
    name: '加权平均',
    formula: '\\text{Score} = \\frac{\\sum_{i} w_i \\cdot D_i}{\\sum_{i} w_i}',
    description: '各维度按权重加权求平均，最直观的聚合方式。',
    recommendation: '适合各维度独立贡献、互不牵制的场景。',
    pros: ['简单直观', '权重灵活', '计算高效'],
    cons: ['无法惩罚短板', '极端值影响大'],
  },
  {
    id: 'geometric-mean',
    name: '几何平均',
    formula: '\\left(\\prod_{i} s_i^{w_i}\\right)^{1/\\sum w_i}',
    description: '各维度加权几何平均，任何一项极低都会拉低总分。',
    recommendation: '适合需要惩罚短板、强调均衡的场景。',
    pros: ['惩罚短板', '均衡导向', '不受极端高值影响'],
    cons: ['不支持零分', '对低值敏感', '直觉理解稍难'],
  },
  {
    id: 'borda-count',
    name: 'Borda 排位分',
    formula: '\\sum_{i} \\text{rank}_i \\times w_i',
    description: '按每维度排名给分，第1名得最高分，依序递减。',
    recommendation: '适合不需要绝对分数、只关心相对排名的场景。',
    pros: ['无需绝对分数', '抗极端值', '排名直觉'],
    cons: ['信息损失', '并列处理复杂', '依赖候选集'],
  },
  {
    id: 'topsis',
    name: 'TOPSIS 理想解',
    formula: 'C_i = \\frac{d_i^-}{d_i^+ + d_i^-}',
    description: '计算正理想解和负理想解的距离，取相对接近度评分。',
    recommendation: '适合多维度综合比较、需要兼顾全局优化的场景。',
    pros: ['全局视角', '多准则决策', '数学完备'],
    cons: ['归一化依赖', '计算稍复杂', '对维度选择敏感'],
  },
  {
    id: 'bayesian-shrinkage',
    name: '贝叶斯收缩',
    formula: '\\hat{S} = \\frac{n}{n+m}\\bar{S} + \\frac{m}{n+m}\\mu',
    description: '向全局均值收缩，有效抵抗小样本波动，评分越多人收缩越少。',
    recommendation: '适合评分人数不一、需要公平比较的场景。',
    pros: ['小样本稳健', '抗刷票', '公平比较'],
    cons: ['需要先验参数', '收敛于均值', '计算稍复杂'],
  },
];
