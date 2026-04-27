import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';
import type { SliderProps } from '../types';

const meta: Meta<SliderProps> = {
  title: '组件/Slider 滑杆',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 100 },
      description: '当前值',
    },
    min: {
      control: 'number',
      description: '最小值',
    },
    max: {
      control: 'number',
      description: '最大值',
    },
    step: {
      control: 'number',
      description: '步长',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '滑杆尺寸',
    },
    showLabel: {
      control: 'boolean',
      description: '是否显示数值标签',
    },
    inkEffect: {
      control: 'boolean',
      description: '是否启用墨滴晕染动画',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    accentColor: {
      control: 'color',
      description: '自定义主题色',
    },
  },
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
    showLabel: true,
    inkEffect: true,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<SliderProps>;

/**
 * 默认滑杆 — 朱砂红主题 + 墨滴晕开效果
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    return <Slider value={value} onChange={setValue} />;
  },
};

/**
 * 所有滑杆变体
 */
export const Variants: Story = {
  render: () => {
    const [val1, setVal1] = useState(30);
    const [val2, setVal2] = useState(55);
    const [val3, setVal3] = useState(75);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)', maxWidth: 500 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>尺寸</h3>
        <Slider value={val1} onChange={setVal1} size="sm" />
        <Slider value={val2} onChange={setVal2} size="md" />
        <Slider value={val3} onChange={setVal3} size="lg" />

        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>自定义范围</h3>
        <Slider value={3} onChange={() => {}} min={0} max={10} step={0.5} />

        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>自定义主题色</h3>
        <Slider value={60} onChange={() => {}} accentColor="var(--celadon)" />
        <Slider value={40} onChange={() => {}} accentColor="var(--apricot)" />

        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>禁用态</h3>
        <Slider value={50} onChange={() => {}} disabled />

        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>无墨滴效果</h3>
        <Slider value={45} onChange={() => {}} inkEffect={false} />
      </div>
    );
  },
};

/**
 * 可交互的滑杆 — 拖动试试墨滴晕开效果
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    return (
      <div style={{ maxWidth: 400 }}>
        <Slider
          value={value}
          onChange={setValue}
          size="md"
          showLabel={true}
          inkEffect={true}
        />
        <p style={{ marginTop: 'var(--space-md)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          当前值：{value}
        </p>
      </div>
    );
  },
};

/**
 * 暗色模式下的滑杆
 */
export const DarkMode: Story = {
  parameters: { darkMode: true },
  render: () => {
    const [value, setValue] = useState(65);
    return (
      <div style={{ maxWidth: 400 }}>
        <Slider value={value} onChange={setValue} />
      </div>
    );
  },
};