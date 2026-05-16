/**
 * MedTrustX — Pathologist Types
 */

export interface PathologistKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface PathologistCase {
  id: string;
  patientName: string;
  patientId: string;
  testType: 'Histopathology' | 'Cytology' | 'Hematology' | 'Biochemistry';
  status: 'Pending Review' | 'In Analysis' | 'Drafting Report' | 'Validated';
  priority: 'Routine' | 'Urgent' | 'STAT';
  receivedAt: string;
}

export interface LabResultItem {
  id: string;
  parameterName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'High' | 'Low' | 'Critical High' | 'Critical Low';
}

export interface CaseResults {
  caseId: string;
  results: LabResultItem[];
  historicalComparisons?: {
    parameterName: string;
    previousValue: number | string;
    previousDate: string;
    trend: 'Increasing' | 'Decreasing' | 'Stable';
  }[];
}

export interface PathologistAlert {
  id: string;
  caseId: string;
  patientName: string;
  type: 'Critical Value' | 'STAT Pending' | 'Quality Control Issue';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface PathologistDashboardData {
  kpis: PathologistKPI[];
  cases: PathologistCase[];
  activeCase?: PathologistCase;
  activeResults?: CaseResults;
  alerts: PathologistAlert[];
}
