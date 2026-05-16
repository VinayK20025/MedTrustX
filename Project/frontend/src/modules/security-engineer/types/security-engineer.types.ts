/**
 * MedTrustX — Security Engineer Platform Types
 * Firewalls, EDR/XDR, Zero Trust, IDS/IPS, Hardening.
 */

export type RuleAction = 'Allow' | 'Deny' | 'Log' | 'Alert';
export type EndpointStatus = 'Protected' | 'At Risk' | 'Offline' | 'Quarantined';
export type PolicyEnforcement = 'Enforcing' | 'Audit Mode' | 'Disabled';

export interface FirewallRule {
  id: string;
  name: string;
  direction: 'Inbound' | 'Outbound';
  source: string;
  destination: string;
  port: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ANY';
  action: RuleAction;
  enabled: boolean;
  hitCount: number;
}

export interface EndpointDevice {
  id: string;
  hostname: string;
  department: string;
  os: string;
  edrAgent: string;
  status: EndpointStatus;
  lastScan: string;
  threatsBlocked: number;
}

export interface ZtaPolicy {
  id: string;
  policyName: string;
  description: string;
  enforcement: PolicyEnforcement;
  scope: string; // e.g., 'All Users', 'Clinical Staff'
  conditions: string; // e.g., 'MFA + Device Trust + Location'
}

export interface NetworkEvent {
  id: string;
  eventType: 'IDS Alert' | 'IPS Block' | 'Anomaly' | 'Scan Detected';
  sourceIp: string;
  destIp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  action: 'Blocked' | 'Logged' | 'Alerted';
  timestamp: string;
}

export interface HardeningControl {
  id: string;
  controlName: string;
  category: 'Patching' | 'Configuration' | 'Access Control' | 'Encryption';
  status: 'Applied' | 'Pending' | 'Failed' | 'Not Applicable';
  benchmark: string; // e.g., 'CIS Level 1'
}

export interface SecurityEngineerMetrics {
  threatsDetected: number;
  activeControls: number;
  blockedAttacks: number;
  endpointCoverage: number; // percentage
  ztaPoliciesEnforcing: number;
}

export interface SecurityEngineerData {
  metrics: SecurityEngineerMetrics;
  firewallRules: FirewallRule[];
  endpoints: EndpointDevice[];
  ztaPolicies: ZtaPolicy[];
  networkEvents: NetworkEvent[];
  hardening: HardeningControl[];
}
