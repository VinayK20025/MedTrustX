/**
 * MedTrustX — COO Module Types
 */

export interface CooKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'critical' | 'warning' | 'good' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface PatientFlowMetrics {
  admissionsQueue: number;
  inProgress: number;
  dischargeQueue: number;
  avgWaitTime: number; // in mins
}

export interface BedMetrics {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  blockedBeds: number;
  occupancyByWard: { ward: string; occupied: number; capacity: number }[];
}

export interface IcuMetrics {
  totalBeds: number;
  occupiedBeds: number;
  criticalPatients: number;
  availableVentilators: number;
  nurseToPatientRatio: string;
}

export interface OtMetrics {
  activeSurgeries: number;
  scheduledSurgeries: number;
  delayedSurgeries: number;
  avgTurnaroundTime: number; // in mins
}

export interface CooAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  location?: string;
  actionRequired: boolean;
}

export interface CooTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: string;
}

export interface CooDashboardData {
  kpis: CooKPI[];
  patientFlow: PatientFlowMetrics;
  beds: BedMetrics;
  icu: IcuMetrics;
  ot: OtMetrics;
  alerts: CooAlert[];
  tasks: CooTask[];
}
