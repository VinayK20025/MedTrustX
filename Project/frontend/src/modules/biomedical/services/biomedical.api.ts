import type {
  BiomedicalDashboardData, BiomedicalKPI, BiomedicalDevice, DeviceTelemetryData,
  WorkOrder, CalibrationRecord, ComplianceAudit, BiomedicalAlert
} from '../types/biomedical.types';

export interface BiomedicalFilters {
  department?: string;
  status?: string;
}

const mockKpis: BiomedicalKPI[] = [
  { id: '1', title: 'Active Devices', value: 124, format: 'number', status: 'normal' },
  { id: '2', title: 'Active Faults', value: 3, format: 'number', status: 'critical', actionLabel: 'View Faults', actionUrl: '/dashboard/biomedical/monitoring' },
  { id: '3', title: 'Calibration Due', value: 8, format: 'number', status: 'warning', actionLabel: 'View Schedule', actionUrl: '/dashboard/biomedical/calibration' },
  { id: '4', title: 'Compliance Alerts', value: 0, format: 'number', status: 'success' },
];

const mockInventory: BiomedicalDevice[] = [
  { id: 'DEV-VENT-01', name: 'Puritan Bennett 980', serialNumber: 'SN-980-001', type: 'Ventilator', department: 'ICU', location: 'Bed 4', status: 'Fault', riskLevel: 'Life-Critical', lifecycleStage: 'Usage' },
  { id: 'DEV-MON-05', name: 'Philips IntelliVue MX700', serialNumber: 'SN-MX7-005', type: 'Monitor', department: 'Ward 3', location: 'Room 302', status: 'Online', riskLevel: 'High', lifecycleStage: 'Usage' },
  { id: 'DEV-IMG-02', name: 'GE Optima XR220', serialNumber: 'SN-XR2-002', type: 'Imaging', department: 'Radiology', location: 'Mobile', status: 'Maintenance', riskLevel: 'High', lifecycleStage: 'Usage' },
];

const mockTelemetry: DeviceTelemetryData[] = [
  { deviceId: 'DEV-VENT-01', timestamp: new Date().toISOString(), status: 'Critical', errorCodes: ['E-104', 'E-200'], batteryLevel: 10, lastPing: new Date(Date.now() - 5000).toISOString() },
  { deviceId: 'DEV-MON-05', timestamp: new Date().toISOString(), status: 'Nominal', errorCodes: [], batteryLevel: 100, lastPing: new Date(Date.now() - 1000).toISOString() },
];

const mockWorkOrders: WorkOrder[] = [
  { id: 'WO-101', deviceId: 'DEV-VENT-01', issue: 'Compressor failure during self-test', priority: 'Emergency', status: 'In Progress', assignedTo: 'Eng. J. Smith', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'WO-102', deviceId: 'DEV-IMG-02', issue: 'Routine 6-month tube inspection', priority: 'Routine', status: 'Assigned', assignedTo: 'Eng. A. Davis', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const mockCalibrations: CalibrationRecord[] = [
  { id: 'CAL-01', deviceId: 'DEV-MON-05', lastCalibrationDate: new Date(Date.now() - 86400000 * 300).toISOString(), nextCalibrationDue: new Date(Date.now() + 86400000 * 65).toISOString(), status: 'Compliant' },
  { id: 'CAL-02', deviceId: 'DEV-VENT-01', lastCalibrationDate: new Date(Date.now() - 86400000 * 360).toISOString(), nextCalibrationDue: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Overdue' },
];

const mockCompliance: ComplianceAudit[] = [
  { id: 'AUD-01', deviceId: 'DEV-IMG-02', certificationBody: 'AERB', certificationDate: new Date(Date.now() - 86400000 * 600).toISOString(), expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), status: 'Expiring' },
];

const mockAlerts: BiomedicalAlert[] = [
  { id: 'ALT-1', deviceId: 'DEV-VENT-01', type: 'Life-Support Failure', severity: 'critical', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Active', message: 'Ventilator offline in ICU Bed 4. Emergency repair dispatched.' },
  { id: 'ALT-2', deviceId: 'DEV-VENT-01', type: 'Calibration Overdue', severity: 'warning', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Active', message: 'Annual calibration overdue for life-critical device.' },
];

export const biomedicalApi = {
  getDashboardSummary: async (filters: BiomedicalFilters) => ({
    data: {
      kpis: mockKpis,
      inventory: mockInventory,
      telemetry: mockTelemetry,
      workOrders: mockWorkOrders,
      calibrations: mockCalibrations,
      compliance: mockCompliance,
      alerts: mockAlerts,
    } as BiomedicalDashboardData,
    message: 'Success', status: 200,
  }),

  updateWorkOrder: async (orderId: string, status: WorkOrder['status']) => ({ data: { success: true }, message: `Work order updated to ${status}`, status: 200 }),
  logCalibration: async (recordId: string) => ({ data: { success: true }, message: 'Calibration logged successfully', status: 201 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
