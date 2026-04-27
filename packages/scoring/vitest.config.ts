import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/index.ts',  // re-export only, no logic
      ],
      thresholds: {
        lines: 95,
        functions: 100,
        branches: 90,
        statements: 95,
      },
    },
  },
});

