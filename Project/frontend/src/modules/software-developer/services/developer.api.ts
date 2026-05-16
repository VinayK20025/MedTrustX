import type { DeveloperData } from '../types/developer.types';

export interface DevFilters { serviceId?: string; status?: string; }

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: DeveloperData = {
  metrics: {
    buildSuccessRate: 87,
    avgCodeCoverage: 81,
    openIssues: 11,
    deploymentsToday: 5,
    activeServices: 7,
    failedBuildsToday: 2,
  },
  services: [
    { id: 'SVC-001', name: 'EHR Core API', description: 'Central patient data service — admissions, records, clinicals', language: 'TypeScript', framework: 'NestJS', status: 'Active', version: 'v4.2.1', owner: 'Kiran Dev', repository: 'git/ehr-core-api', coverage: 89, openIssues: 2, lastDeployed: t(-3600) },
    { id: 'SVC-002', name: 'Billing Microservice', description: 'Insurance claims, invoicing, and payment processing', language: 'Java', framework: 'Spring Boot', status: 'Active', version: 'v2.4.0', owner: 'Arjun Backend', repository: 'git/billing-service', coverage: 74, openIssues: 4, lastDeployed: t(-86400) },
    { id: 'SVC-003', name: 'Patient Portal API', description: 'Patient-facing REST API for appointments and records', language: 'TypeScript', framework: 'Express', status: 'In Development', version: 'v1.9.3-rc', owner: 'Sneha Frontend', repository: 'git/patient-portal-api', coverage: 61, openIssues: 5, lastDeployed: t(-7200) },
    { id: 'SVC-004', name: 'Lab Results Service', description: 'Integration with external lab systems via HL7 FHIR', language: 'Python', framework: 'FastAPI', status: 'Active', version: 'v3.1.0', owner: 'Priya Data', repository: 'git/lab-results-svc', coverage: 91, openIssues: 0, lastDeployed: t(-1800) },
    { id: 'SVC-005', name: 'Telemedicine Gateway', description: 'WebRTC signaling and session management', language: 'Go', framework: 'Gin', status: 'Active', version: 'v2.0.0', owner: 'Ravi Infra', repository: 'git/telehealth-gateway', coverage: 82, openIssues: 0, lastDeployed: t(-5400) },
  ],
  endpoints: [
    { id: 'API-001', serviceId: 'SVC-001', path: '/api/v4/patients', method: 'GET', description: 'List patients with filters', status: 'Active', authRequired: true, avgLatencyMs: 145, errorRate: 0.2, callsToday: 3840 },
    { id: 'API-002', serviceId: 'SVC-001', path: '/api/v4/patients/:id', method: 'GET', description: 'Get patient by ID', status: 'Active', authRequired: true, avgLatencyMs: 62, errorRate: 0.0, callsToday: 1250 },
    { id: 'API-003', serviceId: 'SVC-001', path: '/api/v4/patients/:id/records', method: 'POST', description: 'Create clinical record', status: 'Active', authRequired: true, avgLatencyMs: 210, errorRate: 1.4, callsToday: 480 },
    { id: 'API-004', serviceId: 'SVC-002', path: '/api/v2/claims', method: 'POST', description: 'Submit insurance claim', status: 'Active', authRequired: true, avgLatencyMs: 890, errorRate: 3.2, callsToday: 120 },
    { id: 'API-005', serviceId: 'SVC-003', path: '/api/v1/appointments', method: 'GET', description: 'Patient appointment list', status: 'Draft', authRequired: true, avgLatencyMs: 0, errorRate: 0, callsToday: 0 },
    { id: 'API-006', serviceId: 'SVC-004', path: '/api/v3/lab/results', method: 'GET', description: 'Fetch lab results via FHIR', status: 'Active', authRequired: true, avgLatencyMs: 340, errorRate: 0.5, callsToday: 720 },
  ],
  testSuites: [
    { id: 'TST-001', serviceId: 'SVC-001', name: 'EHR API Unit Tests', type: 'Unit', status: 'Passed', totalTests: 248, passedTests: 248, failedTests: 0, coverage: 89, durationSeconds: 42, lastRun: t(-3600) },
    { id: 'TST-002', serviceId: 'SVC-001', name: 'EHR Integration Tests', type: 'Integration', status: 'Passed', totalTests: 86, passedTests: 86, failedTests: 0, coverage: 0, durationSeconds: 124, lastRun: t(-3600) },
    { id: 'TST-003', serviceId: 'SVC-002', name: 'Billing Service Tests', type: 'Unit', status: 'Failed', totalTests: 192, passedTests: 183, failedTests: 9, coverage: 74, durationSeconds: 67, lastRun: t(-86400) },
    { id: 'TST-004', serviceId: 'SVC-003', name: 'Patient Portal Unit Tests', type: 'Unit', status: 'Running', totalTests: 140, passedTests: 97, failedTests: 2, coverage: 61, durationSeconds: 0, lastRun: t(-60) },
    { id: 'TST-005', serviceId: 'SVC-004', name: 'Lab Service Tests', type: 'Unit', status: 'Passed', totalTests: 312, passedTests: 312, failedTests: 0, coverage: 91, durationSeconds: 55, lastRun: t(-1800) },
  ],
  codeIssues: [
    { id: 'ISS-001', serviceId: 'SVC-003', title: 'Unparameterized query in appointment search', type: 'Security', severity: 'Critical', file: 'src/appointments/search.service.ts', line: 87, status: 'Open', detectedAt: t(-7200), suggestion: 'Use TypeORM QueryBuilder with parameterized conditions to prevent SQL injection.' },
    { id: 'ISS-002', serviceId: 'SVC-002', title: 'Error handler logs full request body including PHI', type: 'Security', severity: 'High', file: 'src/middleware/error.middleware.java', line: 34, status: 'Open', detectedAt: t(-86400), suggestion: 'Implement a PHI scrubber middleware that redacts sensitive fields before logging.' },
    { id: 'ISS-003', serviceId: 'SVC-002', title: 'N+1 query in invoice line items fetch', type: 'Performance', severity: 'High', file: 'src/invoices/invoice.repository.java', line: 156, status: 'Open', detectedAt: t(-172800), suggestion: 'Use JOIN FETCH or batch loading to resolve N+1 issue. Consider adding a DataLoader.' },
    { id: 'ISS-004', serviceId: 'SVC-001', title: 'Missing rate limiting on patient search endpoint', type: 'Security', severity: 'Medium', file: 'src/api/patient/search.controller.ts', line: 12, status: 'Open', detectedAt: t(-3600), suggestion: "Apply @Throttle() decorator or API gateway rate limit (e.g., 100 req/min per IP)." },
    { id: 'ISS-005', serviceId: 'SVC-003', title: 'Hardcoded test credentials in auth.config.ts', type: 'Security', severity: 'Critical', file: 'src/config/auth.config.ts', line: 8, status: 'Open', detectedAt: t(-7180), suggestion: 'Remove hardcoded credentials. Load from environment variables or secrets manager.' },
  ],
  builds: [
    { id: 'BLD-001', serviceId: 'SVC-001', version: 'v4.2.1', status: 'Success', triggeredBy: 'CI Bot', startedAt: t(-3700), durationSeconds: 342, coverage: 89, testsPassed: 334, testsFailed: 0 },
    { id: 'BLD-002', serviceId: 'SVC-002', version: 'v2.4.1-beta', status: 'Failed', triggeredBy: 'Arjun Backend', startedAt: t(-90000), durationSeconds: 198, coverage: 74, testsPassed: 183, testsFailed: 9 },
    { id: 'BLD-003', serviceId: 'SVC-004', version: 'v3.1.0', status: 'Success', triggeredBy: 'CI Bot', startedAt: t(-2000), durationSeconds: 128, coverage: 91, testsPassed: 312, testsFailed: 0 },
    { id: 'BLD-004', serviceId: 'SVC-003', version: 'v1.9.3-rc', status: 'Running', triggeredBy: 'Sneha Frontend', startedAt: t(-90), durationSeconds: 0, coverage: 0, testsPassed: 0, testsFailed: 0 },
  ],
};

export const developerApi = {
  getDashboardData: async (f: DevFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  runTests: async (suiteId: string) => ({ data: { success: true }, message: 'Tests triggered', status: 200 }),
  triggerBuild: async (serviceId: string) => ({ data: { success: true }, message: 'Build queued', status: 200 }),
  resolveIssue: async (issueId: string) => ({ data: { success: true }, message: 'Issue resolved', status: 200 }),
};
