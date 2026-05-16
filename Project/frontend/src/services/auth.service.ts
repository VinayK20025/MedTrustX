/**
 * MedTrustX — Custom Auth Service
 * Replaces Keycloak with direct IAM backend JWT authentication.
 */
import { apiPost } from '@/services/api';
import type { User, TokenClaims } from '@/types/auth.types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/** Login */
export async function loginWithCredentials(username: string, password: string):Promise<LoginResponse> {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  // We are using /api/v1/iam/auth/login to route through Kong properly
  return await apiPost<LoginResponse>('/api/v1/iam/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Tenant-ID': 'tenant_apollo', // Add a default tenant for demo
    },
  });
}

/** SSO Login Simulation */
export async function ssoLogin(provider: string): Promise<LoginResponse> {
  return await apiPost<LoginResponse>(`/api/v1/iam/auth/sso/login?provider=${encodeURIComponent(provider)}`, null, {
    headers: {
      'X-Tenant-ID': 'tenant_apollo',
    },
  });
}

/** Parse JWT token to extract user info */
export function parseToken(token: string): TokenClaims | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** Build User object from token claims */
export function buildUser(token: string): User | null {
  const claims = parseToken(token);
  if (!claims) return null;

  // Assuming our IAM service returns similar claims or standard claims
  const realmRoles = claims.realm_access?.roles ?? claims.roles ?? [];

  return {
    id: claims.sub,
    email: claims.email ?? claims.sub, // Fallback if no email
    username: claims.preferred_username ?? claims.sub,
    firstName: claims.given_name ?? 'MedTrustX',
    lastName: claims.family_name ?? 'User',
    fullName: claims.given_name ? `${claims.given_name} ${claims.family_name}` : 'MedTrustX User',
    roles: realmRoles as User['roles'],
    permissions: [], // populated from backend permission endpoint
    tenantId: claims.tenant_id ?? 'tenant_apollo',
    department: claims.department,
    employeeId: claims.employee_id,
  };
}

/** Logout */
export function logout(redirectUri?: string): void {
  // Can optionally call backend /api/v1/auth/logout here
  window.location.href = redirectUri ?? '/login';
}

/** Check if token is expired */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const claims = parseToken(token);
  if (!claims || !claims.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return claims.exp < now + 10;
}
