/**
 * 围物为心 — 评论工具函数
 *
 * 提供：时间线排序、情感筛选、嵌套构建、情感统计
 */
/* ============================================================
   情感标签映射
   ============================================================ */
const SENTIMENT_THRESHOLDS = {
    positive: 0.3, // sentiment > 0.3 → 正向
    negative: -0.3, // sentiment < -0.3 → 负向
    // -0.3 ≤ sentiment ≤ 0.3 → 中性
};
/** 将情感分数转换为标签 */
export function sentimentToLabel(value) {
    if (value > SENTIMENT_THRESHOLDS.positive)
        return 'positive';
    if (value < SENTIMENT_THRESHOLDS.negative)
        return 'negative';
    return 'neutral';
}
/* ============================================================
   工具函数
   ============================================================ */
/**
 * 时间线排序（升序：最早在前）
 */
export function sortCommentsByTime(comments) {
    return [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
/**
 * 按情感倾向筛选
 */
export function filterBySentiment(comments, sentiment) {
    if (sentiment === 'all')
        return comments;
    return comments.filter((c) => sentimentToLabel(c.sentiment) === sentiment);
}
/**
 * 构建评论嵌套树（最多 2 层）
 *
 * 顶级评论为 parentId === null 的节点。
 * 第一层回复挂在对应顶级评论下。
 * 第二层及更深回复也挂在顶级评论下（不再继续嵌套）。
 */
export function buildCommentTree(flatComments) {
    const nodes = flatComments.map((c) => ({
        ...c,
        sentimentLabel: sentimentToLabel(c.sentiment),
        replies: [],
    }));
    const nodeMap = new Map();
    for (const node of nodes) {
        nodeMap.set(node.id, node);
    }
    const roots = [];
    for (const node of nodes) {
        if (!node.parentId) {
            // 顶级评论
            roots.push(node);
        }
        else {
            const parent = nodeMap.get(node.parentId);
            if (parent) {
                // 检查父评论是否本身就是顶级评论
                // 如果父评论也是回复，则将此回复挂到顶级评论下（限制 2 层）
                if (parent.parentId) {
                    const grandparent = nodeMap.get(parent.parentId);
                    if (grandparent && !grandparent.parentId) {
                        grandparent.replies.push(node);
                    }
                    else {
                        // 回退：找不到顶级，作为顶级评论处理
                        roots.push(node);
                    }
                }
                else {
                    // 父评论就是顶级评论，直接挂在下面
                    parent.replies.push(node);
                }
            }
            else {
                // 父评论不存在，作为顶级评论处理
                roots.push(node);
            }
        }
    }
    // 对顶级评论和每条回复按时间排序
    const sortReplies = (items) => items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    for (const root of roots) {
        root.replies = sortReplies(root.replies);
    }
    return sortReplies(roots);
}
/**
 * 情感统计（正向/中性/负向数量）
 */
export function countBySentiment(comments) {
    const counts = { positive: 0, neutral: 0, negative: 0, all: comments.length };
    for (const c of comments) {
        const label = sentimentToLabel(c.sentiment);
        counts[label]++;
    }
    return counts;
}
//# sourceMappingURL=comment-utils.js.map