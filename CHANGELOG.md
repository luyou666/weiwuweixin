# 更新日志

本文档记录围物为心 (WeiWuWeiXin) 的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [0.1.0] - 2026-05-03

### 🎉 首个公开发布版本

#### 新增
- 首页 Feed（多样性 × 高置信度 × 新鲜度排序）
- 发现/搜索页（分类浏览 + 话题聚合 + 全站搜索）
- 榜单创建器 Ranker Studio（4 步创建流程）
- 榜单详情页（排名 + 置信度 + 评论 + 社区分数）
- 他人打分页（沉浸式 3 步评分流程）
- 个人主页（榜单 + 徽章 + 同好关系）
- 关于页（产品故事 + 算法说明）
- 账户设置页
- PNG 分享卡导出（6 套模板：宣纸水墨 / 莫兰迪 / 赛博霓虹 / 复古杂志 / 极简白 / 手账贴纸）

#### 算法引擎 (packages/scoring)
- 5 种评分算法：加权平均、几何平均、Borda 排位分、TOPSIS 理想解、贝叶斯收缩
- 置信度引擎：共识度计算 + 时间衰减
- 反刷分检测：过快降权、同设备限制、方差异常检测、极端评分标记

#### 技术架构
- pnpm monorepo：apps/api (Fastify) + apps/web (Next.js 14)
- 数据库：PostgreSQL 15 + Prisma ORM
- 缓存：Redis 7
- 对象存储：MinIO
- 国际化：next-intl 双语 (zh/en)
- 测试：Vitest 171 tests + Playwright E2E
- 设计系统：11 基础组件 + Storybook 38+ stories

#### 质量
- Lighthouse Accessibility: 100 (首页) / 93 (新建页)
- axe-core CLI: 0 violations (首页)
- 算法覆盖率: 99.8% lines
- TypeScript strict mode
- ESLint + Prettier + Husky pre-commit hooks

---

[0.1.0]: https://github.com/nous-hermes/weiwuweixin/releases/tag/v0.1.0
