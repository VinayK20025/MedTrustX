'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { isTokenExpired, parseToken } from '@/services/auth.service';
import { configureApiClient } from '@/services/api';
import { PageLoader } from '@/components/ui/Spinner';
import { useRouter, usePathname } from 'next/navigation';

/**
 * AuthProvider — wraps all dashboard pages.
 * Responsibilities:
 * 1. Configure the Axios API client with token/tenant accessors
 * 2. Redirect unauthenticated users to /login
 * 3. Sync JWT token to cookie (for middleware edge protection)
 * 4. Auto-logout on token expiry
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(() => {
    logout();
    // Clear auth cookie
    document.cookie = 'mt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    if (pathname !== '/login') {
      window.location.href = '/login';
    }
  }, [logout, pathname]);

  // Sync token to cookie for edge middleware
  const syncTokenCookie = useCallback((jwt: string | null) => {
    if (jwt) {
      const claims = parseToken(jwt);
      const expires = claims?.exp
        ? new Date(claims.exp * 1000).toUTCString()
        : new Date(Date.now() + 3600_000).toUTCString();
      document.cookie = `mt-auth=${jwt}; path=/; expires=${expires}; SameSite=Lax`;
    } else {
      document.cookie = 'mt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  }, []);

  // Schedule auto-logout when token expires
  const scheduleTokenExpiry = useCallback(
    (jwt: string) => {
      const claims = parseToken(jwt);
      if (!claims?.exp) return;

      const msUntilExpiry = claims.exp * 1000 - Date.now() - 30_000; // 30s buffer
      if (msUntilExpiry <= 0) {
        handleLogout();
        return;
      }

      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = setTimeout(() => {
        console.info('[AuthProvider] Token expiring, logging out...');
        handleLogout();
      }, msUntilExpiry);
    },
    [handleLogout],
  );

  useEffect(() => {
    // Configure API client with token/tenant accessors
    configureApiClient({
      getToken: () => useAuthStore.getState().token,
      getTenantId: () => useAuthStore.getState().tenant?.id ?? 'tenant_apollo',
      onUnauthorized: handleLogout,
    });

    const isPublicPath = pathname === '/login' || pathname === '/access-denied';

    if (isPublicPath) {
      setReady(true);
      return;
    }

    // Check authentication status
    if (!token || isTokenExpired(token)) {
      handleLogout();
      return;
    }

    // Sync token to cookie and schedule expiry
    syncTokenCookie(token);
    scheduleTokenExpiry(token);
    setReady(true);

    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [token, handleLogout, pathname, syncTokenCookie, scheduleTokenExpiry]);

  if (!ready) return <PageLoader message="Initializing MedTrustX..." />;
  return <>{children}</>;
}
