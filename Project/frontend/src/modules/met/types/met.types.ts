/**
 * MedTrustX — Medical Equipment Technician (MET) Types
 */

export interface MetKPI {
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

export interface MetDevice {
  id: string;
  name: string;
  type: 'Ventilator' | 'Monitor' | 'Imaging' | 'OT Equipment' | 'Pump';
  department: string;
  location: string;
  errorCode?: string;
  status: 'Needs Setup' | 'Fault' | 'Online';
}

export interface DiagnosticStep {
  id: string;
  instruction: string;
  actionType: 'Check' | 'Test' | 'Configure' | 'Replace';
  status: 'Pending' | 'Passed' | 'Failed';
  resultNotes?: string;
}

export interface MetTask {
  id: string;
  deviceId: string;
  issue: string;
  type: 'Troubleshoot' | 'Setup' | 'Calibration';
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Assigned' | 'Diagnosing' | 'Fixing' | 'Testing' | 'Resolved' | 'Escalated';
  diagnosticsFlow: DiagnosticStep[];
  assignedAt: string;
}

export interface MetCalibrationRecord {
  id: string;
  deviceId: string;
  testName: string;
  accuracyOffset: number; // percentage offset
  status: 'Passed' | 'Failed' | 'Adjusted';
  date: string;
}

export interface MetWorkLog {
  id: string;
  taskId: string;
  deviceId: string;
  durationMinutes: number;
  resolution: string;
  status: 'Resolved' | 'Escalated';
  timestamp: string;
}

export interface MetDashboardData {
  kpis: MetKPI[];
  tasks: MetTask[];
  activeTask?: MetTask;
  devices: MetDevice[];
  calibrations: MetCalibrationRecord[];
  logs: MetWorkLog[];
}
