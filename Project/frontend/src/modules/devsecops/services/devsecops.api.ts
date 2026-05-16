import type { DevSecOpsData } from '../types/devsecops.types';

export interface DevSecOpsFilters { status?: string; severity?: string; }

const t = (offsetSec: number) => new Date(Date.now() + offsetSec * 1000).toISOString();

const mockData: DevSecOpsData = {
  metrics: {
    scansToday: 20,
    openVulnerabilities: 13,
    criticalVulnerabilities: 2,
    pipelinePassRate: 78,
    complianceScore: 94,
    blockedDeployments: 3,
  },
  pipelines: [
    { id: 'PLN-001', name: 'EHR API Build & Deploy', application: 'Epic EHR Backend', branch: 'main', securityStatus: 'Passed', lastRun: t(-3600) },
    { id: 'PLN-002', name: 'Patient Portal Frontend', application: 'Patient Portal', branch: 'feature/auth-v2', securityStatus: 'Failed', failedGate: 'SAST', lastRun: t(-7200) },
    { id: 'PLN-003', name: 'Billing Service Deploy', application: 'Billing Microservice', branch: 'release/2.4.1', securityStatus: 'Failed', failedGate: 'SCA', lastRun: t(-10800) },
    { id: 'PLN-004', name: 'PACS Imaging Service', application: 'Radiology PACS', branch: 'main', securityStatus: 'Pending', lastRun: t(-300) },
    { id: 'PLN-005', name: 'Lab Results API', application: 'Lab Services', branch: 'main', securityStatus: 'Passed', lastRun: t(-1800) },
  ],
  scans: [
    { id: 'SCN-001', pipelineId: 'PLN-002', application: 'Patient Portal', scanType: 'SAST', status: 'Failed', issuesFound: 4, criticalCount: 1, highCount: 2, durationSeconds: 87, triggeredAt: t(-7200), branch: 'feature/auth-v2' },
    { id: 'SCN-002', pipelineId: 'PLN-003', application: 'Billing Microservice', scanType: 'SCA', status: 'Failed', issuesFound: 2, criticalCount: 1, highCount: 1, durationSeconds: 45, triggeredAt: t(-10800), branch: 'release/2.4.1' },
    { id: 'SCN-003', pipelineId: 'PLN-001', application: 'Epic EHR Backend', scanType: 'SAST', status: 'Passed', issuesFound: 0, criticalCount: 0, highCount: 0, durationSeconds: 124, triggeredAt: t(-3600), branch: 'main' },
    { id: 'SCN-004', pipelineId: 'PLN-001', application: 'Epic EHR Backend', scanType: 'DAST', status: 'Passed', issuesFound: 1, criticalCount: 0, highCount: 0, durationSeconds: 215, triggeredAt: t(-3400), branch: 'main' },
    { id: 'SCN-005', pipelineId: 'PLN-001', application: 'Epic EHR Backend', scanType: 'Container Scan', status: 'Passed', issuesFound: 0, criticalCount: 0, highCount: 0, durationSeconds: 61, triggeredAt: t(-3200), branch: 'main' },
    { id: 'SCN-006', pipelineId: 'PLN-002', application: 'Patient Portal', scanType: 'Secret Scan', status: 'Passed', issuesFound: 0, criticalCount: 0, highCount: 0, durationSeconds: 22, triggeredAt: t(-7180), branch: 'feature/auth-v2' },
  ],
  vulnerabilities: [
    { id: 'VLN-001', scanId: 'SCN-001', title: 'SQL Injection via unparameterized patient search query', description: 'Patient search endpoint constructs SQL queries using unsanitized user input, enabling SQL injection attacks.', severity: 'Critical', cveId: 'CVE-2024-3892', affectedFile: 'src/api/patient/search.controller.ts', status: 'Open', detectedAt: t(-7200), remediationSuggestion: 'Use parameterized queries or ORM with built-in SQL escaping. Never interpolate user input directly into SQL strings.' },
    { id: 'VLN-002', scanId: 'SCN-002', title: 'Outdated Apache Commons (CVE-2024-1234) in Billing Service', description: 'org.apache.commons:commons-text:1.9 contains a known RCE vulnerability triggered by crafted template expressions.', severity: 'Critical', cveId: 'CVE-2024-1234', affectedDependency: 'org.apache.commons:commons-text:1.9', status: 'In Remediation', detectedAt: t(-10800), remediationSuggestion: 'Upgrade to org.apache.commons:commons-text:1.11.0 or higher which contains the patch.' },
    { id: 'VLN-003', scanId: 'SCN-001', title: 'Insecure JWT secret stored in hardcoded config', description: 'JWT signing secret found hardcoded in auth.config.ts. If exposed, all tokens can be forged.', severity: 'High', affectedFile: 'src/config/auth.config.ts', status: 'Open', detectedAt: t(-7200), remediationSuggestion: 'Move JWT secret to environment variables and rotate immediately. Use a secrets manager (HashiCorp Vault / AWS Secrets Manager).' },
    { id: 'VLN-004', scanId: 'SCN-004', title: 'Missing X-Frame-Options header on patient portal', description: 'Patient portal API responses do not include X-Frame-Options, making it susceptible to clickjacking attacks.', severity: 'Medium', status: 'Open', detectedAt: t(-3400), remediationSuggestion: "Add 'X-Frame-Options: DENY' header in API gateway middleware for all responses." },
    { id: 'VLN-005', scanId: 'SCN-001', title: 'Sensitive PHI logged in plain text on error handler', description: 'Global error handler logs the full request body including PHI on 500 errors, violating HIPAA minimum necessary rule.', severity: 'High', status: 'Open', detectedAt: t(-7190), remediationSuggestion: 'Scrub PHI fields from error logs. Apply a PII filter middleware before logging.' },
  ],
  policies: [
    { id: 'POL-001', name: 'Block Critical Vulnerabilities', description: 'Prevents deployment if any critical severity vulnerability is detected in SAST or SCA scan.', rule: 'IF critical_vuln_count > 0 THEN block', action: 'Block', status: 'Active', standard: 'OWASP Top 10', lastTriggered: t(-7200), blockCount: 12 },
    { id: 'POL-002', name: 'No Hardcoded Secrets', description: 'Blocks pipeline if secret scan detects API keys, passwords, or tokens in source code.', rule: 'IF secrets_found = true THEN block', action: 'Block', status: 'Active', standard: 'ISO 27001', blockCount: 3 },
    { id: 'POL-003', name: 'Dependency License Compliance', description: 'Warns if any third-party dependency uses a non-approved license (GPL, AGPL).', rule: 'IF license NOT IN approved_list THEN warn', action: 'Warn', status: 'Active', standard: 'HIPAA', blockCount: 0 },
    { id: 'POL-004', name: 'DAST Minimum Score Requirement', description: 'Requires DAST scan to pass with zero high-severity findings before production deploy.', rule: 'IF dast_high_count > 0 AND env = production THEN block', action: 'Block', status: 'Active', standard: 'OWASP Top 10', blockCount: 5 },
    { id: 'POL-005', name: 'PHI Exposure Detection', description: 'Warns when PHI patterns detected in log outputs or API responses during DAST.', rule: 'IF phi_exposure_detected THEN report', action: 'Report', status: 'Active', standard: 'HIPAA', lastTriggered: t(-7190), blockCount: 0 },
  ],
  complianceControls: [
    { standard: 'OWASP Top 10', control: 'A03 – Injection', description: 'SQL, NoSQL, OS injection prevention', status: 'Non-Compliant', automatedCheck: true, lastChecked: t(-7200) },
    { standard: 'OWASP Top 10', control: 'A02 – Cryptographic Failures', description: 'Sensitive data exposure, weak crypto', status: 'Partial', automatedCheck: true, lastChecked: t(-3600) },
    { standard: 'HIPAA', control: 'PHI Minimum Necessary', description: 'Limit PHI exposure in logs and responses', status: 'Non-Compliant', automatedCheck: true, lastChecked: t(-7190) },
    { standard: 'ISO 27001', control: 'A.8.8 – Vulnerability Management', description: 'Timely identification of vulnerabilities', status: 'Partial', automatedCheck: true, lastChecked: t(-3600) },
    { standard: 'ISO 27001', control: 'A.9.4.2 – Secure Authentication', description: 'Secure login and session management', status: 'Compliant', automatedCheck: true, lastChecked: t(-3600) },
    { standard: 'CIS Benchmark', control: 'CIS-L1-3.1 – Container Hardening', description: 'No critical CVEs in container base images', status: 'Compliant', automatedCheck: true, lastChecked: t(-3200) },
  ],
  alerts: [
    { id: 'ALT-001', title: 'Critical SQL injection detected in Patient Portal — deployment blocked', severity: 'Critical', status: 'Firing', application: 'Patient Portal', firedAt: t(-7200) },
    { id: 'ALT-002', title: 'PHI exposed in EHR error logs — HIPAA policy triggered', severity: 'High', status: 'Acknowledged', application: 'Epic EHR Backend', firedAt: t(-7190) },
    { id: 'ALT-003', title: 'Outdated dependency with RCE vulnerability in Billing Service', severity: 'Critical', status: 'Firing', application: 'Billing Microservice', firedAt: t(-10800) },
  ],
};

export const devSecOpsApi = {
  getDashboardData: async (f: DevSecOpsFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  acceptVulnerability: async (id: string) => ({ data: { success: true }, message: 'Vulnerability accepted', status: 200 }),
  togglePolicy: async (id: string, status: string) => ({ data: { success: true }, message: 'Policy updated', status: 200 }),
  acknowledgeAlert: async (id: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
