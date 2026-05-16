/**
 * MedTrustX — IAM Administrator Types
 * Identity, Access Management, and Zero Trust models.
 */

export interface IAMKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface IAMIdentity {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'locked' | 'pending';
  mfaStatus: 'enabled' | 'disabled';
  lastLogin: string;
  riskScore: number;
}

export interface IAMRole {
  id: string;
  name: string;
  type: 'rbac' | 'abac';
  userCount: number;
  permissions: string[];
  description: string;
  lastUpdated: string;
}

export interface IAMPolicy {
  id: string;
  name: string;
  condition: string;
  regoCode?: string;
  version?: string;
  author?: string;
  status: 'enforced' | 'audit_only' | 'disabled';
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedRoles: number;
  lastUpdated: string;
}

export interface IAMAuthMethod {
  id: string;
  method: string;
  type: 'mfa' | 'sso' | 'password' | 'biometric' | 'keycloak' | 'oidc';
  status: 'enabled' | 'disabled' | 'required';
  adoptionRate: number;
  provider?: string;
  realm?: string;
  activeSessions?: number;
  clientId?: string;
  lastSync?: string;
}

export interface IAMRequest {
  id: string;
  userId: string;
  userName: string;
  roleRequested: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface IAMReview {
  id: string;
  title: string;
  targetRole: string;
  status: 'ongoing' | 'scheduled' | 'completed';
  progress: number;
  dueDate: string;
  reviewer: string;
}

export interface IAMAuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
}

export interface IAMReviewIdentity {
  id: string;
  name: string;
  department: string;
  currentRole: string;
  lastLogin: string;
  riskScore: 'Low' | 'Medium' | 'High';
  recommendation: 'Approve' | 'Revoke';
  rationale: string;
  status?: 'approved' | 'revoked';
}

export interface IAMDashboardData {
  kpis: IAMKPI[];
  identities: IAMIdentity[];
  roles: IAMRole[];
  policies: IAMPolicy[];
  authMethods: IAMAuthMethod[];
  requests: IAMRequest[];
  reviews: IAMReview[];
  auditLogs: IAMAuditLog[];
}
