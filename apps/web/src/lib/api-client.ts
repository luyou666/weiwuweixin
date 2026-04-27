/**
 * api-client.ts – 前端 HTTP 客户端
 *
 * 统一封装 fetch，支持：
 * 1. JWT Bearer 认证（优先）
 * 2. 设备 ID 匿名认证（降级）
 * 3. 自动刷新 Token（401 时自动刷新 accessToken）
 * 4. 请求/响应拦截
 */

import { useAuthStore } from '@/stores/auth-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// 刷新锁 — 防止并发刷新
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 错误类型
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public details: string = '',
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

/* ============================================================
   辅助函数
   ============================================================ */

function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let did = localStorage.getItem('wwx-device-id');
  if (!did) {
    did = crypto.randomUUID();
    localStorage.setItem('wwx-device-id', did);
  }
  return did;
}

/**
 * 核心请求方法 — 带 token 刷新队列
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken, refreshToken, logout } = useAuthStore.getState();
  const deviceId = getDeviceId();
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET');

  // 构建 headers
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Request-Id', crypto.randomUUID());

  // JWT 认证（优先）
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  } else if (isWrite) {
    // 降级到 device-id（仅 write 操作）
    headers.set('X-Device-Id', deviceId);
  }

  // credentials: include 用于携带 cookies
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  const res = await fetch(`${API_BASE}${url}`, fetchOptions);

  // 处理 401 — 自动刷新 token
  if (res.status === 401) {
    if (refreshToken) {
      // 排队等待刷新
      const retryPromise = new Promise<Response>((resolve, reject) => {
        refreshSubscribers.push((newToken) => {
          // 用新 token 重试原请求
          headers.set('Authorization', `Bearer ${newToken}`);
          fetch(`${API_BASE}${url}`, { ...fetchOptions, headers })
            .then(resolve)
            .catch(reject);
        });
        // 触发刷新
        triggerRefresh().catch(reject);
      });
      return retryPromise;
    } else {
      // 没有 refreshToken，直接登出
      logout();
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.statusCode || res.status,
      body.error || 'Request failed',
      body.message || '',
    );
  }

  return res;
}

async function triggerRefresh() {
  if (isRefreshing) return;
  isRefreshing = true;

  try {
    const token = useAuthStore.getState().refreshToken;
    if (!token) throw new Error('No refresh token');

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();

    useAuthStore.getState().setAccessToken(data.accessToken);
    // 通知等待的订阅者
    refreshSubscribers.forEach((cb) => cb(data.accessToken));
    refreshSubscribers = [];
  } catch (err) {
    // 刷新失败 — 清除所有状态
    useAuthStore.getState().logout();
    refreshSubscribers.forEach(() => {});
    refreshSubscribers = [];
    throw err;
  } finally {
    isRefreshing = false;
  }
}

/* ============================================================
   便捷 API 方法
   ============================================================ */

export async function get(url: string) {
  return fetchWithAuth(url, { method: 'GET' });
}

export async function post(url: string, body?: unknown) {
  return fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) });
}

export async function patch(url: string, body?: unknown) {
  return fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function del(url: string) {
  return fetchWithAuth(url, { method: 'DELETE' });
}

/* ============================================================
   认证相关便捷方法
   ============================================================ */

export async function login(params: { email: string; password: string; deviceId?: string }) {
  const res = await post('/api/auth/login', params);
  const data = await res.json();
  useAuthStore.getState().setAccessToken(data.accessToken);
  useAuthStore.getState().setRefreshToken(data.refreshToken);
  useAuthStore.getState().setUser(data.user);
  useAuthStore.getState().setIsHydrated(true);
  return data;
}

export async function register(params: { email: string; password: string; nickname?: string; deviceId?: string }) {
  const res = await post('/api/auth/register', params);
  const data = await res.json();
  useAuthStore.getState().setAccessToken(data.accessToken);
  useAuthStore.getState().setRefreshToken(data.refreshToken);
  useAuthStore.getState().setUser(data.user);
  useAuthStore.getState().setIsHydrated(true);
  return data;
}

/**
 * 登出 — 调用 API 撤销 refresh token，然后清除本地状态
 */
export async function logout() {
  const { accessToken, logout: doLogout } = useAuthStore.getState();
  if (accessToken) {
    try {
      await del('/api/auth/logout');
    } catch {
      // 静默忽略登出错误
    }
  }
  doLogout();
}

/**
 * 获取当前用户信息（用于页面加载时恢复会话）
 */
export async function getMe() {
  const res = await get('/api/auth/me');
  const data = await res.json();
  return data;
}

/* ============================================================
   用户 API
   ============================================================ */

export interface UpdateMePayload {
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
}

export async function updateMe(payload: UpdateMePayload) {
  const res = await patch('/api/users/me', payload);
  return res.json();
}

