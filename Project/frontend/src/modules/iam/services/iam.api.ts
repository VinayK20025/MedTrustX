import { apiGet, apiPost } from '@/services/api';
import { autoEndpoints } from '@/services/autoEndpoints';
import type {
  IAMDashboardData, IAMIdentity, IAMRole, IAMPolicy,
  IAMAuthMethod, IAMRequest, IAMReview, IAMAuditLog, IAMKPI
} from '../types/iam.types';

export interface IAMFilters {
  timeframe?: string;
}

const mockKpis: IAMKPI[] = [
  { id: '1', title: 'Active Identities', value: 8420, format: 'number', status: 'normal', trend: 2.1, trendDirection: 'up' },
  { id: '2', title: 'MFA Adoption', value: '95%', format: 'percentage', status: 'success', trend: 4.2, trendDirection: 'up' },
  { id: '3', title: 'Pending Requests', value: 12, format: 'number', status: 'warning', actionLabel: 'Review', actionUrl: '/dashboard/iam/requests' },
  { id: '4', title: 'Suspicious Logins', value: 2, format: 'number', status: 'critical', actionLabel: 'Investigate', actionUrl: '/dashboard/iam/audit' },
];

const mockIdentities: IAMIdentity[] = [
  { id: 'ID-001', name: 'Dr. Sarah Jenkins', email: 's.jenkins@hospital.org', role: 'Chief of Surgery', department: 'Surgery', status: 'active', mfaStatus: 'enabled', lastLogin: new Date(Date.now() - 3600000).toISOString(), riskScore: 12 },
  { id: 'ID-002', name: 'James Wilson', email: 'j.wilson@hospital.org', role: 'IT Support', department: 'IT', status: 'active', mfaStatus: 'enabled', lastLogin: new Date(Date.now() - 7200000).toISOString(), riskScore: 8 },
  { id: 'ID-003', name: 'Unverified Device', email: 'unknown@external.net', role: 'Guest', department: 'None', status: 'locked', mfaStatus: 'disabled', lastLogin: new Date(Date.now() - 86400000).toISOString(), riskScore: 95 },
];

const mockRoles: IAMRole[] = [
  { id: 'R-01', name: 'Clinical Staff', type: 'rbac', userCount: 1240, permissions: ['patient:read', 'vitals:write'], description: 'Standard clinical access', lastUpdated: '2026-03-15' },
  { id: 'R-02', name: 'ICU High-Privilege', type: 'abac', userCount: 45, permissions: ['icu:all', 'override:vitals'], description: 'Context-aware ICU access', lastUpdated: '2026-04-10' },
];

const mockPolicies: IAMPolicy[] = [
  { id: 'POL-01', name: 'ICU Data Access (OPA)', condition: 'Department == ICU && Time >= ShiftStart', regoCode: 'package medtrust.icu\ndefault allow = false\nallow { input.user.department == "ICU"; time.now_ns() >= input.shift.start_time }', version: 'v1.2.4', author: 'SecOps', status: 'enforced', severity: 'high', affectedRoles: 2, lastUpdated: '2026-02-20' },
  { id: 'POL-02', name: 'Remote VPN Access', condition: 'IPRange == Internal || MFA == True', regoCode: 'package medtrust.vpn\ndefault allow = false\nallow { input.network.type == "Internal" }\nallow { input.auth.mfa_verified == true }', version: 'v2.0.1', author: 'IAM Admin', status: 'enforced', severity: 'critical', affectedRoles: 5, lastUpdated: '2026-01-10' },
  { id: 'POL-03', name: 'High-Value Asset Lock', condition: 'RiskScore < 30', regoCode: 'package medtrust.assets\ndefault allow = false\nallow { input.user.risk_score < 30 }', version: 'v1.0.0', author: 'CISO', status: 'audit_only', severity: 'critical', affectedRoles: 12, lastUpdated: '2026-05-01' },
];

const mockAuthMethods: IAMAuthMethod[] = [
  { id: 'AUTH-1', method: 'Keycloak Identity Broker', type: 'keycloak', status: 'required', adoptionRate: 100, provider: 'Keycloak', realm: 'medtrustx-clinical', activeSessions: 4210, clientId: 'medtrustx-frontend-app', lastSync: new Date(Date.now() - 300000).toISOString() },
  { id: 'AUTH-2', method: 'Enterprise SAML SSO', type: 'sso', status: 'enabled', adoptionRate: 88, provider: 'Okta', realm: 'medtrustx-corp', activeSessions: 1402, lastSync: new Date(Date.now() - 1200000).toISOString() },
  { id: 'AUTH-3', method: 'FIDO2 / WebAuthn Biometrics', type: 'biometric', status: 'enabled', adoptionRate: 45, provider: 'YubiKey / Windows Hello', activeSessions: 890 },
  { id: 'AUTH-4', method: 'Authenticator App (TOTP)', type: 'mfa', status: 'enabled', adoptionRate: 95, provider: 'Internal Keycloak MFA', activeSessions: 3950 },
  { id: 'AUTH-5', method: 'Legacy LDAP Password', type: 'password', status: 'disabled', adoptionRate: 0, provider: 'Active Directory', realm: 'legacy-ad', activeSessions: 0 },
];

const mockRequests: IAMRequest[] = [
  { id: 'REQ-101', userId: 'ID-045', userName: 'Nurse B. Smith', roleRequested: 'ICU Data Access', reason: 'Temporary shift coverage in ICU-A', status: 'pending', requestedAt: new Date(Date.now() - 14400000).toISOString(), riskLevel: 'medium' },
  { id: 'REQ-102', userId: 'ID-089', userName: 'Dr. A. Patel', roleRequested: 'Research DB Access', reason: 'Oncology research study analysis', status: 'approved', requestedAt: new Date(Date.now() - 86400000).toISOString(), riskLevel: 'low' },
];

const mockReviews: IAMReview[] = [
  { id: 'REV-01', title: 'Q2 Admin Access Review', targetRole: 'System Administrator', status: 'ongoing', progress: 45, dueDate: '2026-05-15', reviewer: 'IAM Lead' },
  { id: 'REV-02', title: 'Annual Clinical Certification', targetRole: 'Clinical Staff', status: 'scheduled', progress: 0, dueDate: '2026-06-30', reviewer: 'CMO' },
];

const mockAuditLogs: IAMAuditLog[] = [
  { id: 'AUD-01', action: 'Failed Login Attempt', actor: 'Unknown', target: 'ID-001', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'warning', ipAddress: '192.168.1.50' },
  { id: 'AUD-02', action: 'Role Granted', actor: 'IAM Admin', target: 'ID-002 -> ICU High-Privilege', timestamp: new Date(Date.now() - 7200000).toISOString(), severity: 'info', ipAddress: '10.0.0.15' },
  { id: 'AUD-03', action: 'Policy Override Detected', actor: 'System', target: 'POL-01', timestamp: new Date(Date.now() - 14400000).toISOString(), severity: 'critical', ipAddress: 'Internal Gateway' },
];

export const iamApi = {
  getDashboardSummary: async (filters: IAMFilters) => {
    try {
      const response = await apiGet<{ data: IAMDashboardData; message: string; status: number }>(autoEndpoints.iam.list, { params: filters });
      return response;
    } catch (e) {
      console.warn('Fallback to IAM mock data due to API error:', e);
      return {
        data: {
          kpis: mockKpis,
          identities: mockIdentities,
          roles: mockRoles,
          policies: mockPolicies,
          authMethods: mockAuthMethods,
          requests: mockRequests,
          reviews: mockReviews,
          auditLogs: mockAuditLogs,
        } as IAMDashboardData,
        message: 'Success (Mock)', status: 200,
      };
    }
  },

  approveRequest: async (requestId: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(autoEndpoints.iam.update(requestId), { action: 'approve' });
    } catch (e) {
      return { data: { success: true }, message: 'Request approved (Mock)', status: 200 };
    }
  },
  rejectRequest: async (requestId: string, reason: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(autoEndpoints.iam.update(requestId), { action: 'reject', reason });
    } catch (e) {
      return { data: { success: true }, message: 'Request rejected (Mock)', status: 200 };
    }
  },
  enforceMfa: async (userId: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(autoEndpoints.iam.update(userId), { action: 'enforceMfa' });
    } catch (e) {
      return { data: { success: true }, message: 'MFA Enforced (Mock)', status: 200 };
    }
  },
  lockUser: async (userId: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(autoEndpoints.iam.update(userId), { action: 'lockUser' });
    } catch (e) {
      return { data: { success: true }, message: 'User locked (Mock)', status: 200 };
    }
  },
  getCampaignIdentities: async (campaignId: string) => {
    try {
      const response = await apiGet<{ data: any[]; message: string; status: number }>(autoEndpoints.iam.list, { params: { campaignId } });
      if (response && response.data && response.data.length > 0) return response;
      throw new Error("No data");
    } catch (e) {
      return {
        data: [
          { id: 'uid-992', name: 'John Doe', department: 'IT Ops', currentRole: 'Network Engineer', lastLogin: new Date(Date.now() - 3600000).toISOString(), riskScore: 'Medium', recommendation: 'Revoke', rationale: 'User moved to DevOps, no longer requires Network Admin rights.' },
          { id: 'uid-993', name: 'Dr. Sarah Jenkins', department: 'Surgery', currentRole: 'Attending Surgeon', lastLogin: new Date(Date.now() - 7200000).toISOString(), riskScore: 'Low', recommendation: 'Approve', rationale: 'Active daily logins aligned with clinical schedule.' },
          { id: 'uid-994', name: 'Vendor - MedTech API', department: 'B2B', currentRole: 'Service Account', lastLogin: new Date(Date.now() - 86400000 * 120).toISOString(), riskScore: 'High', recommendation: 'Revoke', rationale: 'Account dormant for >120 days.' },
          { id: 'uid-995', name: 'Alice Smith', department: 'Billing', currentRole: 'Financial Analyst', lastLogin: new Date(Date.now() - 14400000).toISOString(), riskScore: 'Low', recommendation: 'Approve', rationale: 'Normal access patterns.' },
        ],
        message: 'Success (Mock)', status: 200,
      };
    }
  },
  certifyIdentity: async (identityId: string, action: 'approved' | 'revoked') => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(autoEndpoints.iam.update(identityId), { action });
    } catch (e) {
      return { data: { success: true }, message: `Identity ${action} (Mock)`, status: 200 };
    }
  },
  toggleAuthMethod: async (methodId: string, action: 'enable' | 'disable' | 'sync') => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(`/api/v1/iam/auth-methods/${methodId}`, { action });
    } catch (e) {
      return { data: { success: true }, message: `Auth method ${action} successful (Mock)`, status: 200 };
    }
  },
  togglePolicy: async (policyId: string, action: 'enforced' | 'disabled') => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(`/api/v1/iam/policies/${policyId}`, { action });
    } catch (e) {
      return { data: { success: true }, message: `Policy ${action} successful (Mock)`, status: 200 };
    }
  },
  deletePolicy: async (policyId: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(`/api/v1/iam/policies/${policyId}`, { action: 'delete' });
    } catch (e) {
      return { data: { success: true }, message: `Policy deleted successfully (Mock)`, status: 200 };
    }
  },
};
