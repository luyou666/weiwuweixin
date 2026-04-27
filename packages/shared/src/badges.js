/**
 * 围物为心 — 徽章系统
 * 类型定义 + 计算逻辑（纯函数）
 */
/* ============================================================
   徽章类型枚举
   ============================================================ */
export var BadgeType;
(function (BadgeType) {
    /** 初心：创建第一个榜单获得 */
    BadgeType["FirstList"] = "first-list";
    /** 八方共鸣：单榜置信度≥80获得 */
    BadgeType["EchoEight"] = "echo-eight";
    /** 众声喧哗：单榜参评≥100获得 */
    BadgeType["Chorus100"] = "chorus-100";
    /** 品类开拓者：某分类下首个榜单获得 */
    BadgeType["Pioneer"] = "pioneer";
})(BadgeType || (BadgeType = {}));
/* ============================================================
   徽章元数据（静态）
   ============================================================ */
const BADGE_META = {
    [BadgeType.FirstList]: {
        type: BadgeType.FirstList,
        name: 'First Step',
        nameZh: '初心',
        description: 'Awarded for creating your first list',
        descriptionZh: '创建第一个榜单获得',
    },
    [BadgeType.EchoEight]: {
        type: BadgeType.EchoEight,
        name: 'Eightfold Echo',
        nameZh: '八方共鸣',
        description: 'Awarded when a single list reaches ≥80% consensus',
        descriptionZh: '单榜置信度≥80获得',
    },
    [BadgeType.Chorus100]: {
        type: BadgeType.Chorus100,
        name: 'Chorus of Voices',
        nameZh: '众声喧哗',
        description: 'Awarded when a single list gets ≥100 participants',
        descriptionZh: '单榜参评≥100获得',
    },
    [BadgeType.Pioneer]: {
        type: BadgeType.Pioneer,
        name: 'Category Pioneer',
        nameZh: '品类开拓者',
        description: 'Awarded for creating the first list in a category',
        descriptionZh: '某分类下首个榜单获得',
    },
};
/* ============================================================
   computeBadges — 纯函数
   ============================================================ */
/**
 * 根据用户统计数据计算徽章列表
 * @param userStats 用户统计数据
 * @returns 徽章信息数组（按枚举顺序）
 */
export function computeBadges(userStats) {
    const now = new Date().toISOString();
    const badges = [
        {
            ...BADGE_META[BadgeType.FirstList],
            earned: userStats.listCount >= 1,
            earnedAt: userStats.listCount >= 1
                ? (userStats.firstListCreatedAt ?? now)
                : null,
        },
        {
            ...BADGE_META[BadgeType.EchoEight],
            earned: userStats.maxConfidence >= 0.80,
            earnedAt: userStats.maxConfidence >= 0.80
                ? (userStats.echoEightEarnedAt ?? now)
                : null,
        },
        {
            ...BADGE_META[BadgeType.Chorus100],
            earned: userStats.maxVoteCount >= 100,
            earnedAt: userStats.maxVoteCount >= 100
                ? (userStats.chorus100EarnedAt ?? now)
                : null,
        },
        {
            ...BADGE_META[BadgeType.Pioneer],
            earned: userStats.isPioneerInCategory,
            earnedAt: userStats.isPioneerInCategory
                ? (userStats.pioneerEarnedAt ?? now)
                : null,
        },
    ];
    return badges;
}
//# sourceMappingURL=badges.js.map