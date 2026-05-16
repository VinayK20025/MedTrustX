import { apiGet, apiPost, apiPut } from '@/services/api';
import type { ThreatDetectionData, DetectionAlert, DetectionRule, BehavioralAnomaly, DetectionEngine } from '../types/threat-detection.types';

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

/* ── Rich Mock Data ─────────────────────────────────── */
const mockAlerts: DetectionAlert[] = [
  { id: 'DTA-001', title: 'Ransomware Staging Detected',         description: 'Mass file encryption activity observed on EHR app server. LockBit 3.0 signature match.',          severity: 'critical', category: 'endpoint',  status: 'investigating', mitre: { tactic: 'Impact',              technique: 'Data Encrypted for Impact',        id: 'T1486'   }, source: { engine: 'EDR/XDR Falcon', ruleId: 'YARA-LKB-001' }, asset: { hostname: 'ehr-app-01',     ip: '10.10.1.20', type: 'server'      }, timestamp: ago(300000),   score: 99, assignee: 'soc-analyst-1' },
  { id: 'DTA-002', title: 'Lateral Movement via PsExec',         description: 'Suspicious PsExec usage detected from DC01 to multiple workstations within 2 min window.',           severity: 'critical', category: 'network',   status: 'open',          mitre: { tactic: 'Lateral Movement',    technique: 'Remote Services',                  id: 'T1021.002'}, source: { engine: 'Suricata IDS',   ruleId: 'SUR-NET-4421' }, asset: { hostname: 'dc01-medtrustx', ip: '10.10.2.10', type: 'server'      }, timestamp: ago(600000),   score: 96 },
  { id: 'DTA-003', title: 'C2 Beacon — Cobalt Strike',           description: 'Periodic beacon to known C2 IP (185.220.101.44) at 60s intervals from radiology workstation.',       severity: 'high',     category: 'network',   status: 'open',          mitre: { tactic: 'Command & Control',   technique: 'Application Layer Protocol',       id: 'T1071'   }, source: { engine: 'NDR Darktrace',  ruleId: 'NDR-C2-0091'  }, asset: { hostname: 'radiology-ws-12',ip: '10.10.3.112',type: 'workstation'}, timestamp: ago(1800000),  score: 93 },
  { id: 'DTA-004', title: 'Privilege Escalation — sudo Abuse',   description: 'Non-privileged service account executed sudo -i on EHR database server outside change window.',    severity: 'high',     category: 'identity',  status: 'open',          mitre: { tactic: 'Privilege Escalation', technique: 'Abuse Elevation Control',          id: 'T1548'   }, source: { engine: 'UEBA Exabeam',   ruleId: 'UEBA-PRV-003' }, asset: { hostname: 'db-ehr-primary', ip: '10.10.1.50', type: 'server'      }, timestamp: ago(3600000),  score: 87, assignee: 'ir-lead' },
  { id: 'DTA-005', title: 'DNS Tunneling Exfiltration Attempt',  description: 'Abnormally long DNS TXT queries detected suggesting data exfiltration via DNS tunneling.',          severity: 'high',     category: 'data',      status: 'contained',     mitre: { tactic: 'Exfiltration',        technique: 'Exfiltration Over Alternative Protocol',id: 'T1048'  }, source: { engine: 'Suricata IDS',   ruleId: 'SUR-DNS-0033' }, asset: { hostname: 'vpn-gateway',    ip: '10.0.0.5',   type: 'network'    }, timestamp: ago(7200000),  score: 82 },
  { id: 'DTA-006', title: 'Insider Threat — Bulk PHI Download',  description: 'Staff account accessed and downloaded 4,200 patient records outside normal business hours.',        severity: 'medium',   category: 'data',      status: 'investigating', mitre: { tactic: 'Collection',          technique: 'Data from Information Repositories',id: 'T1213'   }, source: { engine: 'UEBA Exabeam',   ruleId: 'UEBA-INS-007' }, asset: { hostname: 'ehr-portal',     ip: '10.10.1.30', type: 'server'      }, timestamp: ago(86400000), score: 78, assignee: 'dpo' },
  { id: 'DTA-007', title: 'Supply Chain Risk — Package Backdoor',description: 'NPM package "medtrustx-utils" v2.1.4 flagged by Sigstore verification — possible backdoor.',       severity: 'medium',   category: 'supply_chain',status: 'resolved',    mitre: { tactic: 'Initial Access',      technique: 'Supply Chain Compromise',          id: 'T1195'   }, source: { engine: 'SIEM-Correlation',ruleId: 'SIG-SC-0002'  }, asset: { hostname: 'ci-build-01',    ip: '10.10.9.10', type: 'server'      }, timestamp: ago(172800000),score: 71 },
];

const mockRules: DetectionRule[] = [
  { id: 'R-001', name: 'LockBit Ransomware YARA Signature', description: 'YARA match on LockBit 3.0 binary patterns',        category: 'endpoint',      status: 'active',   severity: 'critical', engine: 'YARA',         hitCount: 3,   falsePositiveRate: 0.2,  lastTriggered: ago(300000),   author: 'ThreatIntel-Team', version: '3.2.1' },
  { id: 'R-002', name: 'PsExec Lateral Movement',           description: 'Sigma rule: PsExec spawned from DC within 2min',   category: 'network',       status: 'active',   severity: 'critical', engine: 'Sigma',        hitCount: 12,  falsePositiveRate: 1.1,  lastTriggered: ago(600000),   author: 'SOC-Analyst',      version: '1.4.0' },
  { id: 'R-003', name: 'Cobalt Strike Beacon Pattern',      description: 'Suricata: CS sleep jitter & malleable profile',   category: 'network',       status: 'active',   severity: 'high',     engine: 'Suricata',     hitCount: 28,  falsePositiveRate: 0.5,  lastTriggered: ago(1800000),  author: 'ThreatIntel-Team', version: '2.0.0' },
  { id: 'R-004', name: 'UEBA Privilege Anomaly',            description: 'ML model: sudo/admin execution outside baseline', category: 'identity',      status: 'active',   severity: 'high',     engine: 'ML-Model',     hitCount: 7,   falsePositiveRate: 3.4,  lastTriggered: ago(3600000),  author: 'AI-SecOps',        version: '5.1.0' },
  { id: 'R-005', name: 'DNS Tunneling Detection',           description: 'Suricata: DNS TXT len > 200 chars pattern',       category: 'network',       status: 'active',   severity: 'high',     engine: 'Suricata',     hitCount: 44,  falsePositiveRate: 2.0,  lastTriggered: ago(7200000),  author: 'SOC-Analyst',      version: '1.1.3' },
  { id: 'R-006', name: 'PHI Bulk Download Alert',           description: 'SIEM: >500 PHI records downloaded in <1hr',      category: 'data',          status: 'active',   severity: 'medium',   engine: 'Custom',       hitCount: 3,   falsePositiveRate: 5.0,  lastTriggered: ago(86400000), author: 'DPO-Team',         version: '2.2.0' },
  { id: 'R-007', name: 'Supply Chain Sigstore Check',       description: 'CI/CD artifact signed integrity validation',      category: 'supply_chain',  status: 'active',   severity: 'medium',   engine: 'Custom',       hitCount: 1,   falsePositiveRate: 0.0,  lastTriggered: ago(172800000),author: 'DevSecOps',        version: '1.0.0' },
  { id: 'R-008', name: 'Cloud Resource Anomaly (ML)',       description: 'ML model: abnormal cloud API call volume spike',  category: 'cloud',         status: 'testing',  severity: 'medium',   engine: 'ML-Model',     hitCount: 0,   falsePositiveRate: 0.0,  author: 'AI-SecOps',        version: '1.0.0-beta' },
];

const mockAnomalies: BehavioralAnomaly[] = [
  { id: 'ANO-001', type: 'lateral_movement',     entity: 'dc01-medtrustx',  entityType: 'host',  baselineDeviation: 9.2, riskScore: 97, description: '14 SMB connections in 2 min — 9.2σ above baseline',          timestamp: ago(600000),   acknowledged: false },
  { id: 'ANO-002', type: 'data_exfiltration',    entity: 'nurse-user-04',   entityType: 'user',  baselineDeviation: 7.8, riskScore: 88, description: 'Downloaded 4200 records — 7.8σ above daily avg (12 records)',timestamp: ago(86400000), acknowledged: false },
  { id: 'ANO-003', type: 'c2_communication',     entity: 'radiology-ws-12', entityType: 'host',  baselineDeviation: 12.1,riskScore: 95, description: 'Periodic 60s beacon pattern — 12.1σ deviation from peers',   timestamp: ago(1800000),  acknowledged: false },
  { id: 'ANO-004', type: 'privilege_escalation', entity: 'deploy-svc',      entityType: 'user',  baselineDeviation: 6.3, riskScore: 82, description: 'sudo -i executed outside change window — 6.3σ above baseline',timestamp: ago(3600000),  acknowledged: true  },
  { id: 'ANO-005', type: 'brute_force',          entity: '185.220.101.32',  entityType: 'host',  baselineDeviation: 15.0,riskScore: 91, description: '480 SSH failed logins in 10 min from external IP',            timestamp: ago(7200000),  acknowledged: true  },
];

const mockEngines: DetectionEngine[] = [
  { id: 'ENG-1', name: 'Suricata IDS/IPS',      type: 'IDS/IPS',          status: 'online',   version: '7.0.3', alertsToday: 342,  eventsPerSec: 28400 },
  { id: 'ENG-2', name: 'CrowdStrike Falcon EDR', type: 'EDR/XDR',          status: 'online',   version: '7.15',  alertsToday: 89,   eventsPerSec: 1200  },
  { id: 'ENG-3', name: 'Exabeam UEBA',           type: 'UEBA',             status: 'online',   version: '2024.3',alertsToday: 21,   eventsPerSec: 4100  },
  { id: 'ENG-4', name: 'Darktrace NDR',           type: 'NDR',              status: 'degraded', version: '6.1.2', alertsToday: 14,   eventsPerSec: 980   },
  { id: 'ENG-5', name: 'SIEM Correlation Engine', type: 'SIEM-Correlation', status: 'online',   version: '4.0.1', alertsToday: 531,  eventsPerSec: 62000 },
];

const mockMetrics: DetectionMetrics = {
  totalAlerts: 7, criticalOpen: 2, highOpen: 3,
  meanTimeToDetect: 4.2, meanTimeToRespond: 18.7,
  falsePositiveRate: 2.1, rulesCoverage: 96.4, enginesOnline: 4,
};

/* ── API Client ─────────────────────────────────────── */
export const threatDetectionApi = {
  getDashboard: async (): Promise<{ data: ThreatDetectionData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: ThreatDetectionData }>('/api/v1/threat-detection/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: { metrics: mockMetrics, alerts: mockAlerts, rules: mockRules, anomalies: mockAnomalies, engines: mockEngines }, message: 'OK (Mock)', status: 200 };
    }
  },

  updateAlertStatus: async (alertId: string, status: string) => {
    try {
      return await apiPut<{ data: { success: boolean } }>(`/api/v1/threat-detection/alerts/${alertId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Updated (Mock)', status: 200 };
    }
  },

  toggleRule: async (ruleId: string) => {
    try {
      return await apiPost<{ data: { success: boolean } }>(`/api/v1/threat-detection/rules/${ruleId}/toggle`, {});
    } catch {
      return { data: { success: true }, message: 'Toggled (Mock)', status: 200 };
    }
  },

  acknowledgeAnomaly: async (anomalyId: string) => {
    try {
      return await apiPut<{ data: { success: boolean } }>(`/api/v1/threat-detection/anomalies/${anomalyId}/acknowledge`, {});
    } catch {
      return { data: { success: true }, message: 'Acknowledged (Mock)', status: 200 };
    }
  },
};
