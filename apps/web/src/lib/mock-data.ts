/**
 * 围物为心 — Mock 数据
 * 首页 Feed 用的 mock 榜单数据
 */

import { BadgeType } from '@weiwuweixin/shared';
import type { ListVisibility, AlgorithmId } from '@weiwuweixin/shared';

const MOCK_AUTHORS = [
  { id: 'u1', nickname: '墨客', avatarUrl: undefined },
  { id: 'u2', nickname: '竹影', avatarUrl: undefined },
  { id: 'u3', nickname: '清风', avatarUrl: undefined },
  { id: 'u4', nickname: '云归', avatarUrl: undefined },
  { id: 'u5', nickname: '望舒', avatarUrl: undefined },
];

export interface FeedList {
  id: string;
  title: string;
  subtitle: string;
  author: { id: string; nickname: string };
  confidence: number;
  itemCount: number;
  tags: string[];
  algorithmId: AlgorithmId;
  visibility: ListVisibility;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  voteCount: number;
}

export const MOCK_FEED_LISTS: FeedList[] = [
  {
    id: 'list-1',
    title: '2024 年度华语专辑',
    subtitle: '以心度耳，聆听这一年的回响',
    author: { id: MOCK_AUTHORS[0].id, nickname: MOCK_AUTHORS[0].nickname },
    confidence: 0.87,
    itemCount: 12,
    tags: ['音乐', '华语', '年度'],
    algorithmId: 'weighted-mean',
    visibility: 'PUBLIC',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-04-10T12:00:00Z',
    viewCount: 342,
    voteCount: 28,
  },
  {
    id: 'list-2',
    title: '咖啡器具入门指南',
    subtitle: '从手冲到意式，找到属于你的那杯',
    author: { id: MOCK_AUTHORS[1].id, nickname: MOCK_AUTHORS[1].nickname },
    confidence: 0.72,
    itemCount: 8,
    tags: ['咖啡', '器具', '入门'],
    algorithmId: 'topsis',
    visibility: 'PUBLIC',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-03-28T09:00:00Z',
    viewCount: 156,
    voteCount: 14,
  },
  {
    id: 'list-3',
    title: '京都红叶名所',
    subtitle: '光影之间，秋色如墨',
    author: { id: MOCK_AUTHORS[2].id, nickname: MOCK_AUTHORS[2].nickname },
    confidence: 0.93,
    itemCount: 6,
    tags: ['旅行', '京都', '红叶'],
    algorithmId: 'borda-count',
    visibility: 'PUBLIC',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-02-28T16:00:00Z',
    viewCount: 578,
    voteCount: 45,
  },
  {
    id: 'list-4',
    title: '前端框架对决',
    subtitle: '工欲善其事，必先利其器',
    author: { id: MOCK_AUTHORS[3].id, nickname: MOCK_AUTHORS[3].nickname },
    confidence: 0.45,
    itemCount: 5,
    tags: ['技术', '前端', '框架'],
    algorithmId: 'geometric-mean',
    visibility: 'PUBLIC',
    createdAt: '2024-04-01T08:00:00Z',
    updatedAt: '2024-04-20T10:00:00Z',
    viewCount: 89,
    voteCount: 7,
  },
  {
    id: 'list-5',
    title: '独立游戏推荐',
    subtitle: '在小众中发现大世界',
    author: { id: MOCK_AUTHORS[4].id, nickname: MOCK_AUTHORS[4].nickname },
    confidence: 0.68,
    itemCount: 10,
    tags: ['游戏', '独立', '推荐'],
    algorithmId: 'weighted-mean',
    visibility: 'PUBLIC',
    createdAt: '2024-03-05T12:00:00Z',
    updatedAt: '2024-04-15T18:00:00Z',
    viewCount: 234,
    voteCount: 19,
  },
  {
    id: 'list-6',
    title: '诗词选本：宋词三百首外',
    subtitle: '不拘一格，偏取冷门佳作',
    author: { id: MOCK_AUTHORS[0].id, nickname: MOCK_AUTHORS[0].nickname },
    confidence: 0.91,
    itemCount: 15,
    tags: ['文学', '宋词', '选本'],
    algorithmId: 'borda-count',
    visibility: 'PUBLIC',
    createdAt: '2024-02-14T10:00:00Z',
    updatedAt: '2024-03-20T14:00:00Z',
    viewCount: 412,
    voteCount: 36,
  },
  {
    id: 'list-7',
    title: '便携耳机排行',
    subtitle: '出门随身，隔音为上',
    author: { id: MOCK_AUTHORS[1].id, nickname: MOCK_AUTHORS[1].nickname },
    confidence: 0.56,
    itemCount: 7,
    tags: ['数码', '耳机', '便携'],
    algorithmId: 'bayesian-shrinkage',
    visibility: 'LINK_ONLY',
    createdAt: '2024-04-10T16:00:00Z',
    updatedAt: '2024-04-22T09:00:00Z',
    viewCount: 67,
    voteCount: 5,
  },
  {
    id: 'list-8',
    title: '春日散步路线',
    subtitle: '城市角落，花开无声',
    author: { id: MOCK_AUTHORS[2].id, nickname: MOCK_AUTHORS[2].nickname },
    confidence: 0.79,
    itemCount: 4,
    tags: ['生活', '散步', '春日'],
    algorithmId: 'weighted-mean',
    visibility: 'PUBLIC',
    createdAt: '2024-04-05T08:00:00Z',
    updatedAt: '2024-04-18T11:00:00Z',
    viewCount: 198,
    voteCount: 22,
  },
];

/** 算法元信息（用于新建榜单页） */
export interface AlgorithmMeta {
  id: AlgorithmId;
  name: string;
  formula: string; // KaTeX string
  description: string;
  recommendation: string;
  pros: string[];
  cons: string[];
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
    formula: '\\text{Score} = \\left(\\prod_{i} s_i^{w_i}\\right)^{1/\\sum w_i}',
    description: '各维度加权几何平均，任何一项极低都会拉低总分。',
    recommendation: '适合需要惩罚短板、强调均衡的场景。',
    pros: ['惩罚短板', '均衡导向', '不受极端高值影响'],
    cons: ['不支持零分', '对低值敏感', '直觉理解稍难'],
  },
  {
    id: 'borda-count',
    name: 'Borda 排位分',
    formula: '\\text{Score} = \\sum_{i} \\text{rank}_i \\times w_i',
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

/** 分类标签列表 */
export const CATEGORY_TAGS = [
  '音乐', '电影', '书籍', '游戏', '技术',
  '旅行', '美食', '数码', '生活', '文学',
  '设计', '运动', '教育', '艺术', '其他',
];

/* ============================================================
   发现页 Mock 数据
   ============================================================ */

/** 发现页分类（含图标） */
export const EXPLORE_CATEGORIES = [
  { id: 'movie', label: '影视', icon: '🎬' },
  { id: 'music', label: '音乐', icon: '🎵' },
  { id: 'food', label: '美食', icon: '🍜' },
  { id: 'travel', label: '旅行', icon: '🗺️' },
  { id: 'tech', label: '科技', icon: '💻' },
  { id: 'book', label: '读书', icon: '📖' },
  { id: 'sports', label: '运动', icon: '⚽' },
];

/** 发现页扩充榜单（同名/同类话题数据） */
export const MOCK_EXPLORE_LISTS: FeedList[] = [
  ...MOCK_FEED_LISTS,
  {
    id: 'list-9',
    title: '2024 年度华语专辑',
    subtitle: '另一视角：华语音乐的多元面貌',
    author: { id: MOCK_AUTHORS[2].id, nickname: MOCK_AUTHORS[2].nickname },
    confidence: 0.74,
    itemCount: 10,
    tags: ['音乐', '华语', '年度'],
    algorithmId: 'borda-count',
    visibility: 'PUBLIC',
    createdAt: '2024-04-12T08:00:00Z',
    updatedAt: '2024-04-20T10:00:00Z',
    viewCount: 189,
    voteCount: 15,
  },
  {
    id: 'list-10',
    title: '京都红叶名所',
    subtitle: '从岚山到东山，红叶名所完全收录',
    author: { id: MOCK_AUTHORS[3].id, nickname: MOCK_AUTHORS[3].nickname },
    confidence: 0.85,
    itemCount: 9,
    tags: ['旅行', '京都', '红叶'],
    algorithmId: 'weighted-mean',
    visibility: 'PUBLIC',
    createdAt: '2024-03-08T10:00:00Z',
    updatedAt: '2024-04-05T12:00:00Z',
    viewCount: 320,
    voteCount: 28,
  },
  {
    id: 'list-11',
    title: '独立游戏推荐',
    subtitle: '小众精品，不容错过',
    author: { id: MOCK_AUTHORS[0].id, nickname: MOCK_AUTHORS[0].nickname },
    confidence: 0.62,
    itemCount: 8,
    tags: ['游戏', '独立', '精品'],
    algorithmId: 'geometric-mean',
    visibility: 'PUBLIC',
    createdAt: '2024-04-18T06:00:00Z',
    updatedAt: '2024-04-22T14:00:00Z',
    viewCount: 145,
    voteCount: 12,
  },
  {
    id: 'list-12',
    title: '上海散步指南',
    subtitle: '从外滩到武康路，城市漫行记',
    author: { id: MOCK_AUTHORS[1].id, nickname: MOCK_AUTHORS[1].nickname },
    confidence: 0.81,
    itemCount: 6,
    tags: ['旅行', '上海', '散步'],
    algorithmId: 'borda-count',
    visibility: 'PUBLIC',
    createdAt: '2024-03-20T14:00:00Z',
    updatedAt: '2024-04-15T08:00:00Z',
    viewCount: 267,
    voteCount: 21,
  },
  {
    id: 'list-13',
    title: '前端技术栈 2024',
    subtitle: '框架、工具链、最佳实践一览',
    author: { id: MOCK_AUTHORS[3].id, nickname: MOCK_AUTHORS[3].nickname },
    confidence: 0.53,
    itemCount: 12,
    tags: ['技术', '前端', '年度'],
    algorithmId: 'topsis',
    visibility: 'PUBLIC',
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-04-21T16:00:00Z',
    viewCount: 112,
    voteCount: 9,
  },
  {
    id: 'list-14',
    title: '秋冬暖食推荐',
    subtitle: '一碗热汤，暖手暖心',
    author: { id: MOCK_AUTHORS[4].id, nickname: MOCK_AUTHORS[4].nickname },
    confidence: 0.76,
    itemCount: 7,
    tags: ['美食', '秋冬', '暖心'],
    algorithmId: 'weighted-mean',
    visibility: 'PUBLIC',
    createdAt: '2024-02-28T08:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    viewCount: 421,
    voteCount: 33,
  },
  {
    id: 'list-15',
    title: '经典推理小说必读',
    subtitle: '从阿加莎到东野圭吾，推理迷的盛宴',
    author: { id: MOCK_AUTHORS[0].id, nickname: MOCK_AUTHORS[0].nickname },
    confidence: 0.88,
    itemCount: 15,
    tags: ['书籍', '推理', '经典'],
    algorithmId: 'borda-count',
    visibility: 'PUBLIC',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-03-10T14:00:00Z',
    viewCount: 534,
    voteCount: 41,
  },
  {
    id: 'list-16',
    title: '居家健身器材清单',
    subtitle: '小空间大作为，在家也能练出好身材',
    author: { id: MOCK_AUTHORS[2].id, nickname: MOCK_AUTHORS[2].nickname },
    confidence: 0.65,
    itemCount: 6,
    tags: ['运动', '健身', '居家'],
    algorithmId: 'bayesian-shrinkage',
    visibility: 'PUBLIC',
    createdAt: '2024-04-08T16:00:00Z',
    updatedAt: '2024-04-22T10:00:00Z',
    viewCount: 98,
    voteCount: 8,
  },
];

/** 话题聚合数据 */
export interface TopicAggregation {
  topicId: string;
  topicName: string;
  categoryIcon: string;
  mergedCount: number;
  items: {
    id: string;
    title: string;
    confidence: number;
    authorName: string;
    itemCount: number;
    tags: string[];
  }[];
}

export const MOCK_TOPIC_AGGREGATIONS: TopicAggregation[] = [
  {
    topicId: 'topic-music-cn',
    topicName: '华语音乐年度榜单',
    categoryIcon: '🎵',
    mergedCount: 2,
    items: [
      {
        id: 'list-1',
        title: '2024 年度华语专辑',
        confidence: 0.87,
        authorName: '墨客',
        itemCount: 12,
        tags: ['音乐', '华语', '年度'],
      },
      {
        id: 'list-9',
        title: '2024 年度华语专辑',
        confidence: 0.74,
        authorName: '清风',
        itemCount: 10,
        tags: ['音乐', '华语', '年度'],
      },
    ],
  },
  {
    topicId: 'topic-kyoto-autumn',
    topicName: '京都红叶旅行',
    categoryIcon: '🍁',
    mergedCount: 2,
    items: [
      {
        id: 'list-3',
        title: '京都红叶名所',
        confidence: 0.93,
        authorName: '清风',
        itemCount: 6,
        tags: ['旅行', '京都', '红叶'],
      },
      {
        id: 'list-10',
        title: '京都红叶名所',
        confidence: 0.85,
        authorName: '云归',
        itemCount: 9,
        tags: ['旅行', '京都', '红叶'],
      },
    ],
  },
  {
    topicId: 'topic-indie-game',
    topicName: '独立游戏推荐',
    categoryIcon: '🎮',
    mergedCount: 2,
    items: [
      {
        id: 'list-5',
        title: '独立游戏推荐',
        confidence: 0.68,
        authorName: '望舒',
        itemCount: 10,
        tags: ['游戏', '独立', '推荐'],
      },
      {
        id: 'list-11',
        title: '独立游戏推荐',
        confidence: 0.62,
        authorName: '墨客',
        itemCount: 8,
        tags: ['游戏', '独立', '精品'],
      },
    ],
  },
];

/** 发现页热门搜索和最近搜索 */
export const MOCK_HOT_SEARCHES = [
  '华语专辑',
  '京都红叶',
  '独立游戏',
  '前端框架',
  '推理小说',
  '咖啡器具',
];

export const MOCK_RECENT_SEARCHES = [
  '华语专辑',
  '散步路线',
  '咖啡',
];
/* ============================================================
   个人主页 Mock 数据
   ============================================================ */

/** 用户档案数据 */
export interface ProfileData {
  id: string;
  handle: string;
  nickname: string;
  avatarUrl?: string;
  bio: string;
  stats: {
    listCount: number;
    rapportCount: number;
    bookmarkedCount: number;
  };
  badges: import('@weiwuweixin/shared').BadgeInfo[];
}

/** Mock 用户档案 */
export const MOCK_PROFILES: Record<string, ProfileData> = {
  moke: {
    id: 'u1',
    handle: 'moke',
    nickname: '墨客',
    bio: '以心度物，以物观心。品茗弄墨，不亦快哉。',
    stats: {
      listCount: 3,
      rapportCount: 12,
      bookmarkedCount: 48,
    },
    badges: [
      { type: BadgeType.FirstList, name: 'First Step', nameZh: '初心', description: 'Awarded for creating your first list', descriptionZh: '创建第一个榜单获得', earned: true, earnedAt: '2024-01-15T08:00:00Z' },
      { type: BadgeType.EchoEight, name: 'Eightfold Echo', nameZh: '八方共鸣', description: 'Awarded when a single list reaches ≥80% consensus', descriptionZh: '单榜置信度≥80获得', earned: true, earnedAt: '2024-03-20T12:00:00Z' },
      { type: BadgeType.Chorus100, name: 'Chorus of Voices', nameZh: '众声喧哗', description: 'Awarded when a single list gets ≥100 participants', descriptionZh: '单榜参评≥100获得', earned: false, earnedAt: null },
      { type: BadgeType.Pioneer, name: 'Category Pioneer', nameZh: '品类开拓者', description: 'Awarded for creating the first list in a category', descriptionZh: '某分类下首个榜单获得', earned: true, earnedAt: '2024-02-14T10:00:00Z' },
    ],
  },
  zhuying: {
    id: 'u2',
    handle: 'zhuying',
    nickname: '竹影',
    bio: '竹林深处，光影之间。',
    stats: {
      listCount: 2,
      rapportCount: 7,
      bookmarkedCount: 23,
    },
    badges: [
      { type: BadgeType.FirstList, name: 'First Step', nameZh: '初心', description: 'Awarded for creating your first list', descriptionZh: '创建第一个榜单获得', earned: true, earnedAt: '2024-02-20T10:00:00Z' },
      { type: BadgeType.EchoEight, name: 'Eightfold Echo', nameZh: '八方共鸣', description: 'Awarded when a single list reaches ≥80% consensus', descriptionZh: '单榜置信度≥80获得', earned: false, earnedAt: null },
      { type: BadgeType.Chorus100, name: 'Chorus of Voices', nameZh: '众声喧哗', description: 'Awarded when a single list gets ≥100 participants', descriptionZh: '单榜参评≥100获得', earned: false, earnedAt: null },
      { type: BadgeType.Pioneer, name: 'Category Pioneer', nameZh: '品类开拓者', description: 'Awarded for creating the first list in a category', descriptionZh: '某分类下首个榜单获得', earned: false, earnedAt: null },
    ],
  },
  testuser: {
    id: 'u4',
    handle: 'testuser',
    nickname: '测试用户',
    bio: '万物皆可评，唯主观不可欺。用心感受世界，以榜单记录真实。',
    stats: {
      listCount: 3,
      rapportCount: 12,
      bookmarkedCount: 35,
    },
    badges: [
      { type: BadgeType.FirstList, name: 'First Step', nameZh: '初心', description: 'Awarded for creating your first list', descriptionZh: '创建第一个榜单获得', earned: true, earnedAt: '2024-06-15T08:00:00Z' },
      { type: BadgeType.EchoEight, name: 'Eightfold Echo', nameZh: '八方共鸣', description: 'Awarded when a single list reaches ≥80% consensus', descriptionZh: '单榜置信度≥80%获得', earned: false, earnedAt: null },
      { type: BadgeType.Chorus100, name: 'Chorus of Voices', nameZh: '众声喧哗', description: 'Awarded when a single list gets ≥100 participants', descriptionZh: '单榜参评≥100人获得', earned: false, earnedAt: null },
      { type: BadgeType.Pioneer, name: 'Category Pioneer', nameZh: '品类开拓者', description: 'Awarded for creating the first list in a category', descriptionZh: '某分类下首个榜单获得', earned: false, earnedAt: null },
    ],
  },
  luge: {
    id: 'u3',
    handle: 'luge',
    nickname: '鹿哥',
    bio: '围物为心，以心度物。万物皆可评，唯主观不可欺。',
    stats: {
      listCount: 5,
      rapportCount: 24,
      bookmarkedCount: 67,
    },
    badges: [
      { type: BadgeType.FirstList, name: 'First Step', nameZh: '初心', description: 'Awarded for creating your first list', descriptionZh: '创建第一个榜单获得', earned: true, earnedAt: '2024-06-01T10:00:00Z' },
      { type: BadgeType.EchoEight, name: 'Eightfold Echo', nameZh: '八方共鸣', description: 'Awarded when a single list reaches ≥80% consensus', descriptionZh: '单榜置信度≥80%获得', earned: true, earnedAt: '2024-07-15T12:00:00Z' },
      { type: BadgeType.Chorus100, name: 'Chorus of Voices', nameZh: '众声喧哗', description: 'Awarded when a single list gets ≥100 participants', descriptionZh: '单榜参评≥100人获得', earned: true, earnedAt: '2024-09-20T08:00:00Z' },
      { type: BadgeType.Pioneer, name: 'Category Pioneer', nameZh: '品类开拓者', description: 'Awarded for creating the first list in a category', descriptionZh: '某分类下首个榜单获得', earned: true, earnedAt: '2024-08-10T10:00:00Z' },
    ],
  },
};

/* ============================================================
   评论 Mock 数据
   ============================================================ */

/** Mock 评论数据 */
export const MOCK_COMMENTS = [
  {
    id: 'comment-1',
    user: '墨客',
    content: '这张榜单选得很有品味，特别是那几项冷门但经典的作品。',
    sentiment: 0.75,
    createdAt: '2024-04-10T08:00:00Z',
    parentId: null,
  },
  {
    id: 'comment-2',
    user: '竹影',
    content: '还行吧，不过我觉得排名有些偏颇。',
    sentiment: 0.1,
    createdAt: '2024-04-10T09:30:00Z',
    parentId: null,
  },
  {
    id: 'comment-3',
    user: '清风',
    content: '严重不同意这个排名，最后几项明显是凑数的。',
    sentiment: -0.65,
    createdAt: '2024-04-10T10:15:00Z',
    parentId: null,
  },
  {
    id: 'comment-4',
    user: '云归',
    content: '我同意墨客的看法，选品确实不错。',
    sentiment: 0.55,
    createdAt: '2024-04-10T08:45:00Z',
    parentId: 'comment-1',
  },
  {
    id: 'comment-5',
    user: '望舒',
    content: '实在太差了，完全不推荐。',
    sentiment: -0.95,
    createdAt: '2024-04-11T11:00:00Z',
    parentId: null,
  },
  {
    id: 'comment-6',
    user: '墨客',
    content: '谢谢认可！希望能持续更新。',
    sentiment: 0.6,
    createdAt: '2024-04-11T09:00:00Z',
    parentId: 'comment-4',
  },
  {
    id: 'comment-7',
    user: '清风',
    content: '中立来看，这个榜单有亮点也有不足。',
    sentiment: 0.05,
    createdAt: '2024-04-11T14:00:00Z',
    parentId: null,
  },
  {
    id: 'comment-8',
    user: '竹影',
    content: '排名确实有待商榷，但整体选题不错。',
    sentiment: 0.25,
    createdAt: '2024-04-12T08:00:00Z',
    parentId: 'comment-2',
  },
  {
    id: 'comment-9',
    user: '云归',
    content: '完全垃圾榜单，不值得一看！',
    sentiment: -0.85,
    createdAt: '2024-04-12T10:30:00Z',
    parentId: 'comment-3',
  },
  {
    id: 'comment-10',
    user: '望舒',
    content: '非常棒！每一条都是精选，赞！',
    sentiment: 0.9,
    createdAt: '2024-04-12T15:00:00Z',
    parentId: null,
  },
];
