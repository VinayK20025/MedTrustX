/**
 * MedTrustX — API Layer Types
 */

/** Standard paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Standard API error shape */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  traceId?: string;
  timestamp: string;
}

/** Query parameters for list endpoints */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string | string[] | boolean | number>;
}

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  traceId?: string;
}

/** Mutation result */
export interface MutationResult<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}

/** Sort configuration */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/** Filter configuration */
export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: string | number | boolean | string[];
}

/** API request config */
export interface RequestConfig {
  signal?: AbortSignal;
  timeout?: number;
  skipAuth?: boolean;
  skipTenant?: boolean;
}
