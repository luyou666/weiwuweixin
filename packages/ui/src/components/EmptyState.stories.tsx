import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import type { EmptyStateProps } from '../types';

const meta: Meta<EmptyStateProps> = {
  title: '组件/EmptyState 空态',
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
      description: '场景变体（语义化快捷映射）',
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

export default meta;
type Story = StoryObj<EmptyStateProps>;

/**
 * 默认空态 — 鲸鱼插画
 */
export const Default: Story = {
  args: {
    variant: 'whale',
  },
};

/**
 * 所有插画变体
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
      <EmptyState variant="whale" />
      <EmptyState variant="mountain" />
      <EmptyState variant="boat" />
      <EmptyState variant="tea" />
    </div>
  ),
};

/**
 * 场景变体 — 空榜单
 */
export const SceneListEmpty: Story = {
  args: {
    scene: 'list-empty',
    action: <Button size="sm">新建榜单</Button>,
  },
};

/**
 * 场景变体 — 空评论
 */
export const SceneCommentEmpty: Story = {
  args: { scene: 'comment-empty' },
};

/**
 * 场景变体 — 空搜索结果
 */
export const SceneSearchEmpty: Story = {
  args: { scene: 'search-empty' },
};

/**
 * 场景变体 — 空用户
 */
export const SceneUserEmpty: Story = {
  args: { scene: 'user-empty' },
};

/**
 * 所有场景变体一览
 */
export const AllScenes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
      <EmptyState scene="list-empty" action={<Button size="sm">新建榜单</Button>} />
      <EmptyState scene="comment-empty" />
      <EmptyState scene="search-empty" />
      <EmptyState scene="user-empty" />
    </div>
  ),
};

/**
 * 自定义文案与操作按钮
 */
export const WithAction: Story = {
  render: () => (
    <EmptyState
      variant="tea"
      title="尚无记录"
      description="来一杯清茶，静待美好降临"
      action={<Button size="sm">开始探索</Button>}
    />
  ),
};

/**
 * 可交互的空态 — 通过 Controls 面板切换变体和文案
 */
export const Interactive: Story = {
  args: {
    variant: 'whale',
    scene: undefined,
    title: '',
    description: '',
    size: 'md',
  },
};

/**
 * 所有尺寸
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
      <EmptyState variant="whale" size="sm" />
      <EmptyState variant="whale" size="md" />
      <EmptyState variant="whale" size="lg" />
    </div>
  ),
};

/**
 * 暗色模式下的空态
 */
export const DarkMode: Story = {
  parameters: { darkMode: true },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
      <EmptyState variant="whale" />
      <EmptyState variant="mountain" />
    </div>
  ),
};