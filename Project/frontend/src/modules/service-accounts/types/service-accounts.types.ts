/**
 * MedTrustX — Service Accounts Platform Types
 * API-to-API communication, machine identities, zero-trust access model.
 */

export type AccountStatus = 'Active' | 'Suspended' | 'Pending Rotation' | 'Revoked';
export type CredentialType = 'API Key' | 'OAuth2 Token' | 'mTLS Cert' | 'JWT';
export type AccessLevel = 'Read/Write' | 'Read-Only' | 'Admin' | 'Custom';
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';

export interface ServiceAccount {
  id: string;
  name: string; // e.g., ehr-api-sa
  owner: string; // Department or system
  status: AccountStatus;
  lastUsed: string;
  description: string;
}

export interface Credential {
  id: string;
  accountId: string;
  type: CredentialType;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Rotated';
  expiryDate: string;
  lastRotated: string;
}

export interface PermissionPolicy {
  id: string;
  accountId: string;
  accessLevel: AccessLevel;
  resources: string[]; // e.g., ['/api/v1/patients', '/api/v1/billing']
  isLeastPrivilege: boolean;
}

export interface AccessLog {
  id: string;
  accountId: string;
  sourceService: string;
  targetService: string;
  endpoint: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Denied';
  latencyMs: number;
}

export interface IdentityAlert {
  id: string;
  accountId: string;
  issue: string;
  severity: AlertSeverity;
  timestamp: string;
  resolved: boolean;
}

export interface ServiceAccountMetrics {
  totalAccounts: number;
  activeKeys: number;
  dailyApiCalls: number;
  failedAuthAttempts: number;
  rotationCompliance: number; // percentage
}

export interface ServiceAccountData {
  metrics: ServiceAccountMetrics;
  accounts: ServiceAccount[];
  credentials: Credential[];
  policies: PermissionPolicy[];
  logs: AccessLog[];
  alerts: IdentityAlert[];
}
