/**
 * MedTrustX — CMO Module Types
 */

export interface CmoKPI {
  id: string;
  title: string;
  value: string | number;
  trend: string;
  severity: 'critical' | 'warning' | 'good' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface OutcomesMetrics {
  mortalityRate: number;
  readmissionRate: number;
  avgLos: number;
  complicationsRate: number;
  monthlyTrend: { date: string; mortality: number; readmission: number }[];
}

export interface InfectionMetrics {
  currentRate: number;
  targetRate: number;
  wardHeatmap: { ward: string; score: number; status: 'critical' | 'warning' | 'good' }[];
}

export interface AuditSummary {
  pendingAudits: number;
  protocolDeviations: number;
  complianceScore: number;
  recentFlags: { id: string; type: string; ward: string; timestamp: string }[];
}

export interface IcuOversightMetrics {
  criticalPatients: number;
  sepsisCases: number;
  ventilatorUtilization: number;
  mortalityRiskAvg: number;
}

export interface ClinicalAlert {
  id: string;
  type: 'critical' | 'warning' | 'audit';
  message: string;
  timestamp: string;
  department: string;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface CmoDashboardData {
  kpis: CmoKPI[];
  outcomes: OutcomesMetrics;
  infection: InfectionMetrics;
  audit: AuditSummary;
  icuOversight: IcuOversightMetrics;
  alerts: ClinicalAlert[];
}
