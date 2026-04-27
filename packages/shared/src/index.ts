/**
 * 围物为心 — 共享工具库 统一导出
 */

// 类型
export type {
  Item,
  Dimension,
  DimensionScore,
  ScoredItem,
  ExplanationNode,
  ScoringEngine,
  List,
  ListVisibility,
  ListMeta,
  ParsedItem,
  User,
  UserProfile,
  AuthorScore,
  CommunityScore,
  Badge,
  BadgeCode,
  Comment,
  Rapport,
  ConfidenceFactors,
} from './types';

// 常量
export {
  ALGORITHM_IDS,
  SCALE_OPTIONS,
  VISIBILITY_OPTIONS,
  BADGE_CODES,
  MAX_TITLE_LENGTH,
  MAX_SUBTITLE_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_DIMENSIONS,
  MIN_DIMENSIONS,
  CONFIDENCE_PARAMS,
  ANTI_FRAUD,
} from './constants';

export type { AlgorithmId, ScaleOption, VisibilityOption } from './constants';

// 批量导入解析器
export { parseBulkText } from './textParser';

// 情感分析
export { analyzeSentiment } from './sentiment';

// 工具函数
export {
  normalizeWeights,
  sigmoid,
  timeDecay,
  formatConfidence,
  cuid,
} from './utils';
// 徽章系统
export { BadgeType, computeBadges } from './badges';
export type { BadgeInfo, UserStats } from './badges';

// 评论工具
export {
  sortCommentsByTime,
  filterBySentiment,
  buildCommentTree,
  countBySentiment,
  sentimentToLabel,
} from './comment-utils';
export type {
  SentimentType,
  CommentNode,
  FlatComment,
} from './comment-utils';