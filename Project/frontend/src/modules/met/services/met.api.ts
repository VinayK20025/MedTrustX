import type {
  MetDashboardData, MetKPI, MetTask, MetDevice, DiagnosticStep, MetCalibrationRecord, MetWorkLog
} from '../types/met.types';

export interface MetFilters {
  priority?: string;
}

const mockKpis: MetKPI[] = [
  { id: '1', title: 'Emergency Faults', value: 1, format: 'number', status: 'critical' },
  { id: '2', title: 'Pending Setup', value: 2, format: 'number', status: 'warning' },
  { id: '3', title: 'Completed', value: 14, format: 'number', status: 'success' },
  { id: '4', title: 'Avg Diagnostic Time', value: '18m', format: 'time', status: 'normal' },
];

const mockDevices: MetDevice[] = [
  { id: 'DEV-VENT-02', name: 'Dräger Evita V500', type: 'Ventilator', department: 'ICU', location: 'Bed 2', status: 'Fault', errorCode: 'E-501' },
  { id: 'DEV-US-04', name: 'GE Logiq E10', type: 'Imaging', department: 'Radiology', location: 'Room 2', status: 'Needs Setup' },
];

const mockTasks: MetTask[] = [
  {
    id: 'TSK-MET-01',
    deviceId: 'DEV-VENT-02',
    issue: 'Ventilator delivering low tidal volume (Error E-501)',
    type: 'Troubleshoot',
    priority: 'Emergency',
    status: 'Diagnosing',
    assignedAt: new Date(Date.now() - 1800000).toISOString(),
    diagnosticsFlow: [
      { id: 'D-1', instruction: 'Check external O2 wall supply pressure', actionType: 'Check', status: 'Passed' },
      { id: 'D-2', instruction: 'Inspect inspiratory valve for leaks', actionType: 'Check', status: 'Failed', resultNotes: 'Micro-tear in diaphragm' },
      { id: 'D-3', instruction: 'Replace inspiratory valve assembly', actionType: 'Replace', status: 'Pending' },
      { id: 'D-4', instruction: 'Run Volume Calibration Test', actionType: 'Test', status: 'Pending' },
    ]
  },
  {
    id: 'TSK-MET-02',
    deviceId: 'DEV-US-04',
    issue: 'Initial installation and network config',
    type: 'Setup',
    priority: 'Routine',
    status: 'Assigned',
    assignedAt: new Date(Date.now() - 86400000).toISOString(),
    diagnosticsFlow: [
      { id: 'D-5', instruction: 'Connect to hospital secure VLAN', actionType: 'Configure', status: 'Pending' },
      { id: 'D-6', instruction: 'Ping PACS server for DICOM sync', actionType: 'Test', status: 'Pending' },
    ]
  }
];

const mockCalibrations: MetCalibrationRecord[] = [
  { id: 'CAL-MET-1', deviceId: 'DEV-MON-12', testName: 'NIBP Accuracy', accuracyOffset: 0.5, status: 'Passed', date: new Date(Date.now() - 3600000).toISOString() },
];

const mockLogs: MetWorkLog[] = [
  { id: 'LOG-MET-1', taskId: 'TSK-MET-00', deviceId: 'DEV-MON-12', durationMinutes: 35, resolution: 'Re-calibrated NIBP module.', status: 'Resolved', timestamp: new Date(Date.now() - 3600000).toISOString() }
];

export const metApi = {
  getDashboardSummary: async (filters: MetFilters) => ({
    data: {
      kpis: mockKpis,
      tasks: mockTasks,
      activeTask: mockTasks.find(t => t.status !== 'Assigned' && t.status !== 'Resolved' && t.status !== 'Escalated'),
      devices: mockDevices,
      calibrations: mockCalibrations,
      logs: mockLogs,
    } as MetDashboardData,
    message: 'Success', status: 200,
  }),

  updateTaskStatus: async (taskId: string, status: MetTask['status']) => ({ data: { success: true }, message: `Task status updated to ${status}`, status: 200 }),
  updateDiagnosticStep: async (taskId: string, stepId: string, status: DiagnosticStep['status'], notes?: string) => ({ data: { success: true }, message: 'Diagnostic step recorded', status: 200 }),
};
