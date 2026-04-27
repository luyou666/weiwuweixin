/**
 * 围物为心 — 应用常量
 */
/* ============================================================
   算法 ID（与 scoring 包的 registry 保持一致）
   ============================================================ */
export const ALGORITHM_IDS = {
    WEIGHTED_MEAN: 'weighted-mean',
    GEOMETRIC_MEAN: 'geometric-mean',
    BORDA_COUNT: 'borda-count',
    TOPSIS: 'topsis',
    BAYESIAN_SHRINKAGE: 'bayesian-shrinkage',
};
/* ============================================================
   分制选项
   ============================================================ */
export const SCALE_OPTIONS = ['1-5', '1-10', '0-100'];
/* ============================================================
   可见性选项
   ============================================================ */
export const VISIBILITY_OPTIONS = ['PUBLIC', 'LINK_ONLY', 'PRIVATE'];
/* ============================================================
   徽章编码
   ============================================================ */
export const BADGE_CODES = ['first-list', 'echo-eight', 'chorus-100', 'pioneer'];
/* ============================================================
   长度限制
   ============================================================ */
/** 标题最大长度 */
export const MAX_TITLE_LENGTH = 30;
/** 副标题最大长度 */
export const MAX_SUBTITLE_LENGTH = 60;
/** 备注/笔记最大长度 */
export const MAX_NOTE_LENGTH = 140;
/** 维度数上限 */
export const MAX_DIMENSIONS = 6;
/** 维度数下限 */
export const MIN_DIMENSIONS = 1;
/* ============================================================
   置信度计算参数
   ============================================================ */
export const CONFIDENCE_PARAMS = {
    /** 样本量权重 */
    alpha: 0.6,
    /** 时间衰减权重 */
    beta: 1.2,
    /** 共识度权重 */
    gamma: 0.4,
    /** 半衰期（天） */
    halfLifeDays: 30,
};
/* ============================================================
   反作弊参数
   ============================================================ */
export const ANTI_FRAUD = {
    /** 最短投票持续时间（毫秒），低于此值判定为机器人 */
    minDurationMs: 3000,
    /** 惩罚权重系数 */
    weightPenalty: 0.2,
    /** 同一设备每日投票上限 */
    dailyVotesPerDevice: 1,
};
//# sourceMappingURL=constants.js.map