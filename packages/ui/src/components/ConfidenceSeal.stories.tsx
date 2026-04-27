import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfidenceSeal } from './ConfidenceSeal';
import type { ConfidenceSealProps } from '../types';

const meta: Meta<ConfidenceSealProps> = {
  title: '组件/ConfidenceSeal 置信度印章',
  component: ConfidenceSeal,
  tags: ['autodocs'],
  argTypes: {
    confidence: {
      control: { type: 'number', min: 0, max: 1, step: 0.01 },
      description: '置信度（0~1）',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '印章尺寸',
    },
    label: {
      control: 'text',
      description: '自定义标签文字',
    },
    spinning: {
      control: 'boolean',
      description: '外圈篆刻纹样是否旋转',
    },
    spinDuration: {
      control: { type: 'number', min: 5, max: 60, step: 1 },
      description: '旋转一圈秒数',
    },
    lowText: {
      control: 'text',
      description: '低置信度（<0.5）文案',
    },
    highText: {
      control: 'text',
      description: '高置信度（≥0.5）文案',
    },
  },
  args: {
    confidence: 0.75,
    size: 'md',
    spinning: true,
    spinDuration: 20,
    lowText: '存疑',
    highText: '确然',
  },
};

export default meta;
type Story = StoryObj<ConfidenceSealProps>;

/**
 * 默认置信度印章 — 75% 置信度 + 篆刻纹样旋转
 */
export const Default: Story = {
  args: {
    confidence: 0.75,
  },
};

/**
 * 所有置信度级别
 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>置信度级别</h3>
      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <ConfidenceSeal confidence={0.15} />
          <p style={{ marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>低 — 15%</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ConfidenceSeal confidence={0.45} />
          <p style={{ marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>中低 — 45%</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ConfidenceSeal confidence={0.75} />
          <p style={{ marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>高 — 75%</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <ConfidenceSeal confidence={0.95} />
          <p style={{ marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>极高 — 95%</p>
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>尺寸</h3>
      <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
        <ConfidenceSeal confidence={0.7} size="sm" />
        <ConfidenceSeal confidence={0.7} size="md" />
        <ConfidenceSeal confidence={0.7} size="lg" />
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>静态（无旋转）</h3>
      <ConfidenceSeal confidence={0.8} spinning={false} />

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>自定义文案</h3>
      <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
        <ConfidenceSeal confidence={0.3} lowText="疑" highText="信" />
        <ConfidenceSeal confidence={0.9} lowText="疑" highText="信" />
      </div>
    </div>
  ),
};

/**
 * 可交互的置信度印章 — 通过 Controls 面板调整置信度
 */
export const Interactive: Story = {
  render: () => {
    const [confidence, setConfidence] = useState(0.75);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)' }}>
        <ConfidenceSeal confidence={confidence} />
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            置信度：{Math.round(confidence * 100)}%
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            style={{ width: 200 }}
          />
        </label>
      </div>
    );
  },
};

/**
 * 暗色模式下的置信度印章
 */
export const DarkMode: Story = {
  parameters: { darkMode: true },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
      <ConfidenceSeal confidence={0.3} size="sm" />
      <ConfidenceSeal confidence={0.7} size="md" />
      <ConfidenceSeal confidence={0.95} size="lg" />
    </div>
  ),
};