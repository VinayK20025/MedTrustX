import type { QAData } from '../types/qa.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockQAData: QAData = {
  metrics: { totalTests: 892, passRate: 94.1, openDefects: 14, criticalDefects: 2, avgCoverage: 84, automationRate: 68 },
  suites: [
    { id: 'STE-001', name: 'Patient Registration Flow', module: 'EHR', type: 'Functional', totalCases: 48, passed: 47, failed: 1, blocked: 0, coverage: 92, lastRun: t(-1800), status: 'Failed' },
    { id: 'STE-002', name: 'Billing & Payment E2E', module: 'Billing', type: 'E2E', totalCases: 62, passed: 60, failed: 2, blocked: 0, coverage: 81, lastRun: t(-3600), status: 'Failed' },
    { id: 'STE-003', name: 'Authentication & Access Control', module: 'Auth', type: 'Security', totalCases: 35, passed: 35, failed: 0, blocked: 0, coverage: 97, lastRun: t(-7200), status: 'Passed' },
    { id: 'STE-004', name: 'Lab Results Workflow', module: 'LIS', type: 'Functional', totalCases: 54, passed: 54, failed: 0, blocked: 0, coverage: 89, lastRun: t(-900), status: 'Passed' },
    { id: 'STE-005', name: 'Telehealth Session Tests', module: 'Telemedicine', type: 'Functional', totalCases: 28, passed: 26, failed: 0, blocked: 2, coverage: 71, lastRun: t(-5400), status: 'Blocked' },
    { id: 'STE-006', name: 'Security Vulnerability Scans', module: 'All', type: 'Security', totalCases: 40, passed: 37, failed: 3, blocked: 0, coverage: 0, lastRun: t(-10800), status: 'Failed' },
  ],
  cases: [
    { id: 'TC-001', suiteId: 'STE-001', title: 'Verify patient registration with valid data', type: 'Functional', status: 'Passed', duration: 3200 },
    { id: 'TC-002', suiteId: 'STE-001', title: 'Submit registration with duplicate MRN — expect 409 conflict', type: 'Functional', status: 'Failed', duration: 1800, errorMessage: 'API returned 200 OK instead of 409 Conflict for duplicate MRN PAT-4891', linkedDefect: 'BUG-007' },
    { id: 'TC-003', suiteId: 'STE-002', title: 'Process insurance claim with valid policy', type: 'E2E', status: 'Passed', duration: 12400 },
    { id: 'TC-004', suiteId: 'STE-002', title: 'Handle claim rejection from insurer gateway', type: 'E2E', status: 'Failed', duration: 30000, errorMessage: 'Timeout waiting for insurance gateway response after 30s. Gateway returned 503.', linkedDefect: 'BUG-009' },
    { id: 'TC-005', suiteId: 'STE-003', title: 'Login with invalid credentials — expect 401', type: 'Security', status: 'Passed', duration: 820 },
    { id: 'TC-006', suiteId: 'STE-003', title: 'JWT token replay attack prevention', type: 'Security', status: 'Passed', duration: 1100 },
    { id: 'TC-007', suiteId: 'STE-006', title: 'SQL injection on patient search endpoint', type: 'Security', status: 'Failed', duration: 2200, errorMessage: 'SQL injection payload returned patient records — endpoint is vulnerable', linkedDefect: 'BUG-001' },
  ],
  defects: [
    { id: 'BUG-001', title: 'SQL injection vulnerability on patient search', description: 'Patient search endpoint does not sanitize inputs — SQL injection returns raw data.', module: 'EHR API', severity: 'Critical', status: 'Open', assignee: 'Kiran Dev', linkedTestCase: 'TC-007', detectedAt: t(-10800), stepsToReproduce: "1. Navigate to /api/patient/search\n2. Set query param: name='; SELECT * FROM patients; --\n3. Observe unfiltered DB results returned." },
    { id: 'BUG-002', title: 'PHI exposed in error logs during 500 responses', description: 'Global error handler logs full request body including patient PHI on server errors.', module: 'EHR API', severity: 'Critical', status: 'In Fix', assignee: 'Arjun Backend', detectedAt: t(-86400), stepsToReproduce: "1. Trigger a 500 error in EHR API\n2. Check server log output\n3. Observe full request body with PHI fields present." },
    { id: 'BUG-007', title: 'Duplicate MRN returns 200 OK instead of 409', description: 'Patient registration API does not reject duplicate MRN numbers — returns 200 instead of 409 Conflict.', module: 'Registration', severity: 'High', status: 'Open', assignee: 'Priya Backend', linkedTestCase: 'TC-002', detectedAt: t(-1800), stepsToReproduce: "1. Register patient with MRN PAT-4891\n2. Submit identical MRN again\n3. Expect 409 — actual: 200 OK" },
    { id: 'BUG-009', title: 'Insurance gateway timeout not handled gracefully', description: 'When insurance gateway returns 503, billing service throws unhandled exception instead of fallback.', module: 'Billing', severity: 'High', status: 'Open', assignee: 'Arjun Backend', linkedTestCase: 'TC-004', detectedAt: t(-3600), stepsToReproduce: "1. Simulate insurance gateway 503\n2. Submit claim\n3. Expect graceful fallback — actual: 500 Internal Server Error" },
    { id: 'BUG-011', title: 'Telehealth session blocked on Safari iOS', description: 'WebRTC ICE negotiation fails on Safari iOS 17 — users cannot connect to telemedicine sessions.', module: 'Telemedicine', severity: 'Medium', status: 'Open', assignee: 'Ravi Frontend', detectedAt: t(-172800), stepsToReproduce: "1. Open Safari iOS 17\n2. Join telemedicine session\n3. Observe ICE candidate negotiation failure in console." },
  ],
  securityFindings: [
    { id: 'SF-001', title: 'SQL Injection on /api/patient/search', type: 'Injection', severity: 'Critical', endpoint: 'GET /api/patient/search?name=', status: 'Open', detectedAt: t(-10800), cveId: 'CWE-89', remediation: 'Use parameterized queries or ORM with built-in SQL escaping.' },
    { id: 'SF-002', title: 'Missing rate limiting on authentication endpoint', type: 'Broken Auth', severity: 'High', endpoint: 'POST /api/auth/login', status: 'Fixed', detectedAt: t(-86400), cveId: 'CWE-307', remediation: 'Apply rate limiting (5 attempts / min) and account lockout after 10 failures.' },
    { id: 'SF-003', title: 'X-Frame-Options missing on patient portal', type: 'Security Misconfiguration', severity: 'Medium', endpoint: 'All portal routes', status: 'Open', detectedAt: t(-3600), cveId: 'CWE-693', remediation: "Add 'X-Frame-Options: DENY' header via API gateway middleware." },
  ],
  coverage: [
    { module: 'EHR Core', coverage: 89, totalCases: 248, automated: 198 },
    { module: 'Billing', coverage: 81, totalCases: 162, automated: 120 },
    { module: 'Authentication', coverage: 97, totalCases: 35, automated: 35 },
    { module: 'Lab Results', coverage: 89, totalCases: 54, automated: 48 },
    { module: 'Telemedicine', coverage: 71, totalCases: 28, automated: 12 },
    { module: 'Patient Portal', coverage: 64, totalCases: 82, automated: 42 },
    { module: 'Admin', coverage: 78, totalCases: 83, automated: 55 },
  ],
};

export const qaApi = {
  getData: async () => ({ data: mockQAData, message: 'Success', status: 200 }),
  runSuite: async (id: string) => ({ data: { success: true }, message: 'Test run queued', status: 200 }),
  logDefect: async (title: string) => ({ data: { success: true }, message: 'Defect logged', status: 200 }),
};
