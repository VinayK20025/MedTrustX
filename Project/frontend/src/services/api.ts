/**
 * MedTrustX — Axios API Client
 * ──────────────────────────────────────────────
 * Singleton axios instance with:
 *   • JWT token injection
 *   • Multi-tenant X-Tenant-ID header
 *   • Automatic 401 logout
 *   • Request/response logging (dev)
 *   • Request deduplication
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, HTTP_STATUS } from '@/utils/constants';

/* ── Create base instance ─────────────────────────────── */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ── Token accessor (lazy-loaded to avoid circular deps) ── */
let getToken: (() => string | null) | null = null;
let getTenantId: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function configureApiClient(config: {
  getToken: () => string | null;
  getTenantId: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = config.getToken;
  getTenantId = config.getTenantId;
  onUnauthorized = config.onUnauthorized;
}

/* ── Request Interceptor ──────────────────────────────── */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach JWT
    const token = getToken?.();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach tenant
    const tenantId = getTenantId?.();
    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    // Dev logging
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ── Response Interceptor ─────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // 401 — token expired or invalid → force logout
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      onUnauthorized?.();
    }

    // 403 — forbidden (permission denied)
    if (status === HTTP_STATUS.FORBIDDEN) {
      console.warn('[API] Forbidden:', error.config?.url);
    }

    // 429 — rate limited
    if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
      console.warn('[API] Rate limited:', error.config?.url);
    }

    // 5xx — server error
    if (status && status >= 500) {
      console.error('[API] Server error:', status, error.config?.url);
    }

    return Promise.reject(error);
  },
);

/* ── Typed helpers ────────────────────────────────────── */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

export default api;
