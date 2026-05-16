import type { ServiceAccountData } from '../types/service-accounts.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: ServiceAccountData = {
  metrics: {
    totalAccounts: 142,
    activeKeys: 284,
    dailyApiCalls: 1540200,
    failedAuthAttempts: 12,
    rotationCompliance: 98.5,
  },
  accounts: [
    { id: 'SA-EHR-01', name: 'ehr-core-api', owner: 'Clinical Systems', status: 'Active', lastUsed: t(-5), description: 'Core EHR synchronization service' },
    { id: 'SA-BIL-42', name: 'billing-batch-processor', owner: 'Finance', status: 'Active', lastUsed: t(-3600), description: 'Nightly batch processor for claims' },
    { id: 'SA-LAB-99', name: 'lis-integration-worker', owner: 'Pathology', status: 'Pending Rotation', lastUsed: t(-120), description: 'Lab Information System HL7 bridge' },
    { id: 'SA-ANA-05', name: 'data-lake-ingestion', owner: 'Data Engineering', status: 'Suspended', lastUsed: t(-86400 * 2), description: 'ETL ingestion service account' },
    { id: 'SA-DEV-00', name: 'legacy-pager-gateway', owner: 'IT Ops', status: 'Revoked', lastUsed: t(-86400 * 45), description: 'Deprecated SMS gateway' },
  ],
  credentials: [
    { id: 'KEY-EHR-A1', accountId: 'SA-EHR-01', type: 'mTLS Cert', status: 'Valid', expiryDate: t(86400 * 180), lastRotated: t(-86400 * 180) },
    { id: 'KEY-BIL-B2', accountId: 'SA-BIL-42', type: 'JWT', status: 'Valid', expiryDate: t(86400 * 7), lastRotated: t(-86400 * 23) },
    { id: 'KEY-LAB-C3', accountId: 'SA-LAB-99', type: 'API Key', status: 'Expiring Soon', expiryDate: t(86400 * 2), lastRotated: t(-86400 * 88) },
    { id: 'KEY-ANA-D4', accountId: 'SA-ANA-05', type: 'OAuth2 Token', status: 'Expired', expiryDate: t(-86400 * 1), lastRotated: t(-86400 * 91) },
  ],
  policies: [
    { id: 'POL-EHR-01', accountId: 'SA-EHR-01', accessLevel: 'Read/Write', resources: ['/api/v1/patients/*', '/api/v1/encounters/*'], isLeastPrivilege: true },
    { id: 'POL-BIL-42', accountId: 'SA-BIL-42', accessLevel: 'Read-Only', resources: ['/api/v1/billing/claims'], isLeastPrivilege: true },
    { id: 'POL-LAB-99', accountId: 'SA-LAB-99', accessLevel: 'Custom', resources: ['/api/hl7/v2/orm'], isLeastPrivilege: false }, // Over-permissioned
  ],
  logs: [
    { id: 'LOG-1001', accountId: 'SA-EHR-01', sourceService: 'EHR Core', targetService: 'Patient Index', endpoint: '/api/v1/patients/search', timestamp: t(-10), status: 'Success', latencyMs: 45 },
    { id: 'LOG-1002', accountId: 'SA-BIL-42', sourceService: 'Billing Batch', targetService: 'Claims Engine', endpoint: '/api/v1/billing/claims/batch', timestamp: t(-3600), status: 'Success', latencyMs: 1250 },
    { id: 'LOG-1003', accountId: 'SA-LAB-99', sourceService: 'LIS Bridge', targetService: 'EHR Core', endpoint: '/api/v1/patients/labs', timestamp: t(-120), status: 'Denied', latencyMs: 12 }, // Denied request
    { id: 'LOG-1004', accountId: 'SA-ANA-05', sourceService: 'ETL Job', targetService: 'Data Lake', endpoint: '/api/v2/ingest', timestamp: t(-86400 * 1), status: 'Failed', latencyMs: 5 }, // Auth failed
  ],
  alerts: [
    { id: 'ALT-SA-1', accountId: 'SA-ANA-05', issue: 'Failed Auth Attempts > 5 (Expired Token)', severity: 'Critical', timestamp: t(-86400 * 1), resolved: false },
    { id: 'ALT-SA-2', accountId: 'SA-LAB-99', issue: 'API Key Expiring in 48 Hours', severity: 'Warning', timestamp: t(-3600), resolved: false },
    { id: 'ALT-SA-3', accountId: 'SA-LAB-99', issue: 'Policy Violation: Non-Least Privilege Access Detected', severity: 'Warning', timestamp: t(-86400 * 5), resolved: false },
  ]
};

export const serviceAccountsApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  rotateCredential: async (accountId: string) => ({ data: { success: true }, message: 'Credential Rotated Successfully', status: 200 }),
  suspendAccount: async (accountId: string) => ({ data: { success: true }, message: 'Service Account Suspended', status: 200 }),
  resolveAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert Resolved', status: 200 }),
};
