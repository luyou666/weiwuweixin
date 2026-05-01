/**
 * 围物为心 — Redis 缓存层
 *
 * 封装 ioredis，提供 get/set/del/withCache 方法。
 * Redis 不可用时优雅降级至直接查 DB。
 */

import Redis from 'ioredis';
import { setTimeout as sleep } from 'timers/promises';

// ── 缓存 TTL 常量 ──────────────────────────────────────

export const CACHE_TTL = {
  /** 置信度缓存 5 分钟 */
  CONFIDENCE: 5 * 60,
  /** 用户 profile 缓存 10 分钟 */
  PROFILE: 10 * 60,
  /** 榜单列表缓存 2 分钟 */
  LIST: 2 * 60,
  /** 发现页缓存 5 分钟 */
  EXPLORE: 5 * 60,
  /** 评分汇总缓存 3 分钟 */
  SCORE_STATS: 3 * 60,
  /** 榜单详情缓存 2 分钟 */
  LIST_DETAIL: 2 * 60,
} as const;

// ── 缓存 Key 生成器 ────────────────────────────────────

export const CacheKeys = {
  confidence: (listId: string) => `confidence:${listId}`,
  listDetail: (listId: string) => `list:detail:${listId}`,
  profile: (handle: string) => `profile:${handle}`,
  userList: (userId: string, page: number) => `user:${userId}:lists:${page}`,
  explore: () => 'explore:home',
  scoreStats: (listId: string) => `score:stats:${listId}`,
} as const;

// ── CacheService 类 ─────────────────────────────────────

export class CacheService {
  private redis: Redis | null;
  private healthy = true;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;

  constructor(redisUrl?: string) {
    const url = redisUrl ?? process.env.REDIS_URL ?? 'redis://localhost:6379';

    // REDIS_URL 为空字符串 或 DISABLE_REDIS=1 时跳过 Redis 初始化
    if (!url || process.env.DISABLE_REDIS === '1') {
      this.redis = null;
      this.healthy = false;
      return;
    }

    try {
      this.redis = new Redis(url, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        retryStrategy: (times: number) => {
          if (times > this.maxReconnectAttempts) {
            this.healthy = false;
            return null; // stop retrying
          }
          this.reconnectAttempts = times;
          return Math.min(times * 200, 5000);
        },
      });

      this.redis.on('error', (err) => {
        if (this.healthy) {
          console.warn('[Cache] Redis error, degrading to pass-through:', err.message);
        }
        this.healthy = false;
      });

      this.redis.on('connect', () => {
        console.log('[Cache] Redis connected');
        this.healthy = true;
      });

      // 延迟连接，不阻塞启动
      this.redis.connect().catch((err) => {
        if (this.healthy) {
          console.warn('[Cache] Redis connection failed, using pass-through mode');
        }
        this.healthy = false;
      });
    } catch {
      this.redis = null;
      this.healthy = false;
    }
  }

  // ── 基础操作 ────────────────────────────────────────

  private async ensureConnected(): Promise<boolean> {
    if (!this.redis || !this.healthy) return false;
    try {
      await this.redis.ping().catch(() => {
        this.healthy = false;
        return null;
      });
      return this.healthy;
    } catch {
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!await this.ensureConnected()) return null;
    return this.redis!.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (!await this.ensureConnected()) return;
    await this.redis!.setex(key, ttlSeconds, value);
  }

  async del(key: string): Promise<void> {
    if (!await this.ensureConnected()) return;
    await this.redis!.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (!await this.ensureConnected()) return;
    const keys = await this.redis!.keys(pattern);
    if (keys.length > 0) {
      await this.redis!.del(...keys);
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJSON<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  /**
   * @param key    缓存 key
   * @param fetcher 数据获取函数
   * @param ttl    过期时间（秒）
   * @returns 缓存或新鲜数据
   */
  async withCache<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
    // 1. 尝试从缓存取
    const cached = await this.getJSON<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 2. 缓存未命中或 Redis 不可用 — 直接查
    const fresh = await fetcher();

    // 3. 尝试写入缓存（best-effort）
    await this.setJSON(key, fresh, ttl);

    return fresh;
  }

  // ── 关闭连接 ────────────────────────────────────────

  disconnect(): void {
    if (this.redis) {
      this.redis.disconnect();
    }
  }
}

// ── 单例导出 ─────────────────────────────────────────────

export const cache = new CacheService();