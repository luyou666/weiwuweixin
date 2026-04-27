import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import type { CardProps } from '../types';

const meta: Meta<CardProps> = {
  title: '组件/Card 卡片',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '卡片尺寸',
    },
    interactive: {
      control: 'boolean',
      description: '是否可悬浮交互（悬浮时倾斜弹跳）',
    },
    textured: {
      control: 'boolean',
      description: '是否显示纸面纹理叠层',
    },
    tiltAngle: {
      control: { type: 'number', min: 0, max: 10, step: 0.5 },
      description: '悬浮时倾斜角度',
    },
    children: {
      control: 'text',
      description: '卡片内容',
    },
  },
  args: {
    size: 'md',
    interactive: true,
    textured: true,
    tiltAngle: 2,
    children: '纸面纹理卡片，悬浮时轻微倾斜',
  },
};

export default meta;
type Story = StoryObj<CardProps>;

/**
 * 默认卡片 — 纸面纹理 + 贴纸阴影
 */
export const Default: Story = {
  args: {
    children: '围物为心，以心度物',
  },
};

/**
 * 所有卡片变体
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>尺寸</h3>
      <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <Card size="sm">
          <p style={{ margin: 0 }}>小号卡片</p>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            适合紧凑信息
          </p>
        </Card>
        <Card size="md">
          <p style={{ margin: 0 }}>中号卡片</p>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            默认尺寸
          </p>
        </Card>
        <Card size="lg">
          <p style={{ margin: 0 }}>大号卡片</p>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            宽松阅读
          </p>
        </Card>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>纹理 vs 无纹理</h3>
      <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
        <Card textured>纸面纹理卡片</Card>
        <Card textured={false}>纯色背景卡片</Card>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>交互 vs 静态</h3>
      <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
        <Card interactive>悬浮可交互</Card>
        <Card interactive={false}>纯静态展示</Card>
      </div>
    </div>
  ),
};

/**
 * 可交互的卡片 — 通过 Controls 面板调整属性
 */
export const Interactive: Story = {
  args: {
    children: '调整右侧控制面板查看不同配置',
    size: 'md',
    interactive: true,
    textured: true,
    tiltAngle: 2,
  },
};

/**
 * 暗色模式下的卡片
 */
export const DarkMode: Story = {
  parameters: { darkMode: true },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <Card size="md" textured>
        <p style={{ margin: 0 }}>暗色模式 — 纸面纹理</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          阴影与边框自动适配
        </p>
      </Card>
      <Card size="md" textured={false}>
        <p style={{ margin: 0 }}>暗色模式 — 纯色卡片</p>
      </Card>
    </div>
  ),
};