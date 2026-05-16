/**
 * MedTrustX — Medical Director Module Types
 * Clinical Governance & Outcomes Oversight domain models
 */

export interface ClinicalKPI {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  status: 'normal' | 'warning' | 'critical' | 'improving';
  benchmark?: string;
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface DepartmentPerformance {
  id: string;
  name: string;
  mortalityRate: number;
  infectionRate: number;
  readmissionRate: number;
  avgLOS: number;
  occupancy: number;
  status: 'optimal' | 'attention' | 'critical';
  openIncidents: number;
}

export interface QualityOutcome {
  metric: string;
  current: number;
  previous: number;
  benchmark: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SafetyIncident {
  id: string;
  title: string;
  type: 'medication_error' | 'fall' | 'infection' | 'surgical' | 'diagnostic' | 'other';
  severity: 'sentinel' | 'serious' | 'moderate' | 'near_miss';
  department: string;
  status: 'open' | 'investigating' | 'rca_pending' | 'resolved';
  reportedAt: string;
  assignedTo?: string;
  description: string;
}

export interface ClinicalProtocol {
  id: string;
  name: string;
  department: string;
  version: string;
  status: 'active' | 'under_review' | 'draft' | 'retired';
  adherenceRate: number;
  lastReviewed: string;
  nextReview: string;
}

export interface MedDirectorAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  department?: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface MedDirectorDashboardData {
  kpis: ClinicalKPI[];
  departments: DepartmentPerformance[];
  outcomes: QualityOutcome[];
  incidents: SafetyIncident[];
  protocols: ClinicalProtocol[];
  alerts: MedDirectorAlert[];
}
