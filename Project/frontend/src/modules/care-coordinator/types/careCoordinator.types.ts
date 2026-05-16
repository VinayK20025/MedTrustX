/**
 * MedTrustX — Care Coordinator Types
 */

export interface CareCoordinatorKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface CoordinatedPatient {
  id: string;
  patientName: string;
  mrn: string;
  currentWard: string;
  admissionDate: string;
  attendingPhysician: string;
  priority: 'Routine' | 'High' | 'Critical';
  status: 'On Track' | 'Delayed' | 'Blocked';
}

export interface CareMilestone {
  id: string;
  title: string;
  phase: 'Admission' | 'Diagnosis' | 'Treatment' | 'Recovery' | 'Discharge' | 'Follow-up';
  status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
  timestamp?: string;
  assignedTeam: string;
  notes?: string;
}

export interface CareTask {
  id: string;
  patientId: string;
  title: string;
  assignedTeam: string; // e.g., Radiology, Pharmacy, Transport
  dueDate: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  status: 'Pending' | 'In Progress' | 'Completed';
  isBottleneck: boolean;
}

export interface CoordinationAlert {
  id: string;
  type: 'Test Delayed' | 'Bed Unavailable' | 'Discharge Blocked' | 'Consult Pending';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
  patientId: string;
}

export interface CareCoordinatorDashboardData {
  kpis: CareCoordinatorKPI[];
  patients: CoordinatedPatient[];
  activePatient?: CoordinatedPatient;
  journeyMilestones: CareMilestone[];
  pendingTasks: CareTask[];
  alerts: CoordinationAlert[];
}
