/**
 * MedTrustX — HVAC Technician (Role 90) Types
 */

export interface HVACKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface SensorData {
  temperature: number; // °C
  humidity: number; // %
  pressure: string; // e.g., '+ve', '-ve', 'Normal'
  airQuality: 'Excellent' | 'Good' | 'Poor' | 'Critical';
}

export type HvacTaskPriority = 'Routine' | 'Preventive' | 'Critical';
export type HvacTaskStatus = 'Assigned' | 'In Progress' | 'Resolved' | 'Verified';

export interface HVACTask {
  id: string;
  title: string;
  description: string;
  location: string;
  systemId: string;
  priority: HvacTaskPriority;
  status: HvacTaskStatus;
  isEmergency: boolean;
  safetyChecklistCompleted: boolean;
}

export interface HVACSystem {
  id: string;
  name: string; // e.g., 'AHU-1', 'Chiller 2'
  type: 'AHU' | 'Ventilation' | 'Cooling' | 'Exhaust';
  status: 'OK' | 'Warning' | 'Fault';
  location: string;
  criticalZone: boolean;
  sensors: SensorData;
}

export interface HVACDashboardData {
  kpis: HVACKPI[];
  tasks: HVACTask[];
  systems: HVACSystem[];
}
