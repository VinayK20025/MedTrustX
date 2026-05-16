/**
 * MedTrustX — Auth Store (Zustand)
 * Manages authentication state, user, and tenant.
 *
 * ZTA Device Trust:
 * - isDeviceTrusted is ONLY set to true after a successful PDP verification.
 * - trustDevice() is an internal callback — never called directly from UI.
 * - verifyDeviceTrust() runs the full PEP→PDP pipeline before granting trust.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Tenant, UserRole } from '@/types/auth.types';
import type { PdpTrustDecision, DeviceTrustError } from '@/services/deviceTrust.service';

interface AuthStore {
  /* ── State ──────────────────────────────────────────── */
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tenant: Tenant | null;
  availableTenants: Tenant[];
  isAuthenticated: boolean;
  isDeviceTrusted: boolean;
  /** PDP-signed device session token — null until verified */
  deviceTrustToken: string | null;
  /** ISO 8601 expiry of the PDP trust grant */
  deviceTrustExpiry: string | null;
  /** Risk level assigned by PDP */
  deviceRiskLevel: string | null;
  isLoading: boolean;
  error: string | null;

  /* ── Actions ─────────────────────────────────────────── */
  setUser: (user: User) => void;
  setToken: (token: string, refreshToken?: string) => void;
  setTenant: (tenant: Tenant) => void;
  setAvailableTenants: (tenants: Tenant[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** Internal only — called by verifyDeviceTrust after PDP grants trust */
  _grantDeviceTrust: (decision: PdpTrustDecision) => void;
  /** Full ZTA PEP→PDP verification pipeline — the ONLY way to set isDeviceTrusted=true */
  verifyDeviceTrust: () => Promise<PdpTrustDecision>;
  /** Step-up MFA verification for restricted devices */
  verifyDeviceMfa: (stagingToken: string, mfaCode: string) => Promise<PdpTrustDecision>;
  /** @deprecated Use verifyDeviceTrust() instead — kept for interface compatibility */
  trustDevice: () => void;
  logout: () => void;

  /* ── Computed Helpers ─────────────────────────────────── */
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  tenant: null,
  availableTenants: [],
  isAuthenticated: false,
  isDeviceTrusted: false,
  deviceTrustToken: null,
  deviceTrustExpiry: null,
  deviceRiskLevel: null,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setUser: (user) =>
          set({ user, isAuthenticated: true, isLoading: false, error: null }, false, 'auth/setUser'),

        setToken: (token, refreshToken) =>
          set(
            { token, ...(refreshToken ? { refreshToken } : {}) },
            false,
            'auth/setToken',
          ),

        setTenant: (tenant) =>
          set({ tenant }, false, 'auth/setTenant'),

        setAvailableTenants: (tenants) =>
          set({ availableTenants: tenants }, false, 'auth/setAvailableTenants'),

        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'auth/setLoading'),

        setError: (error) =>
          set({ error, isLoading: false }, false, 'auth/setError'),

        _grantDeviceTrust: (decision) =>
          set(
            {
              isDeviceTrusted: true,
              deviceTrustToken: decision.device_session_token,
              deviceTrustExpiry: decision.trust_expires_at,
              deviceRiskLevel: decision.risk_level,
            },
            false,
            'auth/grantDeviceTrust',
          ),

        verifyDeviceTrust: async () => {
          const { token, _grantDeviceTrust } = get();
          if (!token) {
            throw { code: 'UNKNOWN', message: 'No auth token available for device verification.' } as DeviceTrustError;
          }
          // Dynamically import to avoid server-side issues with browser APIs
          const { performZtaDeviceVerification } = await import('@/services/deviceTrust.service');
          const decision = await performZtaDeviceVerification(token);
          // Only grant trust if PDP explicitly allows
          if (decision.allow) {
            _grantDeviceTrust(decision);
          }
          return decision;
        },

        verifyDeviceMfa: async (stagingToken: string, mfaCode: string) => {
          const { token, _grantDeviceTrust } = get();
          if (!token) {
            throw { code: 'UNKNOWN', message: 'No auth token available for device verification.' } as DeviceTrustError;
          }
          const { verifyDeviceMfa: verifyMfaService } = await import('@/services/deviceTrust.service');
          const decision = await verifyMfaService(stagingToken, mfaCode, token);
          if (decision.allow) {
            _grantDeviceTrust(decision);
          }
          return decision;
        },

        /** @deprecated — no-op stub; kept only for interface compatibility */
        trustDevice: () => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[ZTA] trustDevice() called directly — this is a no-op. Use verifyDeviceTrust() instead.');
          }
        },

        logout: () => {
          if (typeof document !== 'undefined') {
            document.cookie = 'mt-auth=; path=/; max-age=0';
          }
          set({ ...initialState, isLoading: false }, false, 'auth/logout');
        },

        hasRole: (role) => {
          const { user } = get();
          return user?.roles.includes(role) ?? false;
        },

        hasAnyRole: (roles) => {
          const { user } = get();
          return roles.some((r) => user?.roles.includes(r)) ?? false;
        },

        hasPermission: (permission) => {
          const { user } = get();
          if (!user) return false;
          return user.permissions.includes(permission) || user.permissions.includes('*');
        },
      }),
      {
        name: 'mt-auth',
        partialize: (state) => ({
          tenant: state.tenant,
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          // Persist PDP trust grant so re-verification isn't needed on every page load.
          // Expiry is validated on next app boot via rehydration guard.
          isDeviceTrusted: state.isDeviceTrusted,
          deviceTrustToken: state.deviceTrustToken,
          deviceTrustExpiry: state.deviceTrustExpiry,
          deviceRiskLevel: state.deviceRiskLevel,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);
