# 账号登录系统 Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 为围物为心(weiwuweixin)增加邮箱密码注册/登录系统，基于JWT双Token认证，支持匿名设备用户平滑升级为正式账号。

**Architecture:** 后端Fastify新增认证路由（register/login/refresh/logout/profile），复用已安装的@fastify/jwt；Prisma User模型扩展邮箱/密码字段；前端新增登录/注册页面，Zustand user-store升级管理auth状态；设备匿名用户通过"升级账号"流程自动继承历史数据。

**Tech Stack:** Fastify + @fastify/jwt + bcryptjs, Prisma (PostgreSQL), Next.js 14 App Router, next-intl, Zustand, React Query

---

## Phase 1: 数据库 & 后端基础设施

### Task 1: Prisma Schema — 扩展 User 模型

**Objective:** 在User模型增加email/passwordHash/emailVerifiedAt字段，支持账号认证

**Files:**
- Modify: `apps/api/prisma/schema.prisma` — User model

**Step 1: 修改 User 模型**

在 `apps/api/prisma/schema.prisma` 的 User 模型中添加字段：

```prisma
model User {
  id              String    @id @default(cuid())
  handle          String    @unique
  nickname        String
  avatarUrl       String?
  bio             String?
  deviceId        String?   @unique
  email           String?   @unique
  passwordHash    String?
  emailVerifiedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  authorScores    AuthorScore[]
  comments        Comment[]
  badges          Badge[]
  lists           List[]
  rapports        Rapport[]      @relation("UserRapports")
  rapportTargets  Rapport[]      @relation("TargetRapports")
  refreshToken    String?         // 存储最新refresh token hash
}
```

**Step 2: 生成迁移**

```bash
cd apps/api && npx prisma migrate dev --name add-auth-fields
```

**Step 3: 验证迁移**

```bash
cd apps/api && npx prisma studio  # 检查User表新字段
```

---

### Task 2: 安装 bcryptjs 并创建密码工具

**Objective:** 安装密码哈希库，创建密码哈希/比较工具

**Files:**
- Create: `apps/api/src/lib/password.ts`
- Modify: `apps/api/package.json`

**Step 1: 安装依赖**

```bash
cd apps/api && pnpm add bcryptjs && pnpm add -D @types/bcryptjs
```

**Step 2: 创建密码工具**

```typescript
// apps/api/src/lib/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

### Task 3: 创建 JWT 工具模块

**Objective:** 封装JWT Token生成/验证逻辑（Access Token + Refresh Token）

**Files:**
- Create: `apps/api/src/lib/auth.ts`

**Step 1: 创建 auth 工具**

```typescript
// apps/api/src/lib/auth.ts
import { FastifyInstance } from 'fastify';
import crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  handle: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

export function generateAccessToken(fastify: FastifyInstance, payload: TokenPayload): string {
  return fastify.jwt.sign(payload, { expiresIn: ACCESS_TOKEN_TTL });
}

export function generateRefreshToken(fastify: FastifyInstance, payload: TokenPayload): string {
  return fastify.jwt.sign(
    { ...payload, type: 'refresh', jti: crypto.randomUUID() },
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

export function generateAuthTokens(fastify: FastifyInstance, payload: TokenPayload): AuthTokens {
  return {
    accessToken: generateAccessToken(fastify, payload),
    refreshToken: generateRefreshToken(fastify, payload),
  };
}

export function verifyAccessToken(fastify: FastifyInstance, token: string): TokenPayload {
  const decoded = fastify.jwt.verify<TokenPayload & { type?: string }>(token);
  if (decoded.type && decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return { userId: decoded.userId, handle: decoded.handle };
}

export function verifyRefreshToken(fastify: FastifyInstance, token: string): TokenPayload & { jti: string } {
  const decoded = fastify.jwt.verify<TokenPayload & { type: string; jti: string }>(token);
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return { userId: decoded.userId, handle: decoded.handle, jti: decoded.jti };
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
```

---

### Task 4: 注册 Fastify JWT 插件

**Objective:** 在Fastify应用中注册@fastify/jwt插件（已安装但未启用）

**Files:**
- Modify: `apps/api/src/app.ts` — 注册JWT插件并添加认证装饰器

**Step 1: 注册 JWT 插件**

在 `apps/api/src/app.ts` 中，在现有插件注册之后添加：

```typescript
import jwt from '@fastify/jwt';

// 在其他插件注册后添加
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
});

// 添加认证装饰器
app.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' });
    }
    const token = authHeader.substring(7);
    const payload = verifyAccessToken(app, token);
    const user = await app.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }
    request.user = { userId: user.id, handle: user.handle, deviceId: user.deviceId };
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
});
```

**Step 2: 更新 TypeScript 类型声明**

在 `apps/api/src/types.ts` 或创建一个新的类型文件：

```typescript
// apps/api/src/types.ts (追加)
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user?: {
      userId: string;
      handle: string;
      deviceId?: string | null;
    };
  }
}
```

---

## Phase 2: 后端认证路由

### Task 5: 创建注册路由 POST /api/auth/register

**Objective:** 邮箱+密码注册，支持匿名设备升级

**Files:**
- Modify: `apps/api/src/routes/auth.ts` — 新建或追加路由

**Step 1: 创建 auth 路由文件**

```typescript
// apps/api/src/routes/auth.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { generateAuthTokens, hashRefreshToken } from '../lib/auth.js';

const registerSchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'handle'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      handle: { type: 'string', minLength: 2, maxLength: 32 },
      nickname: { type: 'string', maxLength: 32 },
      deviceId: { type: 'string' }, // 匿名升级时传入
    },
  },
};

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/register
  app.post('/api/auth/register', { schema: registerSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, handle, nickname, deviceId } = request.body as {
      email: string;
      password: string;
      handle: string;
      nickname?: string;
      deviceId?: string;
    };

    // 检查邮箱是否已注册
    const existingUser = await app.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    // 检查 handle 是否已占用
    const existingHandle = await app.prisma.user.findUnique({ where: { handle } });
    if (existingHandle) {
      return reply.status(409).send({ error: 'Handle already taken' });
    }

    // 密码哈希
    const passwordHash = await hashPassword(password);

    let user;

    if (deviceId) {
      // 匿名设备升级 — 继承已有匿名账号的数据
      const anonUser = await app.prisma.user.findUnique({ where: { deviceId } });
      if (anonUser) {
        user = await app.prisma.user.update({
          where: { id: anonUser.id },
          data: {
            email,
            passwordHash,
            handle,
            nickname: nickname || anonUser.nickname || handle,
            deviceId, // 保留 deviceId 以便兼容
          },
        });
      }
    }

    if (!user) {
      // 全新注册
      user = await app.prisma.user.create({
        data: {
          email,
          passwordHash,
          handle,
          nickname: nickname || handle,
        },
      });
    }

    // 生成 tokens
    const tokens = generateAuthTokens(app, { userId: user.id, handle: user.handle });
    const refreshHash = hashRefreshToken(tokens.refreshToken);

    // 存储 refresh token hash
    await app.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshHash },
    });

    return reply.status(201).send({
      user: { id: user.id, handle: user.handle, nickname: user.nickname, email: user.email, avatarUrl: user.avatarUrl },
      ...tokens,
    });
  });

  // POST /api/auth/login — 下一个 Task
  // POST /api/auth/refresh — 下下一个 Task
  // POST /api/auth/logout — 再下一个
}
```

**Step 2: 在 app.ts 中注册路由**

```typescript
// apps/api/src/app.ts 中追加
import { authRoutes } from './routes/auth.js';
// 在其他路由注册位置
app.register(authRoutes);
```

---

### Task 6: 创建登录路由 POST /api/auth/login

**Objective:** 邮箱+密码登录，返回JWT双Token

**Files:**
- Modify: `apps/api/src/routes/auth.ts` — 追加 login 路由

**Step 1: 在 authRoutes 中追加登录路由**

```typescript
// 追加到 authRoutes 函数中

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
};

app.post('/api/auth/login', { schema: loginSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as { email: string; password: string };

  // 查找用户
  const user = await app.prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  // 验证密码
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return reply.status(401).send({ error: 'Invalid email or password' });
  }

  // 生成 tokens
  const tokens = generateAuthTokens(app, { userId: user.id, handle: user.handle });
  const refreshHash = hashRefreshToken(tokens.refreshToken);

  await app.prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshHash },
  });

  return reply.status(200).send({
    user: { id: user.id, handle: user.handle, nickname: user.nickname, email: user.email, avatarUrl: user.avatarUrl },
    ...tokens,
  });
});
```

---

### Task 7: 创建 Token 刷新路由 POST /api/auth/refresh

**Objective:** Refresh Token 换取新的 Access Token

**Files:**
- Modify: `apps/api/src/routes/auth.ts` — 追加 refresh 路由

**Step 1: 追加 refresh 路由**

```typescript
// 追加到 authRoutes 函数中

const refreshSchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' },
    },
  },
};

app.post('/api/auth/refresh', { schema: refreshSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
  const { refreshToken } = request.body as { refreshToken: string };

  try {
    const payload = verifyRefreshToken(app, refreshToken);
    const refreshHash = hashRefreshToken(refreshToken);

    // 验证 refresh token 是否是最新签发的
    const user = await app.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== refreshHash) {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }

    // 签发新 token 对
    const tokens = generateAuthTokens(app, { userId: user.id, handle: user.handle });
    const newRefreshHash = hashRefreshToken(tokens.refreshToken);

    await app.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshHash },
    });

    return reply.send(tokens);
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid or expired refresh token' });
  }
});
```

---

### Task 8: 创建登出路由 POST /api/auth/logout

**Objective:** 登出时清除服务端 refresh token

**Files:**
- Modify: `apps/api/src/routes/auth.ts` — 追加 logout 路由

**Step 1: 追加 logout 路由**

```typescript
// 追加到 authRoutes 函数中
// 需要认证 —— 使用 app.authenticate preHandler

app.post('/api/auth/logout', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.userId;

  // 清除 refresh token
  await app.prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  return reply.send({ success: true });
});
```

---

### Task 9: 创建获取当前用户路由 GET /api/auth/me

**Objective:** 认证后获取当前用户完整信息

**Files:**
- Modify: `apps/api/src/routes/auth.ts` — 追加 me 路由

**Step 1: 追加 /me 路由**

```typescript
// 追加到 authRoutes 函数中

app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.userId;

  const user = await app.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      handle: true,
      nickname: true,
      email: true,
      avatarUrl: true,
      bio: true,
      deviceId: true,
      emailVerifiedAt: true,
      createdAt: true,
      _count: { select: { lists: true, authorScores: true } },
    },
  });

  if (!user) {
    return reply.status(404).send({ error: 'User not found' });
  }

  return reply.send({
    ...user,
    isAnonymous: !user.email,
  });
});
```

---

### Task 10: 升级设备认证中间件 — 支持 JWT 或设备ID双模式

**Objective:** 修改现有 device-auth 中间件，优先验证 JWT Bearer Token，降级到设备ID

**Files:**
- Modify: `apps/api/src/middleware/device-auth.ts`

**Step 1: 更新 device-auth.ts**

```typescript
// apps/api/src/middleware/device-auth.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../lib/auth.js';

export async function deviceAuthMiddleware(app: FastifyInstance) {
  app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // 只对写操作生效
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
      return;
    }

    // 路由白名单（认证路由本身不需要此中间件）
    const authWhitelist = ['/api/auth/register', '/api/auth/login', '/api/auth/refresh'];
    if (authWhitelist.some(path => request.url.startsWith(path))) {
      return;
    }

    // 优先检查 JWT Bearer Token
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = verifyAccessToken(app, authHeader.substring(7));
        const user = await app.prisma.user.findUnique({ where: { id: payload.userId } });
        if (user) {
          request.user = { userId: user.id, handle: user.handle, deviceId: user.deviceId };
          return;
        }
      } catch {
        // JWT 验证失败，降级到设备ID
      }
    }

    // 降级：设备ID认证（匿名用户）
    const deviceId = request.headers['x-device-id'] as string;
    if (!deviceId) {
      return reply.status(401).send({ error: 'Authentication required. Provide Bearer token or X-Device-Id header.' });
    }

    // Upsert 匿名用户（保持现有逻辑）
    const user = await app.prisma.user.upsert({
      where: { deviceId },
      update: {},
      create: {
        deviceId,
        handle: `anon-${deviceId.substring(0, 32)}`,
        nickname: `探索者${deviceId.substring(0, 4)}`,
      },
    });

    request.user = { userId: user.id, handle: user.handle, deviceId: user.deviceId };
  });
}
```

---

## Phase 3: 前端实现

### Task 11: i18n — 添加登录/注册翻译键

**Objective:** 在中英文语言文件中添加auth相关翻译

**Files:**
- Modify: `apps/web/src/i18n/messages/zh.json`
- Modify: `apps/web/src/i18n/messages/en.json`

**Step 1: 在 zh.json 中添加 auth 块**

```json
"auth": {
  "login": "登录",
  "register": "注册",
  "logout": "退出登录",
  "email": "邮箱",
  "password": "密码",
  "confirmPassword": "确认密码",
  "handle": "用户名",
  "nickname": "昵称",
  "forgotPassword": "忘记密码？",
  "noAccount": "还没有账号？",
  "hasAccount": "已有账号？",
  "goLogin": "去登录",
  "goRegister": "去注册",
  "loginSuccess": "登录成功！",
  "registerSuccess": "注册成功！",
  "logoutSuccess": "已退出登录",
  "emailRequired": "请输入邮箱",
  "emailInvalid": "邮箱格式不正确",
  "passwordRequired": "请输入密码",
  "passwordMin": "密码至少8个字符",
  "passwordMismatch": "两次密码不一致",
  "handleRequired": "请输入用户名",
  "handleMin": "用户名至少2个字符",
  "handleMax": "用户名最多32个字符",
  "emailTaken": "该邮箱已注册",
  "handleTaken": "该用户名已被占用",
  "invalidCredentials": "邮箱或密码错误",
  "upgradeTitle": "升级为正式账号",
  "upgradeDesc": "注册账号后，您的历史数据将自动保留",
  "welcomeBack": "欢迎回来",
  "createAccount": "创建账号",
  "orContinueAnonymous": "或继续匿名浏览"
}
```

**Step 2: 在 en.json 中添加 auth 块**

```json
"auth": {
  "login": "Login",
  "register": "Register",
  "logout": "Log Out",
  "email": "Email",
  "password": "Password",
  "confirmPassword": "Confirm Password",
  "handle": "Username",
  "nickname": "Nickname",
  "forgotPassword": "Forgot password?",
  "noAccount": "Don't have an account?",
  "hasAccount": "Already have an account?",
  "goLogin": "Log in",
  "goRegister": "Sign up",
  "loginSuccess": "Logged in successfully!",
  "registerSuccess": "Account created successfully!",
  "logoutSuccess": "Logged out",
  "emailRequired": "Email is required",
  "emailInvalid": "Invalid email format",
  "passwordRequired": "Password is required",
  "passwordMin": "Password must be at least 8 characters",
  "passwordMismatch": "Passwords do not match",
  "handleRequired": "Username is required",
  "handleMin": "Username must be at least 2 characters",
  "handleMax": "Username must be at most 32 characters",
  "emailTaken": "Email already registered",
  "handleTaken": "Username already taken",
  "invalidCredentials": "Invalid email or password",
  "upgradeTitle": "Upgrade to Full Account",
  "upgradeDesc": "Register to keep your data and unlock all features",
  "welcomeBack": "Welcome Back",
  "createAccount": "Create Account",
  "orContinueAnonymous": "Or continue browsing anonymously"
}
```

---

### Task 12: 创建 Auth UI 组件 — LoginForm & RegisterForm

**Objective:** 创建登录和注册表单组件

**Files:**
- Create: `apps/web/src/components/auth/login-form.tsx`
- Create: `apps/web/src/components/auth/register-form.tsx`

**Step 1: 创建 LoginForm 组件**

```tsx
// apps/web/src/components/auth/login-form.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card } from '@weiwuweixin/ui';
import { useAuthStore } from '@/stores/auth-store';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message === 'Invalid email or password' ? t('invalidCredentials') : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card interactive={false} size="md" className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('welcomeBack')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-primary"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition"
        >
          {loading ? '...' : t('login')}
        </button>
      </form>
    </Card>
  );
}
```

**Step 2: 创建 RegisterForm 组件**

类似结构，增加 confirmPassword 和 handle 字段，调用 `useAuthStore.register()`。

---

### Task 13: 创建 Auth Store (Zustand)

**Objective:** 创建认证状态管理 store，管理JWT token和用户信息

**Files:**
- Create: `apps/web/src/stores/auth-store.ts`

**Step 1: 创建 auth-store.ts**

```typescript
// apps/web/src/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';

interface AuthUser {
  id: string;
  handle: string;
  nickname: string;
  email?: string | null;
  avatarUrl?: string | null;
  isAnonymous: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { email: string; password: string; handle: string; nickname?: string }) => Promise<AuthUser>;
  loginAnonymously: (deviceId: string) => Promise<AuthUser>;
  refreshTokens: () => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<AuthUser>;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await apiClient.post('/api/auth/login', { email, password });
        const { user, accessToken, refreshToken } = res.data;
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        return user;
      },

      register: async (data) => {
        const deviceId = localStorage.getItem('wwx-device-id');
        const res = await apiClient.post('/api/auth/register', { ...data, deviceId });
        const { user, accessToken, refreshToken } = res.data;
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        return user;
      },

      loginAnonymously: async (deviceId) => {
        // 匿名设备认证 —— 已有逻辑，不需要JWT token
        set({ isAuthenticated: false, accessToken: null, refreshToken: null });
        return null!;
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;
        const res = await apiClient.post('/api/auth/refresh', { refreshToken });
        set({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
      },

      logout: async () => {
        try {
          const { accessToken } = get();
          if (accessToken) {
            await apiClient.post('/api/auth/logout', null, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
          }
        } catch {
          // 忽略登出请求错误
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) throw new Error('Not authenticated');
        const res = await apiClient.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const user = res.data;
        set({ user });
        return user;
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'wwx-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

### Task 14: 更新 API Client — 自动注入 JWT Token

**Objective:** 修改 api-client，在有 JWT token 时自动注入 Authorization header

**Files:**
- Modify: `apps/web/src/lib/api-client.ts`

**Step 1: 给 api-client 添加请求拦截器**

在 `apps/web/src/lib/api-client.ts` 中添加请求拦截器，自动从 auth-store 读取 token：

```typescript
// 在 api-client 实例上添加请求拦截器
apiClient.interceptors.request.use((config) => {
  // 如果已有 Authorization header，跳过
  if (config.headers?.Authorization) return config;

  // 从 localStorage 读取 auth token（Zustand persist 存储位置）
  try {
    const stored = localStorage.getItem('wwx-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.accessToken) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${state.accessToken}`;
      }
    }
  } catch {
    // ignore
  }

  return config;
});

// 添加响应拦截器 —— 401 时自动刷新 token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const stored = localStorage.getItem('wwx-auth');
        if (stored) {
          const { state } = JSON.parse(stored);
          if (state?.refreshToken) {
            const res = await apiClient.post('/api/auth/refresh', {
              refreshToken: state.refreshToken,
            });
            const { accessToken, refreshToken } = res.data;
            // 更新 localStorage
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            localStorage.setItem('wwx-auth', JSON.stringify({ state }));
            // 重试原请求
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch {
        // refresh 也失败了 —— 清除 auth 状态
        localStorage.removeItem('wwx-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

### Task 15: 创建登录/注册页面路由

**Objective:** 在 Next.js App Router 中创建 /login 和 /register 页面

**Files:**
- Create: `apps/web/src/app/[locale]/login/page.tsx`
- Create: `apps/web/src/app/[locale]/register/page.tsx`

**Step 1: 创建 login 页面**

```tsx
// apps/web/src/app/[locale]/login/page.tsx
import { LoginForm } from '@/components/auth/login-form';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth');
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-primary hover:underline">
            {t('goRegister')}
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 2: 创建 register 页面**

```tsx
// apps/web/src/app/[locale]/register/page.tsx
import { RegisterForm } from '@/components/auth/register-form';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('auth');
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-primary hover:underline">
            {t('goLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

### Task 16: 添加导航栏登录/用户入口

**Objective:** 在页面导航栏添加用户头像/登录按钮

**Files:**
- Modify: `apps/web/src/app/[locale]/layout.tsx` 或导航组件

**Step 1: 找到导航栏组件，添加Auth入口**

在导航栏右侧添加：
- 未登录：显示"登录"按钮
- 已登录：显示用户头像 + 下拉菜单（个人主页/设置/退出）
- 匿名用户：显示"升级账号"按钮

---

### Task 17: 添加 AuthProvider 和路由守卫

**Objective:** 创建 AuthProvider 组件，在应用启动时恢复认证状态

**Files:**
- Create: `apps/web/src/components/auth/auth-provider.tsx`
- Modify: `apps/web/src/app/[locale]/layout.tsx` — 包裹 AuthProvider

**Step 1: 创建 AuthProvider**

```tsx
// apps/web/src/components/auth/auth-provider.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken, fetchMe } = useAuthStore();

  useEffect(() => {
    // 应用启动时，如果有 token，验证并恢复用户信息
    if (accessToken && isAuthenticated) {
      fetchMe().catch(() => {
        // token 过期，清除状态
        useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      });
    }
  }, []); // 只在挂载时执行一次

  return <>{children}</>;
}
```

**Step 2: 在 layout.tsx 中包裹 AuthProvider**

---

## Phase 4: 集成 & 权限增强

### Task 18: 更新 Settings 页面 — 支持账号信息展示

**Objective:** Settings 页面根据认证状态展示不同内容

**Files:**
- Modify: `apps/web/src/app/[locale]/settings/page.tsx`

**Step 1: 添加认证信息区块**

如果用户已登录：显示邮箱、注册时间、退出按钮
如果匿名用户：显示"升级为正式账号"引导卡片

---

### Task 19: 增强后端写操作权限校验

**Objective:** List 和 Comment 的写操作验证请求者是否为资源作者

**Files:**
- Modify: `apps/api/src/routes/lists.ts` — PATCH/DELETE 增加作者校验
- Modify: `apps/api/src/routes/comments.ts` — DELETE 增加作者校验

**Step 1: 修改 PATCH /api/lists/:id**

```typescript
// 在路由 handler 中
const list = await app.prisma.list.findUnique({ where: { id } });
if (!list) return reply.status(404).send({ error: 'List not found' });
if (list.authorId !== request.user.userId) {
  return reply.status(403).send({ error: 'Not authorized to edit this list' });
}
```

---

### Task 20: 编写集成测试

**Objective:** 验证注册/登录/刷新/登出完整流程

**Files:**
- Create: `apps/api/src/routes/__tests__/auth.test.ts`

**Step 1: 测试用例**

```typescript
describe('Auth Routes', () => {
  test('POST /api/auth/register — 成功注册', async () => { ... });
  test('POST /api/auth/register — 邮箱重复', async () => { ... });
  test('POST /api/auth/register — 匿名升级', async () => { ... });
  test('POST /api/auth/login — 成功登录', async () => { ... });
  test('POST /api/auth/login — 错误密码', async () => { ... });
  test('POST /api/auth/refresh — 刷新token', async () => { ... });
  test('POST /api/auth/logout — 登出', async () => { ... });
  test('GET /api/auth/me — 获取用户信息', async () => { ... });
  test('设备ID认证——匿名用户可写操作', async () => { ... });
  test('JWT认证——已登录用户可写操作', async () => { ... });
});
```

---

## 执行顺序总览

| # | Task | 估计时间 |
|---|------|----------|
| 1 | Prisma Schema 扩展 | 5min |
| 2 | 密码工具 | 3min |
| 3 | JWT 工具模块 | 5min |
| 4 | 注册 JWT 插件 | 5min |
| 5 | 注册路由 | 8min |
| 6 | 登录路由 | 5min |
| 7 | Token 刷新路由 | 5min |
| 8 | 登出路由 | 3min |
| 9 | 获取当前用户路由 | 3min |
| 10 | 升级认证中间件 | 8min |
| 11 | i18n 翻译 | 5min |
| 12 | Auth UI 组件 | 10min |
| 13 | Auth Store | 8min |
| 14 | API Client 升级 | 8min |
| 15 | 登录/注册页面 | 5min |
| 16 | 导航栏入口 | 8min |
| 17 | AuthProvider | 5min |
| 18 | Settings 页面 | 5min |
| 19 | 权限校验增强 | 8min |
| 20 | 集成测试 | 15min |

**总计：约 2-3 小时**

---

## 关键设计决策

1. **双认证模式** — JWT Bearer Token 优先，自动降级到设备ID匿名认证，保证现有匿名用户不受影响
2. **Refresh Token 轮转** — 每次刷新后旧 RT 失效，存储最新 RT 的 SHA256 哈希，防止重放攻击
3. **匿名升级** — 注册时传入 deviceId，自动继承匿名账号的所有数据（榜单、评分、评论）
4. **渐进式实施** — 不破坏现有功能，设备ID认证仍然可用，JWT 是可选增强