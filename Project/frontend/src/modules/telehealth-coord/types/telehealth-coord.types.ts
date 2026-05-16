/**
 * MedTrustX — Telehealth Coordinator (Role 134) Types
 * Virtual care operations control, session scheduling, and issue resolution.
 */

export interface TelehealthKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface TelehealthSession {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  scheduledAt: string;
  status: 'Scheduled' | 'Patient Waiting' | 'In Progress' | 'Completed' | 'No Show';
  duration?: number;
  connectionStatus: 'Ready' | 'Patient Connected' | 'Doctor Connected' | 'Both Connected' | 'Issue';
}

export interface DoctorSlot {
  id: string;
  name: string;
  specialty: string;
  status: 'Available' | 'In Consult' | 'Offline';
  nextSlot: string;
  sessionsToday: number;
}

export interface SessionIssue {
  id: string;
  sessionId: string;
  type: 'Connection' | 'No Show' | 'Technical' | 'Reschedule';
  description: string;
  status: 'Open' | 'Resolved';
  reportedAt: string;
}

export interface TelehealthCoordData {
  kpis: TelehealthKPI[];
  sessions: TelehealthSession[];
  doctors: DoctorSlot[];
  issues: SessionIssue[];
}
