/**
 * MedTrustX — OT Technician Types
 */

export interface OTTechKPI {
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

export interface OTDevice {
  id: string;
  name: string;
  type: 'Anesthesia Machine' | 'Ventilator' | 'C-Arm' | 'Surgical Lights' | 'Patient Monitor' | 'Electrocautery';
  otRoom: string;
  status: 'Active' | 'Standby' | 'Maintenance Due' | 'Failed';
  batteryLevel?: number;
  lastCalibration: string;
}

export interface DeviceTelemetry {
  deviceId: string;
  timestamp: string;
  temperature?: number;
  pressure?: number;
  flowRate?: number;
  voltage?: number;
  cpuUsage?: number;
  status: 'Nominal' | 'Warning' | 'Critical';
}

export interface EquipmentSetupTask {
  id: string;
  otRoom: string;
  caseId: string;
  deviceType: string;
  description: string;
  status: 'Pending' | 'Testing' | 'Ready';
}

export interface MaintenanceLog {
  id: string;
  deviceId: string;
  date: string;
  issue: string;
  resolution: string;
  performedBy: string;
  timeSpentMinutes: number;
}

export interface OTTechAlert {
  id: string;
  deviceId: string;
  otRoom: string;
  type: 'Hardware Failure' | 'Calibration Error' | 'Power Loss' | 'Connectivity Drop';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface OTTechDashboardData {
  kpis: OTTechKPI[];
  devices: OTDevice[];
  liveTelemetry: DeviceTelemetry[];
  setupTasks: EquipmentSetupTask[];
  recentMaintenance: MaintenanceLog[];
  alerts: OTTechAlert[];
}
