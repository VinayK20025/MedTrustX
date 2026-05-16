/**
 * MedTrustX — Legal Risk Manager (Role 111) Types
 * Proactive risk intelligence, probability analysis, and litigation prevention.
 */

export interface LegalRiskKPI {
  id: string;
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'flat';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface RiskItem {
  id: string;
  title: string;
  category: 'Clinical' | 'Documentation' | 'Compliance' | 'Contractual' | 'Operational';
  probability: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Identified' | 'Assessing' | 'Mitigating' | 'Monitoring' | 'Closed';
  source: string; // e.g., "Incident Report INC-991"
  department: string;
  identifiedAt: string;
}

export interface RiskMitigationAction {
  id: string;
  riskId: string;
  action: string;
  owner: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
}

export interface LinkedIncident {
  id: string;
  riskId: string;
  type: string;
  date: string;
  status: string;
}

export interface LegalRiskData {
  kpis: LegalRiskKPI[];
  risks: RiskItem[];
  mitigations: RiskMitigationAction[];
  incidents: LinkedIncident[];
}
