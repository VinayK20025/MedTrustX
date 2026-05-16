/**
 * MedTrustX — Fire Safety Officer (Role 102) Types
 */

export type FireZoneStatus = 'Safe' | 'Smoke Detected' | 'Fire Alert' | 'Evacuating' | 'Contained';
export type EquipmentStatus = 'OK' | 'Fault' | 'Expired' | 'Due Inspection';
export type FireIncidentStatus = 'Detected' | 'Responding' | 'Containment' | 'Resolved';

export interface FireSafetyKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface BuildingZone {
  id: string;
  name: string;
  floor: string;
  status: FireZoneStatus;
  lastCheckedAt: string;
  detectorCount: number;
}

export interface SafetyEquipment {
  id: string;
  type: 'Extinguisher' | 'Sprinkler' | 'Smoke Detector' | 'Emergency Exit' | 'Hose Reel';
  location: string;
  zone: string;
  status: EquipmentStatus;
  lastInspectedAt: string;
  nextDueAt: string;
}

export interface FireIncident {
  id: string;
  type: 'Fire' | 'Smoke' | 'Equipment Fault' | 'False Alarm';
  zone: string;
  status: FireIncidentStatus;
  severity: 'Critical' | 'High' | 'Low';
  detectedAt: string;
  description: string;
  responseSteps: { step: number; label: string; done: boolean }[];
}

export interface ComplianceRecord {
  id: string;
  area: string;
  type: 'Inspection' | 'Drill' | 'Audit' | 'Certification';
  status: 'Passed' | 'Failed' | 'Pending' | 'Overdue';
  dueDate: string;
}

export interface FireSafetyDashboardData {
  kpis: FireSafetyKPI[];
  zones: BuildingZone[];
  equipment: SafetyEquipment[];
  incidents: FireIncident[];
  compliance: ComplianceRecord[];
}
