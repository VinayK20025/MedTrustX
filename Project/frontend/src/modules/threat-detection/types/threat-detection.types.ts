/**
 * MedTrustX — Threat Detection Service Types
 * Real-time detection engine: behavioral analytics, network IDS, ML anomaly scoring,
 * rule management, detection alerts, and remediation playbooks.
 */

export type DetectionSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type DetectionStatus    = 'open' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
export type DetectionCategory  = 'network' | 'endpoint' | 'identity' | 'data' | 'cloud' | 'supply_chain';
export type RuleStatus         = 'active' | 'disabled' | 'testing' | 'deprecated';
export type AnomalyType        = 'lateral_movement' | 'data_exfiltration' | 'privilege_escalation' | 'c2_communication' | 'brute_force' | 'insider_threat';

export interface DetectionAlert {
  id: string;
  title: string;
  description: string;
  severity: DetectionSeverity;
  category: DetectionCategory;
  status: DetectionStatus;
  mitre: { tactic: string; technique: string; id: string };
  source: { engine: string; ruleId: string };
  asset: { hostname: string; ip: string; type: 'server' | 'workstation' | 'network' | 'cloud' };
  timestamp: string;
  score: number; // ML confidence 0-100
  assignee?: string;
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  category: DetectionCategory;
  status: RuleStatus;
  severity: DetectionSeverity;
  engine: 'Suricata' | 'Sigma' | 'YARA' | 'ML-Model' | 'Custom';
  hitCount: number;
  falsePositiveRate: number; // %
  lastTriggered?: string;
  author: string;
  version: string;
}

export interface BehavioralAnomaly {
  id: string;
  type: AnomalyType;
  entity: string; // user or host
  entityType: 'user' | 'host';
  baselineDeviation: number; // sigma
  riskScore: number;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface DetectionMetrics {
  totalAlerts: number;
  criticalOpen: number;
  highOpen: number;
  meanTimeToDetect: number; // minutes
  meanTimeToRespond: number; // minutes
  falsePositiveRate: number; // %
  rulesCoverage: number; // %
  enginesOnline: number;
}

export interface DetectionEngine {
  id: string;
  name: string;
  type: 'IDS/IPS' | 'EDR/XDR' | 'UEBA' | 'NDR' | 'SIEM-Correlation';
  status: 'online' | 'degraded' | 'offline';
  version: string;
  alertsToday: number;
  eventsPerSec: number;
}

export interface ThreatDetectionData {
  metrics: DetectionMetrics;
  alerts: DetectionAlert[];
  rules: DetectionRule[];
  anomalies: BehavioralAnomaly[];
  engines: DetectionEngine[];
}
