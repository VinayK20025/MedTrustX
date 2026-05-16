/**
 * MedTrustX — Triage Nurse Types
 * Fast assessment, priority categorization, and rapid routing
 */

export interface TriageKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export type TriageLevel = 'emergency' | 'urgent' | 'non-urgent' | 'unassigned';

export interface TriagePatient {
  id: string;
  name: string;
  age: number;
  complaint: string;
  arrivalTime: string;
  waitTimeMins: number;
  status: 'waiting_triage' | 'triaged' | 'routed';
  assignedLevel: TriageLevel;
}

export interface TriageAlert {
  id: string;
  type: 'missed_triage' | 'critical_arrival' | 'wait_time_exceeded';
  message: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

export interface TriageRouteOption {
  id: string;
  name: string;
  capacity: string;
  status: 'available' | 'busy' | 'full';
}

export interface TriageDashboardData {
  kpis: TriageKPI[];
  incomingQueue: TriagePatient[];
  recentTriaged: TriagePatient[];
  alerts: TriageAlert[];
  routingOptions: TriageRouteOption[];
}
