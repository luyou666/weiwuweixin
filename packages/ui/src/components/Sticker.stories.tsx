import type { Meta, StoryObj } from '@storybook/react';
import { Sticker } from './Sticker';
import type { StickerProps } from '../types';

const meta: Meta<StickerProps> = {
  title: '组件/Sticker 贴纸',
  component: Sticker,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '贴纸尺寸',
    },
    draggable: {
      control: 'boolean',
      description: '是否可拖拽',
    },
    rotatable: {
      control: 'boolean',
      description: '悬浮时是否旋转回正',
    },
    initialRotation: {
      control: { type: 'number', min: -15, max: 15, step: 1 },
      description: '初始旋转角度（默认随机）',
    },
    folded: {
      control: 'boolean',
      description: '是否显示折角装饰',
    },
    children: {
      control: 'text',
      description: '贴纸内容',
    },
  },
  args: {
    size: 'md',
    draggable: false,
    rotatable: true,
    folded: true,
    children: '贴纸',
  },
};

export default meta;
type Story = StoryObj<StickerProps>;

/**
 * 默认贴纸 — 轻微旋转 + 折角装饰 + 弹跳悬浮
 */
export const Default: Story = {
  args: {
    children: '贴纸文字',
  },
};

/**
 * 所有贴纸变体
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>尺寸</h3>
      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center', flexWrap: 'wrap' }}>
        <Sticker size="sm">小号</Sticker>
        <Sticker size="md">中号</Sticker>
        <Sticker size="lg">大号贴纸</Sticker>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>折角 vs 无折角</h3>
      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
        <Sticker folded>有折角</Sticker>
        <Sticker folded={false}>无折角</Sticker>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>可拖拽</h3>
      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
        <Sticker draggable>拖我试试</Sticker>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>自定义旋转角度</h3>
      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
        <Sticker initialRotation={-8}>-8°</Sticker>
        <Sticker initialRotation={0}>0°</Sticker>
        <Sticker initialRotation={8}>+8°</Sticker>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>富内容</h3>
      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'flex-start' }}>
        <Sticker size="lg">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🏔</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>山水之乐</div>
          </div>
        </Sticker>
        <Sticker size="lg">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🍵</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>一盏清茶</div>
          </div>
        </Sticker>
      </div>
    </div>
  ),
};

/**
 * 可交互的贴纸 — 通过 Controls 面板调整属性
 */
export const Interactive: Story = {
  args: {
    children: '交互贴纸',
    size: 'md',
    draggable: false,
    rotatable: true,
    folded: true,
  },
};

/**
 * 暗色模式下的贴纸
 */
export const DarkMode: Story = {
  parameters: { darkMode: true },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
      <Sticker size="sm">小号</Sticker>
      <Sticker size="md">暗色贴纸</Sticker>
      <Sticker size="lg" folded={false}>
        <div style={{ textAlign: 'center' }}>大号无折角</div>
      </Sticker>
    </div>
  ),
};