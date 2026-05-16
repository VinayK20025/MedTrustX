/**
 * MedTrustX — QA / Test Engineer (Role 154 per spec) Types
 */
export type TestType = 'Functional' | 'Security' | 'Performance' | 'Regression' | 'E2E' | 'Unit';
export type DefectSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type TestRunStatus = 'Passed' | 'Failed' | 'Blocked' | 'Skipped' | 'Running';

export interface TestSuite {
  id: string;
  name: string;
  module: string;
  type: TestType;
  totalCases: number;
  passed: number;
  failed: number;
  blocked: number;
  coverage: number;
  lastRun: string;
  status: TestRunStatus;
}

export interface TestCase {
  id: string;
  suiteId: string;
  title: string;
  type: TestType;
  status: TestRunStatus;
  duration: number;
  errorMessage?: string;
  linkedDefect?: string;
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  module: string;
  severity: DefectSeverity;
  status: 'Open' | 'In Fix' | 'Resolved' | 'Closed' | 'Reopened';
  assignee: string;
  linkedTestCase?: string;
  detectedAt: string;
  stepsToReproduce: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  type: string;
  severity: DefectSeverity;
  endpoint: string;
  status: 'Open' | 'Fixed' | 'Accepted';
  detectedAt: string;
  cveId?: string;
  remediation: string;
}

export interface CoverageModule {
  module: string;
  coverage: number;
  totalCases: number;
  automated: number;
}

export interface QAMetrics {
  totalTests: number;
  passRate: number;
  openDefects: number;
  criticalDefects: number;
  avgCoverage: number;
  automationRate: number;
}

export interface QAData {
  metrics: QAMetrics;
  suites: TestSuite[];
  cases: TestCase[];
  defects: Defect[];
  securityFindings: SecurityFinding[];
  coverage: CoverageModule[];
}
