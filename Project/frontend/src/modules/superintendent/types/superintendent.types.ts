/**
 * MedTrustX — Medical Superintendent Module Types
 * Clinical Operations & Floor Coordination domain models
 */

export interface SuperKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'neutral';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface PatientFlowEntry {
  id: string;
  type: 'admission' | 'discharge' | 'transfer';
  patientName: string;
  department: string;
  ward?: string;
  status: 'pending' | 'in_progress' | 'delayed' | 'completed';
  priority: 'routine' | 'urgent' | 'emergency';
  requestedAt: string;
  delayReason?: string;
}

export interface WardStatus {
  id: string;
  name: string;
  totalBeds: number;
  occupied: number;
  reserved: number;
  available: number;
  occupancyPct: number;
  pendingDischarges: number;
  criticalPatients: number;
  status: 'normal' | 'high' | 'full';
}

export interface ICUOTStatus {
  unit: string;
  type: 'icu' | 'ot';
  totalCapacity: number;
  inUse: number;
  available: number;
  waitingQueue: number;
  criticalAlerts: number;
  status: 'available' | 'high_load' | 'full';
}

export interface SuperAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  department?: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface SuperTask {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo: string;
  department: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueAt: string;
}

export interface SuperintendentDashboardData {
  kpis: SuperKPI[];
  patientFlow: PatientFlowEntry[];
  wards: WardStatus[];
  icuOt: ICUOTStatus[];
  alerts: SuperAlert[];
  tasks: SuperTask[];
}
