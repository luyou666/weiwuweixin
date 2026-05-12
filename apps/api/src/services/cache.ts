/**
 * 围物为心 — 内存缓存层
 *
 * 进程内 Map + TTL 缓存，提供 get/set/del/withCache 方法。
 * 无外部依赖，纯内存实现。
 */

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

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const MAX_KEYS = 10000;

/**
 * 将 glob 模式转为 RegExp。
 * 支持 * (匹配任意非:字符) 和 ** (匹配任意字符)。
 */
function globToRegex(glob: string): RegExp {
  // Escape special regex chars except * and ?
  let pattern = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  // ** matches everything
  pattern = pattern.replace(/\*\*/g, '<<<DOUBLE_STAR>>>');
  // * matches anything except :
  pattern = pattern.replace(/\*/g, '[^:]*');
  pattern = pattern.replace(/<<<DOUBLE_STAR>>>/g, '.*');
  return new RegExp(`^${pattern}$`);
}

export class CacheService {
  private store: Map<string, CacheEntry> = new Map();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // 每 60 秒清理过期条目
    this.cleanupTimer = setInterval(() => this.evictExpired(), 60_000);
    // Node.js: 让 timer 不阻止进程退出
    try {
      (this.cleanupTimer as unknown as { unref(): void }).unref();
    } catch { /* 非 Node 环境忽略 */ }
  }

  /** 清理过期条目 */
  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }

  /** 淘汰最旧的 20% key */
  private evictOldest(): void {
    if (this.store.size <= MAX_KEYS) return;
    const toRemove = Math.ceil(this.store.size * 0.2);
    // 按 expiresAt 排序，淘汰最旧的
    const entries = [...this.store.entries()]
      .sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.store.delete(entries[i][0]);
    }
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as string;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.store.size >= MAX_KEYS) {
      this.evictOldest();
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = globToRegex(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
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

    // 2. 缓存未命中 — 直接查
    const fresh = await fetcher();

    // 3. 尝试写入缓存（best-effort）
    await this.setJSON(key, fresh, ttl);

    return fresh;
  }

  // ── 关闭连接 ────────────────────────────────────────

  disconnect(): void {
    this.store.clear();
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// ── 单例导出 ─────────────────────────────────────────────

export const cache = new CacheService();
