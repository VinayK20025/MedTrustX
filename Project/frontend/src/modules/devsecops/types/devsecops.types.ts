/**
 * MedTrustX — DevSecOps Engineer (Role 152) Types
 * Secure CI/CD, automated compliance, vulnerability management & policy enforcement.
 */

export type ScanType = 'SAST' | 'DAST' | 'SCA' | 'Secret Scan' | 'Container Scan';
export type VulnSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
export type SecurityStandard = 'OWASP Top 10' | 'ISO 27001' | 'HIPAA' | 'NIST' | 'CIS Benchmark';
export type PolicyStatus = 'Active' | 'Inactive' | 'Override';

export interface SecurityScan {
  id: string;
  pipelineId: string;
  application: string;
  scanType: ScanType;
  status: 'Passed' | 'Failed' | 'Running' | 'Skipped';
  issuesFound: number;
  criticalCount: number;
  highCount: number;
  durationSeconds: number;
  triggeredAt: string;
  branch: string;
}

export interface Vulnerability {
  id: string;
  scanId: string;
  title: string;
  description: string;
  severity: VulnSeverity;
  cveId?: string;
  affectedFile?: string;
  affectedDependency?: string;
  status: 'Open' | 'In Remediation' | 'Accepted' | 'Fixed';
  detectedAt: string;
  remediationSuggestion: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rule: string;
  action: 'Block' | 'Warn' | 'Report';
  status: PolicyStatus;
  standard: SecurityStandard;
  lastTriggered?: string;
  blockCount: number;
}

export interface ComplianceControl {
  standard: SecurityStandard;
  control: string;
  description: string;
  status: 'Compliant' | 'Non-Compliant' | 'Partial';
  automatedCheck: boolean;
  lastChecked: string;
}

export interface SecureAlert {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Firing' | 'Acknowledged' | 'Resolved';
  application: string;
  firedAt: string;
}

export interface DevSecOpsMetrics {
  scansToday: number;
  openVulnerabilities: number;
  criticalVulnerabilities: number;
  pipelinePassRate: number;   // percentage
  complianceScore: number;    // percentage
  blockedDeployments: number;
}

export interface SecurePipeline {
  id: string;
  name: string;
  application: string;
  branch: string;
  securityStatus: 'Passed' | 'Failed' | 'Pending' | 'Bypassed';
  failedGate?: ScanType;
  lastRun: string;
}

export interface DevSecOpsData {
  metrics: DevSecOpsMetrics;
  pipelines: SecurePipeline[];
  scans: SecurityScan[];
  vulnerabilities: Vulnerability[];
  policies: SecurityPolicy[];
  complianceControls: ComplianceControl[];
  alerts: SecureAlert[];
}
