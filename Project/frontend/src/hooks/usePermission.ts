/**
 * MedTrustX — usePermission Hook
 * Component-level permission checks.
 */
'use client';

import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { UserRole } from '@/types/auth.types';

interface UsePermissionResult {
  isAllowed: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuth>['user'];
}

/** Check if current user has a specific role */
export function useRoleCheck(role: UserRole): UsePermissionResult {
  const { user, isLoading, hasRole } = useAuth();
  const isAllowed = useMemo(() => hasRole(role), [hasRole, role]);
  return { isAllowed, isLoading, user };
}

/** Check if current user has any of the given roles */
export function useAnyRoleCheck(roles: UserRole[]): UsePermissionResult {
  const { user, isLoading, hasAnyRole } = useAuth();
  const isAllowed = useMemo(() => hasAnyRole(roles), [hasAnyRole, roles]);
  return { isAllowed, isLoading, user };
}

/** Check if current user has a specific permission */
export function usePermissionCheck(permission: string): UsePermissionResult {
  const { user, isLoading, hasPermission } = useAuth();
  const isAllowed = useMemo(() => hasPermission(permission), [hasPermission, permission]);
  return { isAllowed, isLoading, user };
}

/** Check multiple permissions (all must be true) */
export function usePermissionsCheck(permissions: string[]): UsePermissionResult {
  const { user, isLoading, hasPermission } = useAuth();
  const isAllowed = useMemo(
    () => permissions.every((p) => hasPermission(p)),
    [hasPermission, permissions],
  );
  return { isAllowed, isLoading, user };
}
