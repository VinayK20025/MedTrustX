/**
 * MedTrustX — InfoSec Risk Manager (Role 148) Types
 * Real-time risk intelligence system for identifying and prioritizing security risks.
 */

export interface SecurityRisk {
  id: string;
  title: string;
  description: string;
  category: 'Infrastructure' | 'Data Privacy' | 'Vendor' | 'Application' | 'Human Element';
  impact: 1 | 2 | 3 | 4 | 5; // 1: Negligible, 5: Critical
  likelihood: 1 | 2 | 3 | 4 | 5; // 1: Rare, 5: Almost Certain
  severityScore: number; // impact * likelihood
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Mitigating' | 'Mitigated' | 'Accepted';
  dateIdentified: string;
  owner: string;
}

export interface MitigationAction {
  id: string;
  riskId: string;
  action: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface LinkedAsset {
  id: string;
  name: string;
  type: 'Hardware' | 'Software' | 'Network' | 'Data';
  criticality: 'Low' | 'Medium' | 'High';
}

export interface RiskIncident {
  id: string;
  title: string;
  date: string;
  impactScale: string;
}

export interface RiskMetrics {
  totalRisks: number;
  highRiskCount: number;
  mitigatedRisks: number;
  mitigationProgress: number; // percentage
  residualRiskScore: number;
}

export interface RiskData {
  metrics: RiskMetrics;
  risks: SecurityRisk[];
  mitigations: Record<string, MitigationAction[]>; // keyed by riskId
  assets: Record<string, LinkedAsset[]>; // keyed by riskId
  incidents: Record<string, RiskIncident[]>; // keyed by riskId
}
