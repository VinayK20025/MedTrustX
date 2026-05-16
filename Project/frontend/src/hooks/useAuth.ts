/**
 * MedTrustX — useAuth Hook
 * High-level auth hook combining Keycloak + Zustand auth store.
 */
'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { logout as keycloakLogout } from '@/services/auth.service';
import type { UserRole } from '@/types/auth.types';

export function useAuth() {
  const {
    user,
    token,
    tenant,
    availableTenants,
    isAuthenticated,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    hasPermission,
    setTenant,
    isDeviceTrusted,
    deviceTrustToken,
    deviceTrustExpiry,
    deviceRiskLevel,
    verifyDeviceTrust,
    verifyDeviceMfa,
  } = useAuthStore();

  const logout = useCallback(() => {
    useAuthStore.getState().logout();
    keycloakLogout();
  }, []);

  const switchTenant = useCallback(
    (tenantId: string) => {
      const found = availableTenants.find((t) => t.id === tenantId);
      if (found) {
        setTenant(found);
        // Reload to re-fetch data for new tenant
        window.location.reload();
      }
    },
    [availableTenants, setTenant],
  );

  const requireRole = useCallback(
    (role: UserRole): boolean => {
      return hasRole(role);
    },
    [hasRole],
  );

  const requireAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return hasAnyRole(roles);
    },
    [hasAnyRole],
  );

  return {
    user,
    token,
    tenant,
    availableTenants,
    isAuthenticated,
    isDeviceTrusted,
    deviceTrustToken,
    deviceTrustExpiry,
    deviceRiskLevel,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    hasPermission,
    requireRole,
    requireAnyRole,
    logout,
    switchTenant,
    /** Full ZTA PEP→PDP pipeline — the only way to grant device trust */
    verifyDeviceTrust,
    /** Step-up MFA verification */
    verifyDeviceMfa,
  };
}
