/**
 * 围物为心 — 新建榜单 Zustand Store
 * 管理多步骤表单的全局状态
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ListVisibility } from '@weiwuweixin/shared';
import { MAX_TITLE_LENGTH, MAX_SUBTITLE_LENGTH, MAX_DIMENSIONS, MIN_DIMENSIONS } from '@weiwuweixin/shared';
import type { AlgorithmId } from '@weiwuweixin/shared';

/* ============================================================
   类型定义
   ============================================================ */

export interface FormItem {
  id: string;
  name: string;
  note: string;
}

export interface FormDimension {
  id: string;
  name: string;
  weight: number; // 0 – 100
  scale: number;  // e.g. 5, 10, 100
}

export type FormStep = 1 | 2 | 3 | 4;

export interface ListFormState {
  /* Step 1 */
  title: string;
  subtitle: string;
  tags: string[];
  visibility: ListVisibility;

  /* Step 2 */
  items: FormItem[];

  /* Step 3 */
  dimensions: FormDimension[];

  /* Step 4 */
  algorithmId: AlgorithmId;

  /* Navigation */
  currentStep: FormStep;
  isSubmitting: boolean;
}

export interface ListFormActions {
  /* Step 1 */
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  setVisibility: (visibility: ListVisibility) => void;

  /* Step 2 */
  addItem: (name?: string, note?: string) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<Pick<FormItem, 'name' | 'note'>>) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;

  /* Step 3 */
  addDimension: () => void;
  removeDimension: (id: string) => void;
  updateDimension: (id: string, updates: Partial<Pick<FormDimension, 'name' | 'weight' | 'scale'>>) => void;
  reorderDimensions: (fromIndex: number, toIndex: number) => void;

  /* Step 4 */
  setAlgorithmId: (id: AlgorithmId) => void;

  /* Navigation */
  setStep: (step: FormStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setIsSubmitting: (val: boolean) => void;

  /* Reset */
  reset: () => void;
}

let itemCounter = 0;
let dimCounter = 0;

const initialState: ListFormState = {
  title: '',
  subtitle: '',
  tags: [],
  visibility: 'PUBLIC',
  items: [],
  dimensions: [
    { id: `dim-${++dimCounter}`, name: '', weight: 50, scale: 5 },
  ],
  algorithmId: 'weighted-mean',
  currentStep: 1,
  isSubmitting: false,
};

export const useListStore = create<ListFormState & ListFormActions>()(
  devtools(
    (set) => ({
      ...initialState,

      /* ── Step 1 ── */
      setTitle: (title) => set({ title: title.slice(0, MAX_TITLE_LENGTH) }),
      setSubtitle: (subtitle) => set({ subtitle: subtitle.slice(0, MAX_SUBTITLE_LENGTH) }),
      setTags: (tags) => set({ tags }),
      toggleTag: (tag) =>
        set((s) => ({
          tags: s.tags.includes(tag) ? s.tags.filter((t) => t !== tag) : [...s.tags, tag],
        })),
      setVisibility: (visibility) => set({ visibility }),

      /* ── Step 2 ── */
      addItem: (name = '', note = '') =>
        set((s) => ({
          items: [...s.items, { id: `item-${++itemCounter}`, name, note }],
        })),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateItem: (id, updates) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      reorderItems: (fromIndex, toIndex) =>
        set((s) => {
          const newItems = [...s.items];
          const [moved] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, moved);
          return { items: newItems };
        }),

      /* ── Step 3 ── */
      addDimension: () =>
        set((s) => {
          if (s.dimensions.length >= MAX_DIMENSIONS) return s;
          return {
            dimensions: [
              ...s.dimensions,
              { id: `dim-${++dimCounter}`, name: '', weight: 50, scale: 5 },
            ],
          };
        }),
      removeDimension: (id) =>
        set((s) => {
          if (s.dimensions.length <= MIN_DIMENSIONS) return s;
          return { dimensions: s.dimensions.filter((d) => d.id !== id) };
        }),
      updateDimension: (id, updates) =>
        set((s) => ({
          dimensions: s.dimensions.map((d) =>
            d.id === id ? { ...d, ...updates } : d,
          ),
        })),
      reorderDimensions: (fromIndex, toIndex) =>
        set((s) => {
          const newDimensions = [...s.dimensions];
          const [moved] = newDimensions.splice(fromIndex, 1);
          newDimensions.splice(toIndex, 0, moved);
          return { dimensions: newDimensions };
        }),

      /* ── Step 4 ── */
      setAlgorithmId: (algorithmId) => set({ algorithmId }),

      /* ── Navigation ── */
      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((s) => ({
          currentStep: (Math.min(s.currentStep + 1, 4)) as FormStep,
        })),
      prevStep: () =>
        set((s) => ({
          currentStep: (Math.max(s.currentStep - 1, 1)) as FormStep,
        })),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

      /* ── Reset ── */
      reset: () => {
        itemCounter = 0;
        dimCounter = 0;
        set({ ...initialState, dimensions: [{ id: `dim-${++dimCounter}`, name: '', weight: 50, scale: 5 }] });
      },
    }),
    { name: 'list-form-store' },
  ),
);