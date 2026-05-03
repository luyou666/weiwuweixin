# 贡献指南

感谢你对围物为心 (WeiWuWeiXin) 的关注！我们欢迎任何形式的贡献。

## 行为准则

本项目采用 [贡献者公约 (Contributor Covenant)](CODE_OF_CONDUCT.md)。参与即表示你同意遵守其条款。

## 如何贡献

### 报告 Bug

1. 先在 [Issues](https://github.com/nous-hermes/weiwuweixin/issues) 中搜索是否已有相同问题
2. 使用 Bug Report 模板创建新 Issue
3. 描述复现步骤、预期行为、实际行为、运行环境

### 提出功能建议

1. 搜索 Issues 确认未被提出
2. 使用 Feature Request 模板
3. 描述使用场景、期望功能、备选方案

### 提交代码

1. **Fork 仓库** — 点击 GitHub Fork 按钮
2. **创建分支** — `git checkout -b feat/your-feature-name`
3. **编写代码** — 遵循项目代码风格
4. **添加测试** — 确保覆盖率不低于现有水平
5. **运行测试** — `pnpm test:all`
6. **提交 PR** — 填写 PR 模板，关联相关 Issue

## 开发环境搭建

```bash
# 前置条件：Node.js ≥ 18.17, pnpm ≥ 8.0, Docker
# 1. 克隆仓库
git clone git@github.com:nous-hermes/weiwuweixin.git
cd weiwuweixin

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example apps/api/.env
# 编辑 apps/api/.env 填入实际值

# 4. 启动基础设施
docker compose up -d

# 5. 初始化数据库
cd apps/api && npx prisma db push && cd ../..

# 6. 启动开发服务器
pnpm dev
```

## 代码风格

- **TypeScript strict mode** — 所有新代码需通过类型检查
- **ESLint + Prettier** — CI 自动检查格式
- **Pre-commit hooks** — Husky + lint-staged 自动格式化
- **命名规范** — 变量/函数用 camelCase，类型/接口用 PascalCase
- **文件组织** — 一个组件一个文件，测试文件与源文件同目录

## 测试规范

```bash
pnpm test:all          # 运行所有测试
pnpm --filter @weiwuweixin/scoring test:coverage  # 覆盖率报告
cd apps/web && pnpm test:e2e  # E2E 测试
```

- 单元测试：Vitest，文件命名 `*.test.ts`
- E2E 测试：Playwright，放在 `apps/web/tests/e2e/`
- PR 必须通过 CI 中的测试 + lint 检查

## Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 添加榜单分享卡导出功能
fix: 修复置信度计算结果为负数的问题
docs: 更新 API 文档中的认证说明
refactor: 重构评分算法输入验证逻辑
test: 添加反刷分检测边界条件测试
chore: 升级 Prisma 到 5.11
```

## 项目架构

```
weiwuweixin/
├─ apps/
│  ├─ api/     Fastify + Prisma + PostgreSQL + Redis
│  └─ web/     Next.js 14 + TypeScript + Tailwind CSS
├─ packages/
│  ├─ scoring/ 评分算法 + 置信度引擎 + 反刷分检测
│  ├─ ui/      设计系统组件库
│  └─ shared/  共享类型、常量、工具函数
└─ docs/       文档、审计报告
```

## 许可证

[MIT License](LICENSE)
