/**
 * MedTrustX — Threat Intelligence Analyst Platform Types
 * IOC Management, Campaign Tracking, Feed Integration, Detection Rules.
 */

export type IocType = 'IP Address' | 'Domain' | 'File Hash' | 'URL' | 'Email' | 'CVE';
export type CampaignStatus = 'Active' | 'Dormant' | 'Mitigated' | 'Emerging';
export type FeedStatus = 'Active' | 'Stale' | 'Error' | 'Disabled';
export type DetectionRuleStatus = 'Enabled' | 'Disabled' | 'Testing';

export interface ThreatIndicator {
  id: string;
  indicatorValue: string;
  type: IocType;
  riskScore: number; // 0-100
  source: string;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  enrichment?: string; // e.g., 'Known C2 Server — APT28'
}

export interface ThreatCampaign {
  id: string;
  campaignName: string;
  adversary: string; // e.g., APT28, FIN7
  status: CampaignStatus;
  ttps: string[]; // MITRE ATT&CK
  iocCount: number;
  targetSector: string;
  firstObserved: string;
  lastActivity: string;
}

export interface ThreatFeed {
  id: string;
  feedName: string;
  provider: string;
  type: 'OSINT' | 'Commercial' | 'Government' | 'Dark Web' | 'Internal';
  status: FeedStatus;
  iocIngested: number;
  lastUpdate: string;
  updateFrequency: string;
}

export interface CorrelationMatch {
  id: string;
  internalEvent: string;
  internalSource: string;
  externalThreat: string;
  matchedIoc: string;
  confidence: number; // 0-100
  timestamp: string;
}

export interface DetectionRule {
  id: string;
  ruleName: string;
  targetSystem: 'SIEM' | 'EDR' | 'IDS/IPS' | 'Firewall';
  linkedIocs: number;
  status: DetectionRuleStatus;
  lastPushed: string;
  hitCount: number;
}

export interface ThreatIntelMetrics {
  activeThreats: number;
  totalIocs: number;
  feedUpdatesToday: number;
  detectionCoverage: number; // percentage
  correlationMatches: number;
}

export interface ThreatIntelData {
  metrics: ThreatIntelMetrics;
  indicators: ThreatIndicator[];
  campaigns: ThreatCampaign[];
  feeds: ThreatFeed[];
  correlations: CorrelationMatch[];
  detectionRules: DetectionRule[];
}
