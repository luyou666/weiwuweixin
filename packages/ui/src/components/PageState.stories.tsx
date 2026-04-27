import type { Meta, StoryObj } from '@storybook/react';
import { LoadingState, ErrorState } from './PageState';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import type {
  LoadingStateProps,
  ErrorStateProps,
  EmptyStateProps,
  PageStateProps,
} from '../types';

/* ============================================================
   Stories — LoadingState
   ============================================================ */

const loadingMeta: Meta<LoadingStateProps> = {
  title: '组件/PageState/LoadingState 加载态',
  component: LoadingState,
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: '加载文案',
    },
    showSkeletonAfter: {
      control: 'number',
      description: '多久后切换骨架屏（ms）',
    },
    skeletonColumns: {
      control: { type: 'range', min: 1, max: 4 },
      description: '骨架屏列数',
    },
    skeletonRows: {
      control: { type: 'range', min: 1, max: 6 },
      description: '骨架屏行数',
    },
  },
  args: {
    message: '加载中…',
    showSkeletonAfter: 99999,
    skeletonColumns: 2,
    skeletonRows: 3,
  },
};

export default loadingMeta;
type LoadingStory = StoryObj<LoadingStateProps>;

/** 默认加载态 — 水墨晕圈 + 毛笔动画 */
export const Default: LoadingStory = {
  args: {
    message: '加载中…',
    showSkeletonAfter: 99999,
  },
};

/** 3 秒后自动切换骨架屏 */
export const SkeletonTransition: LoadingStory = {
  args: {
    message: '加载中…',
    showSkeletonAfter: 3000,
    skeletonColumns: 2,
    skeletonRows: 3,
  },
};

/** 自定义加载文案 */
export const CustomMessage: LoadingStory = {
  args: {
    message: '墨迹晕开中，请稍候…',
    showSkeletonAfter: 99999,
  },
};

/** 单列骨架屏 */
export const SingleColumn: LoadingStory = {
  args: {
    message: '加载中…',
    showSkeletonAfter: 3000,
    skeletonColumns: 1,
    skeletonRows: 4,
  },
};

/* ============================================================
   Stories — ErrorState
   ============================================================ */

const errorMeta: Meta<ErrorStateProps> = {
  title: '组件/PageState/ErrorState 错误态',
  component: ErrorState,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '错误标题',
    },
    description: {
      control: 'text',
      description: '错误描述',
    },
    retryLabel: {
      control: 'text',
      description: '重试按钮文案',
    },
  },
  args: {
    title: '云迷雾锁，暂不可达',
    description: '路径暂不可寻，请稍后再试',
    retryLabel: '重试',
  },
};

type ErrorStory = StoryObj<ErrorStateProps>;

/** 默认错误态 — 山舟水墨 + 重试 */
export const ErrorDefault: ErrorStory = {
  args: {
    onRetry: () => alert('重试！'),
  },
};

/** 无重试按钮 */
export const ErrorNoRetry: ErrorStory = {
  args: {},
};

/** 自定义文案 */
export const ErrorCustom: ErrorStory = {
  args: {
    title: '网络不可用',
    description: '请检查网络连接后重试',
    retryLabel: '再试一次',
    onRetry: () => alert('重试！'),
  },
};

/* ============================================================
   Stories — EmptyState 增强（场景变体）
   ============================================================ */

const emptyMeta: Meta<EmptyStateProps> = {
  title: '组件/PageState/EmptyState 空态',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['whale', 'mountain', 'boat', 'tea'],
      description: '插画变体',
    },
    scene: {
      control: 'select',
      options: ['list-empty', 'comment-empty', 'search-empty', 'user-empty'],
      description: '场景变体',
    },
    title: {
      control: 'text',
      description: '标题文案',
    },
    description: {
      control: 'text',
      description: '描述文案',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '空态尺寸',
    },
  },
  args: {
    variant: 'whale',
    size: 'md',
  },
};

type EmptyStory = StoryObj<EmptyStateProps>;

/** 默认空态 — 鲸鱼插画 */
export const EmptyDefault: EmptyStory = {
  args: {
    variant: 'whale',
  },
};

/** 所有插画变体 */
export const AllVariants: EmptyStory = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
      <EmptyState variant="whale" />
      <EmptyState variant="mountain" />
      <EmptyState variant="boat" />
      <EmptyState variant="tea" />
    </div>
  ),
};

/** 场景变体 — 空榜单 */
export const SceneListEmpty: EmptyStory = {
  args: { scene: 'list-empty' },
};

/** 场景变体 — 空评论 */
export const SceneCommentEmpty: EmptyStory = {
  args: { scene: 'comment-empty' },
};

/** 场景变体 — 空搜索结果 */
export const SceneSearchEmpty: EmptyStory = {
  args: { scene: 'search-empty' },
};

/** 场景变体 — 空用户 */
export const SceneUserEmpty: EmptyStory = {
  args: { scene: 'user-empty' },
};

/** 所有场景变体一览 */
export const AllScenes: EmptyStory = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
      <EmptyState scene="list-empty" action={<Button size="sm">新建榜单</Button>} />
      <EmptyState scene="comment-empty" />
      <EmptyState scene="search-empty" />
      <EmptyState scene="user-empty" />
    </div>
  ),
};

/** 场景变体 + 自定义文案 */
export const SceneWithCustomCopy: EmptyStory = {
  args: {
    scene: 'search-empty',
    title: '没有找到相关结果',
    description: '换个关键字试试？',
  },
};

/** 自定义文案与操作按钮 */
export const WithAction: EmptyStory = {
  render: () => (
    <EmptyState
      variant="tea"
      title="尚无记录"
      description="来一杯清茶，静待美好降临"
      action={<Button size="sm">开始探索</Button>}
    />
  ),
};

/** 可交互的空态 — 通过 Controls 面板切换变体和文案 */
export const Interactive: EmptyStory = {
  args: {
    variant: 'whale',
    title: '',
    description: '',
    size: 'md',
  },
};

/** 所有尺寸 */
export const Sizes: EmptyStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
      <EmptyState variant="whale" size="sm" />
      <EmptyState variant="whale" size="md" />
      <EmptyState variant="whale" size="lg" />
    </div>
  ),
};

/** 暗色模式下的空态 */
export const DarkMode: EmptyStory = {
  parameters: { darkMode: true },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
      <EmptyState variant="whale" />
      <EmptyState variant="mountain" />
    </div>
  ),
};