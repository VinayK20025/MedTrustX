import type { SecurityEngineerData } from '../types/security-engineer.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: SecurityEngineerData = {
  metrics: {
    threatsDetected: 847,
    activeControls: 1240,
    blockedAttacks: 312,
    endpointCoverage: 98.4,
    ztaPoliciesEnforcing: 18,
  },
  firewallRules: [
    { id: 'FW-001', name: 'Block External SSH', direction: 'Inbound', source: '0.0.0.0/0', destination: '10.0.0.0/8', port: '22', protocol: 'TCP', action: 'Deny', enabled: true, hitCount: 14520 },
    { id: 'FW-002', name: 'Allow HTTPS Clinical', direction: 'Inbound', source: '10.12.0.0/16', destination: '10.10.1.0/24', port: '443', protocol: 'TCP', action: 'Allow', enabled: true, hitCount: 892400 },
    { id: 'FW-003', name: 'Block Telnet', direction: 'Inbound', source: '0.0.0.0/0', destination: '*', port: '23', protocol: 'TCP', action: 'Deny', enabled: true, hitCount: 3201 },
    { id: 'FW-004', name: 'Allow DNS Internal', direction: 'Outbound', source: '10.0.0.0/8', destination: '10.10.0.53', port: '53', protocol: 'UDP', action: 'Allow', enabled: true, hitCount: 4500000 },
    { id: 'FW-005', name: 'Block C2 Range (Threat Intel)', direction: 'Outbound', source: '*', destination: '185.220.0.0/16', port: '*', protocol: 'ANY', action: 'Deny', enabled: true, hitCount: 78 },
  ],
  endpoints: [
    { id: 'EP-001', hostname: 'ICU-WKST-01', department: 'ICU', os: 'Windows 11 23H2', edrAgent: 'CrowdStrike Falcon v7.2', status: 'Protected', lastScan: t(-1800), threatsBlocked: 3 },
    { id: 'EP-002', hostname: 'ER-NURSE-04', department: 'Emergency', os: 'Windows 11 23H2', edrAgent: 'CrowdStrike Falcon v7.2', status: 'Protected', lastScan: t(-3600), threatsBlocked: 0 },
    { id: 'EP-003', hostname: 'RAD-DICOM-SRV', department: 'Radiology', os: 'Ubuntu 22.04 LTS', edrAgent: 'CrowdStrike Falcon v7.2', status: 'At Risk', lastScan: t(-86400 * 3), threatsBlocked: 1 },
    { id: 'EP-004', hostname: 'ADMIN-PC-12', department: 'Administration', os: 'Windows 10 22H2', edrAgent: 'Missing', status: 'Offline', lastScan: t(-86400 * 14), threatsBlocked: 0 },
    { id: 'EP-005', hostname: 'LAB-ANALYZER-02', department: 'Pathology', os: 'Embedded Linux', edrAgent: 'CrowdStrike Falcon v7.2', status: 'Quarantined', lastScan: t(-600), threatsBlocked: 12 },
  ],
  ztaPolicies: [
    { id: 'ZTA-01', policyName: 'Verify Identity (MFA Required)', description: 'All access requires multi-factor authentication via TOTP or hardware key.', enforcement: 'Enforcing', scope: 'All Users', conditions: 'MFA + Valid Session' },
    { id: 'ZTA-02', policyName: 'Device Trust Verification', description: 'Only managed devices with valid EDR agents and up-to-date patches can access clinical systems.', enforcement: 'Enforcing', scope: 'Clinical Staff', conditions: 'EDR Active + Patched + Managed' },
    { id: 'ZTA-03', policyName: 'Micro-Segmentation (EHR Network)', description: 'EHR network isolated from general corporate network. Cross-segment traffic denied by default.', enforcement: 'Enforcing', scope: 'EHR Systems', conditions: 'Network Segment + Auth' },
    { id: 'ZTA-04', policyName: 'Geo-Fencing (Location Check)', description: 'Block access from non-approved geographic locations. Hospital campus and approved VPN only.', enforcement: 'Audit Mode', scope: 'All Users', conditions: 'Approved Location/VPN' },
  ],
  networkEvents: [
    { id: 'NE-001', eventType: 'IPS Block', sourceIp: '185.220.101.44', destIp: '10.10.1.5', severity: 'Critical', action: 'Blocked', timestamp: t(-120) },
    { id: 'NE-002', eventType: 'IDS Alert', sourceIp: '10.14.8.99', destIp: '10.10.0.53', severity: 'High', action: 'Alerted', timestamp: t(-600) },
    { id: 'NE-003', eventType: 'Scan Detected', sourceIp: '192.168.45.10', destIp: '10.0.0.0/8', severity: 'Medium', action: 'Logged', timestamp: t(-1800) },
    { id: 'NE-004', eventType: 'Anomaly', sourceIp: '10.12.5.55', destIp: '45.33.22.11', severity: 'Critical', action: 'Blocked', timestamp: t(-300) },
  ],
  hardening: [
    { id: 'HC-01', controlName: 'OS Security Patches (Latest)', category: 'Patching', status: 'Applied', benchmark: 'CIS Level 1' },
    { id: 'HC-02', controlName: 'Disable SMBv1', category: 'Configuration', status: 'Applied', benchmark: 'CIS Level 1' },
    { id: 'HC-03', controlName: 'Enforce TLS 1.3 Only', category: 'Encryption', status: 'Applied', benchmark: 'NIST 800-53' },
    { id: 'HC-04', controlName: 'Remove Default Admin Accounts', category: 'Access Control', status: 'Pending', benchmark: 'CIS Level 2' },
    { id: 'HC-05', controlName: 'Enable Audit Logging (All)', category: 'Configuration', status: 'Applied', benchmark: 'HIPAA §164.312' },
  ]
};

export const securityEngineerApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  toggleFirewallRule: async (ruleId: string) => ({ data: { success: true }, message: 'Rule Toggled', status: 200 }),
  quarantineEndpoint: async (endpointId: string) => ({ data: { success: true }, message: 'Endpoint Quarantined', status: 200 }),
  enforcePolicyMode: async (policyId: string, mode: string) => ({ data: { success: true }, message: `Policy set to ${mode}`, status: 200 }),
};
