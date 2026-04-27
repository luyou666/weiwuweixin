/**
 * 围物为心 — API 请求抽象层（当前为 mock）
 */

import { MOCK_FEED_LISTS, ALGORITHM_METAS, MOCK_EXPLORE_LISTS, MOCK_TOPIC_AGGREGATIONS, MOCK_HOT_SEARCHES, MOCK_RECENT_SEARCHES, MOCK_PROFILES } from './mock-data';
import type { FeedList, AlgorithmMeta, TopicAggregation, ProfileData } from './mock-data';

/** 模拟网络延迟 */
function delay(ms: number = 600): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 获取首页 Feed 列表 */
export async function fetchFeedLists(): Promise<FeedList[]> {
  await delay(800);
  return MOCK_FEED_LISTS;
}

/** 获取单个榜单详情（mock） */
export async function fetchListById(id: string): Promise<FeedList | undefined> {
  await delay(400);
  return MOCK_FEED_LISTS.find(list => list.id === id);
}

/** 获取所有算法元数据 */
export async function fetchAlgorithmMetas(): Promise<AlgorithmMeta[]> {
  await delay(300);
  return ALGORITHM_METAS;
}

/** 创建新榜单（mock） */
export async function createList(_payload: unknown): Promise<{ id: string }> {
  await delay(1000);
  return { id: `list-${Date.now()}` };
}

/* ============================================================
   发现页 API
   ============================================================ */

/** 分类 ID → 标签关键词映射 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  movie: ['电影', '影视', '剧集'],
  music: ['音乐', '华语', '专辑'],
  food: ['美食', '咖啡', '器具', '暖食'],
  travel: ['旅行', '京都', '散步', '红叶'],
  tech: ['技术', '前端', '框架', '数码'],
  book: ['书籍', '推理', '文学', '宋词', '选本'],
  sports: ['运动', '健身', '居家'],
};

/** 排序模式 */
export type SortMode = 'diversity' | 'consensus' | 'newest';

/** 获取发现页榜单 */
export async function fetchExploreLists(params?: {
  categories?: string[];
  sort?: SortMode;
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ lists: FeedList[]; hasMore: boolean }> {
  await delay(600);

  const { categories = [], sort = 'diversity', query = '', page = 1, pageSize = 8 } = params ?? {};

  let filtered = [...MOCK_EXPLORE_LISTS];

  // 分类筛选
  if (categories.length > 0) {
    const keywords = categories.flatMap((c) => CATEGORY_KEYWORDS[c] ?? []);
    if (keywords.length > 0) {
      filtered = filtered.filter((list) =>
        keywords.some((kw) => list.tags.some((tag) => tag.includes(kw)) || list.title.includes(kw))
      );
    }
  }

  // 搜索筛选
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (list) =>
        list.title.toLowerCase().includes(q) ||
        list.subtitle.toLowerCase().includes(q) ||
        list.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        list.author.nickname.toLowerCase().includes(q)
    );
  }

  // 排序
  switch (sort) {
    case 'diversity':
      // 多样性优先 — 较低置信度 + 较多条目优先（保护主观性）
      filtered.sort((a, b) => {
        const diversityA = a.itemCount / (a.confidence + 0.1);
        const diversityB = b.itemCount / (b.confidence + 0.1);
        return diversityB - diversityA;
      });
      break;
    case 'consensus':
      // 高共识度优先
      filtered.sort((a, b) => b.confidence - a.confidence);
      break;
    case 'newest':
      // 最新创建
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = filtered.slice(start, end);
  const hasMore = end < filtered.length;

  return { lists: paged, hasMore };
}

/** 获取话题聚合 */
export async function fetchTopicAggregations(_params?: {
  categories?: string[];
  query?: string;
}): Promise<TopicAggregation[]> {
  await delay(400);
  return MOCK_TOPIC_AGGREGATIONS;
}

/** 获取热门搜索 */
export async function fetchHotSearches(): Promise<string[]> {
  await delay(200);
  return MOCK_HOT_SEARCHES;
}

/** 获取最近搜索 */
export async function fetchRecentSearches(): Promise<string[]> {
  await delay(200);
  return MOCK_RECENT_SEARCHES;
}

/* ============================================================
   个人主页 API
   ============================================================ */

/** 个人主页排序模式 */
export type ProfileSortMode = 'consensus' | 'hot' | 'time';

/** 获取用户档案 */
export async function fetchProfile(handle: string): Promise<ProfileData | undefined> {
  await delay(500);
  return MOCK_PROFILES[handle];
}

/** 获取用户的榜单列表 */
export async function fetchUserLists(userId: string, sort: ProfileSortMode = 'consensus'): Promise<FeedList[]> {
  await delay(600);
  const lists = MOCK_FEED_LISTS.filter(list => list.author.id === userId);

  switch (sort) {
    case 'consensus':
      lists.sort((a, b) => b.confidence - a.confidence);
      break;
    case 'hot':
      lists.sort((a, b) => b.voteCount - a.voteCount);
      break;
    case 'time':
      lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return lists;
}