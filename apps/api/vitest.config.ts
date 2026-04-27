import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 串行执行测试文件，避免 embedded-postgres 端口/dataDir 冲突
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // 测试环境变量
    env: {
      DISABLE_REDIS: '1',
      REDIS_URL: '',
    },
  },
});