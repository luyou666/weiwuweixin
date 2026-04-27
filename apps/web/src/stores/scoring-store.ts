/**
 * 围物为心 — 作者打分 Zustand Store
 * 管理 authorScores 状态 + 实时排名计算
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { registry } from '@weiwuweixin/scoring';
import type { Item, Dimension, ScoredItem } from '@weiwuweixin/scoring';

/* ============================================================
   类型定义
   ============================================================ */

/** authorScores: Record<itemId, Record<dimensionId, number>> */
export type AuthorScores = Record<string, Record<string, number>>;

export interface ScoringState {
  /** 作者对各条目·各维度的打分 */
  authorScores: AuthorScores;
  /** 当前选用的算法 ID */
  algorithmId: string;
  /** 计时器是否已启动 */
  timerStarted: boolean;
  /** 计时器是否已结束（自动提交） */
  timerExpired: boolean;
  /** 是否正在提交 */
  isSubmitting: boolean;
}

export interface ScoringActions {
  /** 设置某条目某维度的分数 */
  setScore: (itemId: string, dimensionId: string, score: number) => void;
  /** 获取某条目某维度的分数 */
  getScore: (itemId: string, dimensionId: string) => number;
  /** 批量初始化分数（用于编辑回填） */
  initScores: (scores: AuthorScores) => void;
  /** 重置某条目的所有维度分数 */
  resetItemScores: (itemId: string) => void;
  /** 清空所有打分 */
  resetAllScores: () => void;
  /** 设置算法 */
  setAlgorithmId: (id: string) => void;
  /** 实时计算排名 */
  getRankedItems: (
    items: Item[],
    dimensions: Dimension[],
  ) => ScoredItem[];
  /** 计时器控制 */
  startTimer: () => void;
  expireTimer: () => void;
  setIsSubmitting: (val: boolean) => void;
  /** 完全重置 */
  reset: () => void;
}

const initialState: ScoringState = {
  authorScores: {},
  algorithmId: 'weighted-mean',
  timerStarted: false,
  timerExpired: false,
  isSubmitting: false,
};

export const useScoringStore = create<ScoringState & ScoringActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setScore: (itemId, dimensionId, score) =>
        set((s) => ({
          authorScores: {
            ...s.authorScores,
            [itemId]: {
              ...(s.authorScores[itemId] ?? {}),
              [dimensionId]: score,
            },
          },
        })),

      getScore: (itemId, dimensionId) => {
        return get().authorScores[itemId]?.[dimensionId] ?? 0;
      },

      initScores: (scores) => set({ authorScores: scores }),

      resetItemScores: (itemId) =>
        set((s) => {
          const { [itemId]: _unused, ...rest } = s.authorScores; // eslint-disable-line
          return { authorScores: rest };
        }),

      resetAllScores: () => set({ authorScores: {} }),

      setAlgorithmId: (algorithmId) => set({ algorithmId }),

      /**
       * 实时排名计算：
       * 将 authorScores 映射为 Item[]（scores 已归一化到各维度 scale），
       * 然后调用 scoring 包的 compute 方法
       */
      getRankedItems: (items, dimensions) => {
        const { authorScores, algorithmId } = get();
        const engine = registry.get(algorithmId);
        if (!engine) return [];

        // 将 authorScores 映射到 Item.scores，归一化到 0-100 分制
        const scoredItems: Item[] = items.map((item) => {
          const dimScores: Record<string, number> = {};
          for (const dim of dimensions) {
            const rawScore = authorScores[item.id]?.[dim.id] ?? 0;
            // 归一化: (rawScore / scale) * 100
            const scale = dim.scale ?? 100;
            dimScores[dim.id] = (rawScore / scale) * 100;
          }
          return {
            ...item,
            scores: dimScores,
          };
        });

        return engine.compute(scoredItems, dimensions);
      },

      startTimer: () => set({ timerStarted: true }),
      expireTimer: () => set({ timerExpired: true }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

      reset: () => set({ ...initialState }),
    }),
    { name: 'scoring-store' },
  ),
);