/**
 * MedTrustX — Quality Analyst (Role 106) Types
 * Data intelligence and measurement layer for quality metrics.
 */

export interface QaKPI {
  id: string;
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface DataSource {
  id: string;
  name: string;
  type: 'EHR' | 'Lab' | 'Audits' | 'Incidents' | 'Feedback';
  status: 'Connected' | 'Delayed' | 'Syncing' | 'Error';
  lastSync: string;
  recordCount: number;
}

export interface AnomalyInsight {
  id: string;
  type: 'Risk' | 'Opportunity' | 'Anomaly';
  metric: string;
  severity: 'Critical' | 'High' | 'Medium';
  description: string;
  recommendation: string;
  detectedAt: string;
}

export interface DepartmentComparison {
  id: string;
  department: string;
  score: number;
  incidentRate: number;
  complianceRate: number;
  status: 'Above Average' | 'Average' | 'Below Target';
}

export interface TrendDataPoint {
  date: string;
  infectionRate: number;
  safetyIncidents: number;
  complianceScore: number;
}

export interface QualityAnalystData {
  kpis: QaKPI[];
  sources: DataSource[];
  insights: AnomalyInsight[];
  comparisons: DepartmentComparison[];
  trends: TrendDataPoint[];
}
