/**
 * MedTrustX — User Module Types
 * Cross-role module: Profile, Settings, Security, Preferences
 */
import type { BaseEntity, TenantEntity, Address, ContactInfo } from '@/types/common.types';
import type { UserRole } from '@/types/auth.types';

/* ── Profile ───────────────────────────────────────────── */

export interface UserProfile extends TenantEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  roles: UserRole[];
  department?: string;
  designation?: string;
  employeeId?: string;
  /** Clinical-specific fields */
  specialization?: string;
  licenseNumber?: string;
  qualifications?: string[];
  /** Executive-specific fields */
  organizationScope?: string;
  reportingUnits?: string[];
  /** Organizational context */
  assignedUnits?: string[];
  /** Read-only metadata */
  lastLoginAt?: string;
  lastLoginIp?: string;
  passwordChangedAt?: string;
  mfaEnabled: boolean;
  /** Timestamps */
  joinedAt: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  designation?: string;
  specialization?: string;
  licenseNumber?: string;
  qualifications?: string[];
  organizationScope?: string;
  reportingUnits?: string[];
  assignedUnits?: string[];
}

/* ── Settings / Preferences ────────────────────────────── */

export interface UserPreferences {
  /** UI Preferences */
  defaultDashboard: string;
  defaultLandingPage: string;
  timeFormat: '12h' | '24h';
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  language: string;
  /** Clinical-specific */
  defaultPatientView?: 'card' | 'table' | 'timeline';
  preferredUnits?: string[];
  autoRefreshInterval?: number; // seconds, 0 = disabled
  /** Executive-specific */
  defaultReports?: string[];
  kpiFocus?: string[];
  dashboardLayout?: 'compact' | 'expanded';
}

export interface NotificationPreferences {
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
  categories: {
    [key: string]: {
      enabled: boolean;
      channels: ('inApp' | 'email' | 'sms')[];
    };
  };
}

/** Role-aware notification category definitions */
export interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  roles: UserRole[] | '*';
  group: 'clinical' | 'administrative' | 'system' | 'executive';
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  density: 'compact' | 'comfortable' | 'spacious';
  fontScale: number; // 0.8 - 1.4
  sidebarCollapsed: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSizeIncrease: number; // 0-4 steps
  screenReaderMode: boolean;
  focusIndicators: boolean;
}

export interface UserSettings {
  preferences: UserPreferences;
  notifications: NotificationPreferences;
  appearance: AppearanceSettings;
  accessibility: AccessibilitySettings;
}

/* ── Security ──────────────────────────────────────────── */

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MfaSetupResponse {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActivity: string;
  startedAt: string;
  isCurrent: boolean;
}

export interface DeviceHistoryEntry {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  action: 'login' | 'logout' | 'failed_login' | 'password_change' | 'mfa_setup';
  timestamp: string;
  success: boolean;
}

/* ── Audit ─────────────────────────────────────────────── */

export interface ProfileAuditEvent {
  event: 'USER_PROFILE_UPDATED' | 'USER_SETTINGS_UPDATED' | 'USER_PASSWORD_CHANGED' | 'USER_MFA_TOGGLED' | 'USER_SESSION_REVOKED';
  userId: string;
  changes?: string[];
  timestamp: string;
  ipAddress?: string;
}
