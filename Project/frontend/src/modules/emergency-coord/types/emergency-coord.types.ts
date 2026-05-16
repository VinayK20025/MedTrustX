/**
 * MedTrustX — Emergency Coordinator (Role 18.5) Types
 * Real-time patient flow, triage, and multi-team synchronization.
 */

export type TriagePriority = 'Red' | 'Yellow' | 'Green' | 'Black';
export type PatientFlowStatus = 'Incoming' | 'Triaging' | 'Routing' | 'Allocated' | 'Treated';

export interface TriagePatient {
  id: string;
  tag: string; // P001, P002...
  name?: string;
  age?: number;
  priority: TriagePriority;
  status: PatientFlowStatus;
  from: string; // Ambulance A1, Walk-in, Transfer
  routedTo?: string; // ICU, ER, OT, Ward
  chiefComplaint: string;
  eta?: number; // minutes if still incoming
  arrivedAt?: string;
}

export interface AmbulanceUnit {
  id: string;
  callSign: string;
  status: 'En Route' | 'On Scene' | 'Transporting' | 'Available';
  patientLoad: 'Critical' | 'Stable' | 'Empty';
  etaMinutes?: number;
  patientCount: number;
  currentLocation: string;
}

export interface CoordinatorTask {
  id: string;
  title: string;
  owner: string;
  department: string;
  status: 'Pending' | 'In Progress' | 'Done';
  priority: 'Immediate' | 'Urgent' | 'Normal';
}

export interface FlowResource {
  id: string;
  name: string;
  available: number;
  total: number;
  unit: string;
  status: 'OK' | 'Low' | 'Critical';
}

export interface CoordinatorKPI {
  id: string;
  label: string;
  value: string | number;
  subLabel?: string;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface EmergencyCoordinatorData {
  kpis: CoordinatorKPI[];
  patients: TriagePatient[];
  ambulances: AmbulanceUnit[];
  tasks: CoordinatorTask[];
  resources: FlowResource[];
}
