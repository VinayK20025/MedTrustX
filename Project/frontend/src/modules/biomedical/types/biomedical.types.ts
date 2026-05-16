/**
 * MedTrustX — Biomedical Engineer Types
 */

export interface BiomedicalKPI {
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

export interface BiomedicalDevice {
  id: string;
  name: string;
  serialNumber: string;
  type: 'Ventilator' | 'Monitor' | 'Imaging' | 'Infusion Pump' | 'Defibrillator';
  department: string;
  location: string;
  status: 'Online' | 'Offline' | 'Fault' | 'Maintenance';
  riskLevel: 'Life-Critical' | 'High' | 'Medium' | 'Low';
  lifecycleStage: 'Procurement' | 'Usage' | 'End of Life';
}

export interface DeviceTelemetryData {
  deviceId: string;
  timestamp: string;
  status: 'Nominal' | 'Warning' | 'Critical';
  errorCodes: string[];
  batteryLevel?: number;
  lastPing: string;
}

export interface WorkOrder {
  id: string;
  deviceId: string;
  issue: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Verified';
  assignedTo: string;
  createdAt: string;
}

export interface CalibrationRecord {
  id: string;
  deviceId: string;
  lastCalibrationDate: string;
  nextCalibrationDue: string;
  status: 'Compliant' | 'Due Soon' | 'Overdue';
  performedBy?: string;
}

export interface ComplianceAudit {
  id: string;
  deviceId: string;
  certificationBody: string;
  certificationDate: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring' | 'Expired';
}

export interface BiomedicalAlert {
  id: string;
  deviceId: string;
  type: 'Life-Support Failure' | 'Calibration Overdue' | 'Compliance Warning' | 'Network Disconnect';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface BiomedicalDashboardData {
  kpis: BiomedicalKPI[];
  inventory: BiomedicalDevice[];
  telemetry: DeviceTelemetryData[];
  workOrders: WorkOrder[];
  calibrations: CalibrationRecord[];
  compliance: ComplianceAudit[];
  alerts: BiomedicalAlert[];
}
