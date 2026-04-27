import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Configure path aliases
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...((config.resolve.alias as Record<string, string>) || {}),
      '@weiwuweixin/shared': resolve(__dirname, '../../shared/src/index.ts'),
    };

    // Ensure framer-motion ESM works with Vite
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      'framer-motion',
    ];

    return config;
  },
};

export default config;