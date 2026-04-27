import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import type { ButtonProps } from '../types';

const meta: Meta<ButtonProps> = {
  title: '组件/Button 按钮',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '按钮尺寸',
    },
    fullWidth: {
      control: 'boolean',
      description: '是否占满父容器宽度',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    loading: {
      control: 'boolean',
      description: '是否加载中',
    },
    htmlType: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML 按钮类型',
    },
    children: {
      control: 'text',
      description: '按钮内容',
    },
  },
  args: {
    children: '点击此处',
    size: 'md',
    fullWidth: false,
    disabled: false,
    loading: false,
    htmlType: 'button',
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

/**
 * 默认按钮 — 朱砂红填色白字
 */
export const Default: Story = {
  args: {
    children: '默认按钮',
  },
};

/**
 * 所有尺寸与状态变体
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>尺寸</h3>
      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        <Button size="sm">小号按钮</Button>
        <Button size="md">中号按钮</Button>
        <Button size="lg">大号按钮</Button>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>状态</h3>
      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        <Button>正常</Button>
        <Button disabled>禁用</Button>
        <Button loading>加载中</Button>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>全宽</h3>
      <div style={{ maxWidth: 400 }}>
        <Button fullWidth>全宽按钮</Button>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>带图标</h3>
      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        <Button iconLeft={<span>←</span>}>返回</Button>
        <Button iconRight={<span>→</span>}>继续</Button>
        <Button iconLeft={<span>✦</span>} iconRight={<span>✦</span>}>两端图标</Button>
      </div>
    </div>
  ),
};

/**
 * 可交互的按钮 — 通过 Controls 面板调整属性
 */
export const Interactive: Story = {
  args: {
    children: '交互按钮',
    size: 'md',
    disabled: false,
    loading: false,
  },
};

/**
 * 暗色模式下的按钮
 */
export const DarkMode: Story = {
  parameters: { darkMode: true },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        <Button size="sm">小号</Button>
        <Button size="md">中号</Button>
        <Button size="lg">大号</Button>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        <Button>正常</Button>
        <Button disabled>禁用</Button>
        <Button loading>加载中</Button>
      </div>
    </div>
  ),
};