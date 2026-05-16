/**
 * MedTrustX — Ambulance Coordinator (Role 127) Types
 * Command center for EMS operations, live map tracking, and auto-dispatch.
 */

export interface AmbCoordinatorKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface EmergencyCall {
  id: string;
  caller: string;
  location: string;
  condition: string;
  priority: 'Critical' | 'Urgent' | 'Routine';
  status: 'Pending Dispatch' | 'Assigned';
  receivedAt: string;
}

export interface AmbulanceUnit {
  id: string;
  callSign: string; // e.g., A-101
  status: 'Available' | 'En Route' | 'At Scene' | 'Transporting' | 'Returning';
  currentLocation: string;
  etaToTarget?: string;
  assignedCaseId?: string;
}

export interface AmbCoordinatorData {
  kpis: AmbCoordinatorKPI[];
  incomingCalls: EmergencyCall[];
  fleet: AmbulanceUnit[];
}
