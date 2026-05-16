/**
 * MedTrustX — Disaster Management Officer Types
 * Life-critical command infrastructure for hospital emergency response.
 */

export type DisasterPhase = 'Preparedness' | 'Detection' | 'Activation' | 'Response' | 'Recovery' | 'Review';
export type DisasterSeverity = 'Minor' | 'Moderate' | 'Critical';
export type DisasterCode = 'Code Red' | 'Code Blue' | 'Code Black' | 'Code Orange' | 'Code White';

export interface ActiveIncident {
  id: string;
  title: string;
  type: 'Mass Casualty' | 'Fire' | 'Pandemic' | 'IT Outage' | 'Infrastructure Failure' | 'Security Breach';
  code: DisasterCode;
  severity: DisasterSeverity;
  phase: DisasterPhase;
  activatedAt: string;
  commander: string;
  affectedZones: string[];
  patientCount: number;
  description: string;
}

export interface HospitalZoneState {
  id: string;
  zone: string;
  status: 'Available' | 'Overload' | 'Full' | 'Closed' | 'Evacuating';
  occupancyPercent: number;
  availableBeds: number;
}

export interface CriticalResource {
  id: string;
  name: string;
  available: number;
  total: number;
  unit: string;
  status: 'OK' | 'Low' | 'Critical';
}

export interface CommandTask {
  id: string;
  title: string;
  team: string;
  status: 'Pending' | 'Active' | 'Done' | 'Escalated';
  priority: 'Immediate' | 'Urgent' | 'Normal';
}

export interface DisasterKPI {
  id: string;
  label: string;
  value: string | number;
  subLabel?: string;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface DisasterDashboardData {
  kpis: DisasterKPI[];
  activeIncident?: ActiveIncident;
  zoneStates: HospitalZoneState[];
  resources: CriticalResource[];
  tasks: CommandTask[];
}
