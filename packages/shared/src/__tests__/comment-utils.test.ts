/**
 * 围物为心 — 评论工具函数测试
 */
import { describe, it, expect } from 'vitest';
import {
  sortCommentsByTime,
  filterBySentiment,
  buildCommentTree,
  countBySentiment,
  sentimentToLabel,
  type FlatComment,
} from '../comment-utils';

/* ============================================================
   辅助数据
   ============================================================ */

const mockComments: FlatComment[] = [
  {
    id: 'c1',
    nickname: '墨客',
    content: '非常好！',
    sentiment: 0.8,
    createdAt: '2024-04-01T08:00:00Z',
    parentId: null,
  },
  {
    id: 'c2',
    nickname: '竹影',
    content: '还行吧',
    sentiment: 0.1,
    createdAt: '2024-04-01T09:00:00Z',
    parentId: null,
  },
  {
    id: 'c3',
    nickname: '清风',
    content: '不太满意',
    sentiment: -0.6,
    createdAt: '2024-04-01T07:00:00Z',
    parentId: null,
  },
  {
    id: 'c4',
    nickname: '云归',
    content: '我同意墨客说的',
    sentiment: 0.5,
    createdAt: '2024-04-01T08:30:00Z',
    parentId: 'c1',
  },
  {
    id: 'c5',
    nickname: '望舒',
    content: '确实很糟糕',
    sentiment: -0.9,
    createdAt: '2024-04-01T10:00:00Z',
    parentId: null,
  },
];

/* ============================================================
   测试
   ============================================================ */

describe('sentimentToLabel', () => {
  it('正向情感 > 0.3 → positive', () => {
    expect(sentimentToLabel(0.5)).toBe('positive');
    expect(sentimentToLabel(1.0)).toBe('positive');
    expect(sentimentToLabel(0.31)).toBe('positive');
  });

  it('负向情感 < -0.3 → negative', () => {
    expect(sentimentToLabel(-0.5)).toBe('negative');
    expect(sentimentToLabel(-1.0)).toBe('negative');
    expect(sentimentToLabel(-0.31)).toBe('negative');
  });

  it('中性情感 -0.3 ≤ x ≤ 0.3 → neutral', () => {
    expect(sentimentToLabel(0)).toBe('neutral');
    expect(sentimentToLabel(0.3)).toBe('neutral');
    expect(sentimentToLabel(-0.3)).toBe('neutral');
  });
});

describe('sortCommentsByTime', () => {
  it('按时间升序排列', () => {
    const sorted = sortCommentsByTime(mockComments);
    expect(sorted[0].id).toBe('c3'); // 07:00
    expect(sorted[1].id).toBe('c1'); // 08:00
    expect(sorted[sorted.length - 1].id).toBe('c5'); // 10:00
  });

  it('不修改原数组', () => {
    const original = [...mockComments];
    sortCommentsByTime(mockComments);
    expect(mockComments).toEqual(original);
  });
});

describe('filterBySentiment', () => {
  it('筛选正向评论', () => {
    const result = filterBySentiment(mockComments, 'positive');
    // c1 = 0.8 (pos), c2 = 0.1 (neutral), c3 = -0.6 (neg), c4 = 0.5 (pos), c5 = -0.9 (neg)
    // positive: c1, c4 → 2
    expect(result.length).toBe(2);
    expect(result.every((c) => c.sentiment > 0.3)).toBe(true);
  });

  it('筛选负向评论', () => {
    const result = filterBySentiment(mockComments, 'negative');
    expect(result.length).toBe(2); // c3, c5
    expect(result.every((c) => c.sentiment < -0.3)).toBe(true);
  });

  it('筛选中性评论', () => {
    const result = filterBySentiment(mockComments, 'neutral');
    expect(result.length).toBe(1); // c2
    expect(result[0].id).toBe('c2');
  });

  it('筛选全部（all）返回原数组', () => {
    const result = filterBySentiment(mockComments, 'all');
    expect(result.length).toBe(mockComments.length);
  });
});

describe('buildCommentTree', () => {
  it('构建嵌套树 — 顶级评论和回复', () => {
    const tree = buildCommentTree(mockComments);
    // 只有 4 条顶级评论（c1, c2, c3, c5）；c4 是 c1 的回复
    expect(tree.length).toBe(4);
    const c1Node = tree.find((n) => n.id === 'c1');
    expect(c1Node).toBeDefined();
    expect(c1Node!.replies.length).toBe(1);
    expect(c1Node!.replies[0].id).toBe('c4');
  });

  it('限制最大嵌套 2 层', () => {
    // c6 回复 c4（c4 是 c1 的回复），c6 应挂在 c1 下而非 c4 下
    const deep: FlatComment[] = [
      ...mockComments,
      {
        id: 'c6',
        nickname: '深层回复',
        content: '我回复云归',
        sentiment: 0.2,
        createdAt: '2024-04-01T08:45:00Z',
        parentId: 'c4', // 回复的回复
      },
    ];
    const tree = buildCommentTree(deep);
    const c1Node = tree.find((n) => n.id === 'c1');
    expect(c1Node!.replies.length).toBe(2); // c4 和 c6 都在 c1 下
  });

  it('parentId 指向不存在的评论 → 作为顶级评论', () => {
    const orphaned: FlatComment[] = [
      {
        id: 'orphan',
        nickname: '孤儿评论',
        content: '找不到父评论',
        sentiment: 0,
        createdAt: '2024-04-01T11:00:00Z',
        parentId: 'nonexistent',
      },
    ];
    const tree = buildCommentTree(orphaned);
    expect(tree.length).toBe(1);
    expect(tree[0].id).toBe('orphan');
  });

  it('空数组返回空树', () => {
    expect(buildCommentTree([])).toEqual([]);
  });
});

describe('countBySentiment', () => {
  it('正确统计各情感数量', () => {
    const counts = countBySentiment(mockComments);
    expect(counts.positive).toBe(2); // c1, c4
    expect(counts.neutral).toBe(1);  // c2
    expect(counts.negative).toBe(2); // c3, c5
    expect(counts.all).toBe(5);
  });

  it('空数组返回全零', () => {
    const counts = countBySentiment([]);
    expect(counts.positive).toBe(0);
    expect(counts.neutral).toBe(0);
    expect(counts.negative).toBe(0);
    expect(counts.all).toBe(0);
  });

  it('边界值 — sentiment 正好为 0.3 和 -0.3', () => {
    const edgeCases: FlatComment[] = [
      {
        id: 'e1',
        nickname: 'a',
        content: '',
        sentiment: 0.3,
        createdAt: '',
        parentId: null,
      },
      {
        id: 'e2',
        nickname: 'b',
        content: '',
        sentiment: -0.3,
        createdAt: '',
        parentId: null,
      },
    ];
    const counts = countBySentiment(edgeCases);
    expect(counts.neutral).toBe(2);
    expect(counts.positive).toBe(0);
    expect(counts.negative).toBe(0);
  });
});