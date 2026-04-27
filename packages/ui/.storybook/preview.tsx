import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/tokens.css';

/**
 * 暗色模式切换装饰器
 * 通过 Story 的 parameters.darkMode 或 globals.darkMode 控制包裹层 data-theme
 */
const withDarkMode = (Story: React.ComponentType, context: any) => {
  const isDark =
    context.parameters?.darkMode ||
    context.globals?.darkMode === 'dark';

  return React.createElement(
    'div',
    {
      'data-theme': isDark ? 'dark' : 'light',
      style: {
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'var(--font-body)',
        transition: 'background-color 0.3s, color 0.3s',
      },
    },
    React.createElement(Story)
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      disable: true, // We use CSS variable theme system instead
    },
    options: {
      // 中文章节排序
      storySort: {
        order: ['组件', ['Button 按钮', 'Card 卡片', 'Sticker 贴纸', 'Slider 滑杆', 'ConfidenceSeal 置信度印章', 'EmptyState 空态', 'SkeletonInk 水墨骨架屏']],
      },
    },
  },
  globalTypes: {
    darkMode: {
      name: '暗色模式',
      description: '切换亮色/暗色主题',
      defaultValue: 'light',
      toolbar: {
        title: '主题',
        items: [
          { value: 'light', title: '☀️ 亮色', icon: 'sun' },
          { value: 'dark', title: '🌙 暗色', icon: 'moon' },
        ],
      },
    },
  },
  decorators: [withDarkMode],
};

export default preview;