/**
 * MedTrustX — Wazuh SIEM/XDR Module Types
 * Covers: Agents, Alerts, Vulnerabilities, FIM, Compliance, SCA, Rules
 */

export type AlertLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AgentStatus = 'active' | 'disconnected' | 'never_connected' | 'pending';
export type VulnSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'passed' | 'failed' | 'not_applicable';
export type RuleGroup = 'authentication' | 'fim' | 'vulnerability' | 'sca' | 'network' | 'malware' | 'web';

export interface WazuhAgent {
  id: string;
  name: string;
  ip: string;
  os: string;
  version: string;
  status: AgentStatus;
  group: string;
  lastKeepAlive: string;
  riskScore: number;
}

export interface WazuhAlert {
  id: string;
  timestamp: string;
  rule: {
    id: string;
    level: AlertLevel;
    description: string;
    groups: RuleGroup[];
    mitre?: { id: string; tactic: string; technique: string };
  };
  agent: { id: string; name: string; ip: string };
  data: Record<string, string>;
  location: string;
  severity: AlertSeverity;
  acknowledged: boolean;
}

export interface WazuhVulnerability {
  id: string;
  cve: string;
  package: string;
  version: string;
  fixedVersion?: string;
  severity: VulnSeverity;
  cvss3Score: number;
  agentId: string;
  agentName: string;
  published: string;
  status: 'open' | 'mitigated' | 'accepted';
}

export interface WazuhFimEvent {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  file: string;
  eventType: 'added' | 'modified' | 'deleted';
  md5Before?: string;
  md5After?: string;
  user: string;
}

export interface WazuhSCAResult {
  id: string;
  policyId: string;
  policyName: string;
  agentId: string;
  agentName: string;
  passed: number;
  failed: number;
  notApplicable: number;
  score: number;
  lastScan: string;
}

export interface WazuhRule {
  id: string;
  level: AlertLevel;
  description: string;
  group: RuleGroup;
  status: 'active' | 'disabled';
  firedCount: number;
  lastFired?: string;
}

export interface WazuhKPI {
  totalAgents: number;
  activeAgents: number;
  criticalAlerts: number;
  highAlerts: number;
  openVulnerabilities: number;
  criticalVulnerabilities: number;
  complianceScore: number;
  fim24h: number;
}

export interface WazuhDashboardData {
  kpis: WazuhKPI;
  agents: WazuhAgent[];
  alerts: WazuhAlert[];
  vulnerabilities: WazuhVulnerability[];
  fimEvents: WazuhFimEvent[];
  scaResults: WazuhSCAResult[];
  rules: WazuhRule[];
}
