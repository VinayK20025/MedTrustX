/**
 * MedTrustX — MRI Technician Types
 */

export interface MriKPI {
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

export interface MriPatientQueue {
  id: string;
  patientName: string;
  mrn: string;
  study: string;
  status: 'Waiting' | 'Screening' | 'In Setup' | 'Scanning' | 'Image Review' | 'Completed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  appointmentTime: string;
}

export interface SafetyChecklist {
  id: string;
  patientId: string;
  questions: {
    id: string;
    text: string;
    isSafe: boolean | null; // null = unanswered, false = contraindication
    isCriticalBlocker: boolean;
  }[];
  isCleared: boolean;
  clearanceTimestamp?: string;
}

export interface MriProtocol {
  id: string;
  name: string;
  description: string;
  sequences: {
    id: string;
    name: string;
    tr: number; // Repetition Time (ms)
    te: number; // Echo Time (ms)
    sliceThickness: string;
    durationMinutes: number;
    progressPercent?: number;
  }[];
}

export interface MriAlert {
  id: string;
  patientId?: string;
  type: 'Safety Violation' | 'Patient Distress' | 'Quench Imminent' | 'Motion Artifact Detected';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface MriTechDashboardData {
  kpis: MriKPI[];
  queue: MriPatientQueue[];
  activePatient?: MriPatientQueue;
  activeChecklist?: SafetyChecklist;
  activeProtocol?: MriProtocol;
  alerts: MriAlert[];
}
