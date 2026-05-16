/**
 * MedTrustX — Software Developer (Role 153) Types
 * API development, service management, code quality, testing & build pipeline.
 */

export type ServiceStatus = 'Active' | 'Deprecated' | 'In Development' | 'Paused';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type BuildStatus = 'Success' | 'Failed' | 'Running' | 'Queued';
export type TestStatus = 'Passed' | 'Failed' | 'Skipped' | 'Running';

export interface MicroService {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  status: ServiceStatus;
  version: string;
  owner: string;
  repository: string;
  coverage: number;  // percentage
  openIssues: number;
  lastDeployed: string;
}

export interface ApiEndpoint {
  id: string;
  serviceId: string;
  path: string;
  method: HttpMethod;
  description: string;
  status: 'Active' | 'Deprecated' | 'Draft';
  authRequired: boolean;
  avgLatencyMs: number;
  errorRate: number;  // percentage
  callsToday: number;
}

export interface TestSuite {
  id: string;
  serviceId: string;
  name: string;
  type: 'Unit' | 'Integration' | 'E2E';
  status: TestStatus;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
  durationSeconds: number;
  lastRun: string;
}

export interface CodeIssue {
  id: string;
  serviceId: string;
  title: string;
  type: 'Security' | 'Bug' | 'Code Smell' | 'Performance';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  file: string;
  line: number;
  status: 'Open' | 'Resolved' | 'Accepted';
  detectedAt: string;
  suggestion: string;
}

export interface BuildRecord {
  id: string;
  serviceId: string;
  version: string;
  status: BuildStatus;
  triggeredBy: string;
  startedAt: string;
  durationSeconds: number;
  coverage: number;
  testsPassed: number;
  testsFailed: number;
}

export interface DevMetrics {
  buildSuccessRate: number;
  avgCodeCoverage: number;
  openIssues: number;
  deploymentsToday: number;
  activeServices: number;
  failedBuildsToday: number;
}

export interface DeveloperData {
  metrics: DevMetrics;
  services: MicroService[];
  endpoints: ApiEndpoint[];
  testSuites: TestSuite[];
  codeIssues: CodeIssue[];
  builds: BuildRecord[];
}
