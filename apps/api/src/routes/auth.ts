/**
 * 围物为心 — 认证路由
 *
 * 🔒 安全加固 v2 (2026-05-03)
 *   H1: 登录/注册 IP 限速 5/min
 *   H2: 密码复杂度强制 (≥8字符, 大小写+数字)
 *   H3: 账户锁定 (5次失败 → 15分钟)
 *   H4: Refresh Token SHA-256哈希存储 + 重用检测 + 30天绝对时限
 *   H7: JWT 载荷含 tokenVersion (密码变更即失效)
 *
 * POST /auth/register — 注册
 * POST /auth/login    — 登录
 * POST /auth/refresh   — 刷新 token
 * POST /auth/logout    — 注销
 * GET  /auth/me        — 当前用户
 */

import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { randomUUID, createHash } from 'crypto';

// ═══════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_DAYS = 7;
const SESSION_MAX_DAYS = 30;              // H4: 绝对会话时限
const FAILED_LOGIN_LIMIT = 5;             // H3: 最大失败次数
const LOCK_DURATION_MINUTES = 15;         // H3: 锁定时长
const LOGIN_RATE_LIMIT = 5;               // H1: 登录/注册每分钟上限
const LOGIN_RATE_WINDOW_MS = 60_000;     // H1: 限速窗口

// ═══════════════════════════════════════════════════
// H1: IP 限速器（内存）
// ═══════════════════════════════════════════════════
interface RateEntry {
  count: number;
  resetAt: number;
}
const ipRateMap = new Map<string, RateEntry>();
const RATE_MAP_CLEAN_INTERVAL = 5 * 60_000;

// 定期清理过期条目
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of ipRateMap) {
      if (now > entry.resetAt) ipRateMap.delete(key);
    }
  }, RATE_MAP_CLEAN_INTERVAL).unref?.();
}

/** 获取请求 IP */
function getClientIP(req: any): string {
  return req.ip ?? req.socket?.remoteAddress ?? '127.0.0.1';
}

/** H1: 检查 IP 是否超限 */
function checkIpRate(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + LOGIN_RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= LOGIN_RATE_LIMIT) return false;

  entry.count++;
  return true;
}

// ═══════════════════════════════════════════════════
// H4: Token 哈希工具
// ═══════════════════════════════════════════════════

/** SHA-256 哈希 token（H4: 数据库只存哈希值） */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// ═══════════════════════════════════════════════════
// H2: 密码复杂度验证
// ═══════════════════════════════════════════════════

/** 🔒 H2: 密码复杂度要求 */
function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return '密码长度至少为 8 个字符';
  }
  if (!/[a-z]/.test(password)) {
    return '密码必须包含至少一个小写字母';
  }
  if (!/[A-Z]/.test(password)) {
    return '密码必须包含至少一个大写字母';
  }
  if (!/[0-9]/.test(password)) {
    return '密码必须包含至少一个数字';
  }
  // 禁止过于常见的弱密码
  const commonPasswords = [
    'password', '12345678', '123456789', 'qwerty123', 'admin123',
    'Password1', 'P@ssw0rd', 'Aa123456', 'Admin1234',
  ];
  if (commonPasswords.includes(password)) {
    return '该密码过于常见，请使用更复杂的密码';
  }
  return null; // 通过
}

// ═══════════════════════════════════════════════════
// 路由
// ═══════════════════════════════════════════════════

export const authRoutes: FastifyPluginAsync = async (app) => {
  // ── POST /auth/register — 注册 🔒 H1/H2 ──────────
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
          password: { type: 'string', minLength: 8, maxLength: 128 },   // 🔒 H2: ≥8
          nickname: { type: 'string', minLength: 1, maxLength: 30 },
          handle: { type: 'string', minLength: 3, maxLength: 30 },
          deviceId: { type: 'string', minLength: 1, maxLength: 64 },
        },
      },
    },
  }, async (req, reply) => {
    // 🔒 H1: IP 限速
    const ip = getClientIP(req);
    if (!checkIpRate(ip)) {
      return reply.code(429).send({ error: '请求过于频繁，请稍后再试' });
    }

    const { email, password, nickname: rawNickname, displayName, handle, deviceId } = req.body;
    const nickname = rawNickname || displayName;

    // 🔒 H2: 密码复杂度
    const pwError = validatePasswordStrength(password);
    if (pwError) {
      return reply.code(400).send({ error: pwError });
    }

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

    // 🔒 H7: JWT 载荷含 tokenVersion
    const userRecord = await app.prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true, role: true },
    });

    const jti = randomUUID();
    const accessToken = app.jwt.sign(
      {
        sub: userId,
        handle: finalHandle,
        role: userRecord?.role ?? 'USER',
        tv: userRecord?.tokenVersion ?? 0,    // 🔒 H7
        jti,
      },
      { expiresIn: ACCESS_TOKEN_TTL, jti },
    );

    // 🔒 H4: 哈希存储 refresh token
    const refreshTokenValue = randomUUID();
    const tokenHash = hashToken(refreshTokenValue);
    const familyId = randomUUID();

    await app.prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId,
        familyId,                             // 🔒 H4: 家族ID
        deviceInfo: req.headers['user-agent'] ?? undefined,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return reply.code(201).send({
      user: { id: userId, handle: finalHandle, email, nickname: nickname ?? finalHandle, isAuthenticated: true },
      accessToken,
      refreshToken: refreshTokenValue,        // 只返回原始 token（客户端持有）
    });
  });

  // ── POST /auth/login — 登录 🔒 H1/H3 ─────────────
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
    // 🔒 H1: IP 限速
    const ip = getClientIP(req);
    if (!checkIpRate(ip)) {
      return reply.code(429).send({ error: '请求过于频繁，请稍后再试' });
    }

    const { email, password, deviceId } = req.body;

    const account = await app.prisma.account.findUnique({
      where: { email },
      include: { user: true },
    });

    if (!account) {
      return reply.code(401).send({ error: '邮箱或密码错误' });
    }

    // 🔒 H3: 检查账户是否被锁定
    if (account.lockedUntil && account.lockedUntil > new Date()) {
      const remainingMs = account.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60_000);
      return reply.code(423).send({
        error: `账户已被临时锁定，请在 ${remainingMin} 分钟后重试`,
      });
    }

    const valid = await bcrypt.compare(password, account.passwordHash);

    if (!valid) {
      // 🔒 H3: 增加失败计数
      const newAttempts = (account.failedLoginAttempts ?? 0) + 1;
      const updates: Record<string, unknown> = { failedLoginAttempts: newAttempts };

      if (newAttempts >= FAILED_LOGIN_LIMIT) {
        updates.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60_000);
        updates.failedLoginAttempts = 0;  // 锁定后重置计数
      }

      await app.prisma.account.update({
        where: { id: account.id },
        data: updates,
      });

      return reply.code(401).send({ error: '邮箱或密码错误' });
    }

    // 登录成功 → 清除失败计数 + 解锁
    if (account.failedLoginAttempts > 0 || account.lockedUntil) {
      await app.prisma.account.update({
        where: { id: account.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    // 生成 tokens
    const jti = randomUUID();
    const accessToken = app.jwt.sign(
      {
        sub: account.userId,
        handle: account.user.handle,
        role: account.user.role ?? 'USER',
        tv: account.user.tokenVersion ?? 0,   // 🔒 H7
        jti,
      },
      { expiresIn: ACCESS_TOKEN_TTL, jti },
    );

    // 🔒 H4: 哈希存储 refresh token
    const refreshTokenValue = randomUUID();
    const tokenHash = hashToken(refreshTokenValue);
    const familyId = randomUUID();

    await app.prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId: account.userId,
        accountId: account.id,
        familyId,
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

  // ── POST /auth/refresh — 刷新 token 🔒 H4 ────────
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

    // 🔒 H4: 用哈希值查找
    const tokenHash = hashToken(refreshToken);
    const stored = await app.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: { select: { id: true, handle: true, role: true, tokenVersion: true } } },
    });

    if (!stored) {
      return reply.code(401).send({ error: '无效的刷新令牌' });
    }

    // ── H4: 重用检测 ────────────────────────────────
    if (stored.revokedAt) {
      // 🔴 已吊销 token 被再次使用 = 可疑！撤销整个家族
      if (stored.familyId) {
        await app.prisma.refreshToken.updateMany({
          where: { familyId: stored.familyId, revokedAt: null },
          data: { revokedAt: new Date(), reusedAt: new Date() },
        });
      }
      return reply.code(401).send({ error: '刷新令牌已被使用，请重新登录' });
    }

    if (stored.expiresAt < new Date()) {
      return reply.code(401).send({ error: '刷新令牌已过期，请重新登录' });
    }

    // ── H4: 绝对会话时限（30天）────────────────────
    if (stored.createdAt) {
      const sessionAge = Date.now() - stored.createdAt.getTime();
      if (sessionAge > SESSION_MAX_DAYS * 24 * 60 * 60 * 1000) {
        // 撤销整个家族
        if (stored.familyId) {
          await app.prisma.refreshToken.updateMany({
            where: { familyId: stored.familyId, revokedAt: null },
            data: { revokedAt: new Date() },
          });
        }
        return reply.code(401).send({ error: '会话已过期（超过30天），请重新登录' });
      }
    }

    // ── 吊销旧 token ──────────────────────────────
    await app.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    // ── 签发新 token（同一家族）────────────────────
    const jti = randomUUID();
    const accessToken = app.jwt.sign(
      {
        sub: stored.userId,
        handle: stored.user.handle,
        role: stored.user.role ?? 'USER',
        tv: stored.user.tokenVersion ?? 0,      // 🔒 H7
        jti,
      },
      { expiresIn: ACCESS_TOKEN_TTL, jti },
    );

    const newRefreshTokenValue = randomUUID();
    const newTokenHash = hashToken(newRefreshTokenValue);

    await app.prisma.refreshToken.create({
      data: {
        token: newTokenHash,
        userId: stored.userId,
        familyId: stored.familyId,              // 🔒 H4: 保持家族
        deviceInfo: req.headers['user-agent'] ?? undefined,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
    };
  });

  // ── POST /auth/logout — 注销 🔒 H4 ───────────────
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
      // 🔒 H4: 用哈希值查找并吊销
      const tokenHash = hashToken(refreshToken);
      await app.prisma.refreshToken.updateMany({
        where: { token: tokenHash },
        data: { revokedAt: new Date() },
      });
    }

    return { message: '已注销' };
  });

  // ── GET /auth/me — 获取当前用户 ─────────────────
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
        role: true,
        tokenVersion: true,
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
