/**
 * 围物为心 — 认证路由
 *
 * POST   /auth/register    — 注册（匿名升级为正式账号）
 * POST   /auth/login       — 登录（返回 access + refresh token）
 * POST   /auth/refresh      — 刷新 access token
 * POST   /auth/logout       — 注销当前 refresh token
 * GET    /auth/me           — 获取当前用户信息
 */

import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_DAYS = 7;

export const authRoutes: FastifyPluginAsync = async (app) => {
  // ── POST /auth/register — 注册 ──────────────────────
  app.post<{
    Body: {
      email: string;
      password: string;
      nickname?: string;
      displayName?: string;
      handle?: string;
      deviceId?: string;
    };
  }>('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', minLength: 3, maxLength: 255 },
          password: { type: 'string', minLength: 6, maxLength: 128 },
          nickname: { type: 'string', minLength: 1, maxLength: 30 },
          handle: { type: 'string', minLength: 3, maxLength: 30 },
          deviceId: { type: 'string', minLength: 1, maxLength: 64 },
        },
      },
    },
  }, async (req, reply) => {
    const { email, password, nickname: rawNickname, displayName, handle, deviceId } = req.body;
    // displayName 是 nickname 的别名（兼容不同前端/API 客户端）
    const nickname = rawNickname || displayName;

    // 检查邮箱是否已注册
    const existing = await app.prisma.account.findUnique({
      where: { email },
    });
    if (existing) {
      return reply.code(409).send({ error: '该邮箱已注册' });
    }

    // 检查 handle 是否已占用
    const desiredHandle = handle ?? email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
    const handleExists = await app.prisma.user.findUnique({
      where: { handle: desiredHandle },
    });
    const finalHandle = handleExists
      ? `${desiredHandle}-${Date.now().toString(36)}`
      : desiredHandle;

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let userId: string;

    // 如果有 deviceId，升级匿名用户为正式用户
    if (deviceId) {
      const anonUser = await app.prisma.user.findUnique({
        where: { deviceId },
      });

      if (anonUser) {
        // 升级匿名用户
        await app.prisma.user.update({
          where: { id: anonUser.id },
          data: {
            handle: anonUser.handle.startsWith('anon-') ? finalHandle : anonUser.handle,
            nickname: nickname ?? anonUser.nickname,
            email,
          },
        });

        await app.prisma.account.create({
          data: {
            email,
            passwordHash,
            userId: anonUser.id,
          },
        });

        userId = anonUser.id;
      } else {
        // deviceId 不存在，创建新用户
        const user = await app.prisma.user.create({
          data: {
            handle: finalHandle,
            nickname: nickname ?? finalHandle,
            email,
            deviceId,
          },
        });

        await app.prisma.account.create({
          data: {
            email,
            passwordHash,
            userId: user.id,
          },
        });

        userId = user.id;
      }
    } else {
      // 全新注册（无 deviceId）
      const user = await app.prisma.user.create({
        data: {
          handle: finalHandle,
          nickname: nickname ?? finalHandle,
          email,
        },
      });

      await app.prisma.account.create({
        data: {
          email,
          passwordHash,
          userId: user.id,
        },
      });

      userId = user.id;
    }

    // 生成 tokens
    const accessToken = app.jwt.sign(
      { sub: userId, handle: finalHandle },
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshTokenValue = randomUUID();
    const refreshToken = await app.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        deviceInfo: req.headers['user-agent'] ?? undefined,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return reply.code(201).send({
      user: { id: userId, handle: finalHandle, email, nickname: nickname ?? finalHandle, isAuthenticated: true },
      accessToken,
      refreshToken: refreshTokenValue,
    });
  });

  // ── POST /auth/login — 登录 ──────────────────────────
  app.post<{
    Body: { email: string; password: string; deviceId?: string };
  }>('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          deviceId: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { email, password, deviceId } = req.body;

    const account = await app.prisma.account.findUnique({
      where: { email },
      include: { user: true },
    });

    if (!account) {
      return reply.code(401).send({ error: '邮箱或密码错误' });
    }

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      return reply.code(401).send({ error: '邮箱或密码错误' });
    }

    // 如果用户提供了 deviceId，关联匿名数据
    if (deviceId) {
      const anonUser = await app.prisma.user.findUnique({
        where: { deviceId },
      });
      if (anonUser && anonUser.id !== account.userId) {
        // 将匿名用户的数据迁移到正式用户（简单方案：合并）
        // 实际可做更复杂的合并逻辑
      }
    }

    // 生成 tokens
    const accessToken = app.jwt.sign(
      { sub: account.userId, handle: account.user.handle },
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshTokenValue = randomUUID();
    await app.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: account.userId,
        accountId: account.id,
        deviceInfo: req.headers['user-agent'] ?? undefined,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: account.userId,
        handle: account.user.handle,
        email: account.email,
        nickname: account.user.nickname,
        avatarUrl: account.user.avatarUrl,
        isAuthenticated: true,
      },
      accessToken,
      refreshToken: refreshTokenValue,
    };
  });

  // ── POST /auth/refresh — 刷新 token ──────────────────
  app.post<{
    Body: { refreshToken: string };
  }>('/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { refreshToken } = req.body;

    const stored = await app.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return reply.code(401).send({ error: '无效或过期的刷新令牌' });
    }

    // 吊销旧 refresh token（旋转）
    await app.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    // 生成新 tokens
    const accessToken = app.jwt.sign(
      { sub: stored.userId, handle: stored.user.handle },
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const newRefreshTokenValue = randomUUID();
    await app.prisma.refreshToken.create({
      data: {
        token: newRefreshTokenValue,
        userId: stored.userId,
        deviceInfo: req.headers['user-agent'] ?? undefined,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
    };
  });

  // ── POST /auth/logout — 注销 ─────────────────────────
  app.post<{
    Body: { refreshToken?: string };
  }>('/logout', {
    schema: {
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await app.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }

    return { message: '已注销' };
  });

  // ── GET /auth/me — 获取当前用户 ─────────────────────
  app.get('/me', {
    preHandler: [app.authenticate],
  }, async (req, reply) => {
    if (!req.authUser) {
      return reply.code(401).send({ error: '未认证' });
    }

    const user = await req.server.prisma.user.findUnique({
      where: { id: req.authUser.id },
      select: {
        id: true,
        handle: true,
        nickname: true,
        avatarUrl: true,
        bio: true,
        email: true,
        account: { select: { emailVerified: true } },
      },
    });

    if (!user) {
      return reply.code(404).send({ error: '用户不存在' });
    }

    return {
      ...user,
      isAuthenticated: req.authUser.isAuthenticated,
    };
  });
};