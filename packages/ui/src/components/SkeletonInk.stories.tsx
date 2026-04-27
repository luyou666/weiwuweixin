import type { Meta, StoryObj } from '@storybook/react';
import { SkeletonInk } from './SkeletonInk';
import type { SkeletonInkProps } from '../types';

const meta: Meta<SkeletonInkProps> = {
  title: '组件/SkeletonInk 水墨骨架屏',
  component: SkeletonInk,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'card', 'avatar', 'custom'],
      description: '骨架变体',
    },
    lines: {
      control: { type: 'number', min: 1, max: 20, step: 1 },
      description: '行数（text 变体）',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '尺寸',
    },
    animated: {
      control: 'boolean',
      description: '是否启用水墨晕染动画',
    },
    radius: {
      control: 'text',
      description: '自定义圆角',
    },
    width: {
      control: 'text',
      description: '自定义宽度',
    },
    height: {
      control: 'text',
      description: '自定义高度',
    },
  },
  args: {
    variant: 'text',
    animated: true,
  },
};

export default meta;
type Story = StoryObj<SkeletonInkProps>;

/**
 * 默认骨架 — 文本行 + 水墨晕染动画
 */
export const Default: Story = {
  args: {
    variant: 'text',
  },
};

/**
 * 所有骨架变体
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)', maxWidth: 500 }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>文本行（多行）</h3>
      <SkeletonInk variant="text" lines={4} />

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>单行文本</h3>
      <SkeletonInk variant="text" width="60%" height="1em" />

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>卡片骨架</h3>
      <SkeletonInk variant="card" />

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>头像骨架</h3>
      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        <SkeletonInk variant="avatar" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <SkeletonInk variant="text" width="40%" height="1em" radius="var(--radius-sm)" />
          <SkeletonInk variant="text" width="80%" height="0.8em" radius="var(--radius-sm)" />
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>自定义尺寸</h3>
      <SkeletonInk variant="custom" width="200px" height="100px" radius="var(--radius-lg)" />

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>静态（无动画）</h3>
      <SkeletonInk variant="text" lines={3} animated={false} />
    </div>
  ),
};

/**
 * 可交互的骨架 — 通过 Controls 面板调整属性
 */
export const Interactive: Story = {
  args: {
    variant: 'text',
    lines: 3,
    animated: true,
  },
};

/**
 * 模拟加载态 — 骨架屏组合示例
 */
export const LoadingDemo: Story = {
  render: () => (
    <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* 卡片骨架 */}
      <div style={{ padding: 'var(--space-lg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <SkeletonInk variant="avatar" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <SkeletonInk variant="text" width="50%" height="1em" radius="var(--radius-sm)" />
            <SkeletonInk variant="text" width="30%" height="0.7em" radius="var(--radius-sm)" />
          </div>
        </div>
        <SkeletonInk variant="text" lines={3} />
      </div>
    </div>
  ),
};

/**
 * 暗色模式下的骨架屏
 */
export const DarkMode: Story = {
  parameters: { darkMode: true },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', maxWidth: 400 }}>
      <SkeletonInk variant="text" lines={3} />
      <SkeletonInk variant="card" />
      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        <SkeletonInk variant="avatar" />
        <SkeletonInk variant="text" width="60%" height="1em" radius="var(--radius-sm)" />
      </div>
    </div>
  ),
};