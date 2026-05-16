export interface CacheKey {
  id: string;
  cache_key: string;
  value: Record<string, any>;
  expires_at: string | null;
}

export interface SessionStore {
  id: string;
  session_id: string;
  data: Record<string, any>;
  expires_at: string | null;
}

export interface RateLimit {
  id: string;
  key: string;
  request_count: number;
  window_start: string;
}
