import type {
  LabTechDashboardData, LabTechKPI, LabSample, ProcessingStep,
  LabDeviceStatus, QCProtocol, LabTechAlert
} from '../types/labTech.types';

export interface LabTechFilters {
  priority?: string;
  status?: string;
}

const mockKpis: LabTechKPI[] = [
  { id: '1', title: 'Pending Queue', value: 85, format: 'number', status: 'warning' },
  { id: '2', title: 'Processed Today', value: 312, format: 'number', status: 'success' },
  { id: '3', title: 'Pending QC', value: 2, format: 'number', status: 'critical', actionLabel: 'Complete QC', actionUrl: '/dashboard/lab-tech/qc' },
  { id: '4', title: 'STAT Turnaround', value: '38m', format: 'time', status: 'normal' },
];

const mockSamples: LabSample[] = [
  { id: 'SAMP-5001', barcode: '||||||||||||1234', patientName: 'John Doe', patientId: 'MRN-48572', testPanel: 'Comprehensive Metabolic', sampleType: 'Serum', status: 'Collected', priority: 'STAT', collectedAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'SAMP-5002', barcode: '||||||||||||5678', patientName: 'Jane Smith', patientId: 'MRN-92837', testPanel: 'Complete Blood Count', sampleType: 'Blood', status: 'In Centrifuge', priority: 'Routine', collectedAt: new Date(Date.now() - 3600000).toISOString() },
];

const mockSteps: ProcessingStep[] = [
  { id: 'STP-1', sampleId: 'SAMP-5001', stepName: 'Scan Barcode', instructions: 'Verify patient MRN matches label.', status: 'Completed', isAutomated: false },
  { id: 'STP-2', sampleId: 'SAMP-5001', stepName: 'Centrifuge Separation', instructions: 'Spin at 3000g for 10 minutes to separate serum.', status: 'In Progress', isAutomated: true },
  { id: 'STP-3', sampleId: 'SAMP-5001', stepName: 'Load Analyzer', instructions: 'Load sample tube into Cobas Rack A4.', status: 'Pending', isAutomated: false },
];

const mockDevices: LabDeviceStatus[] = [
  { id: 'DEV-1', name: 'Roche Cobas 6000', status: 'Running', currentBatchSize: 45, maxBatchSize: 150, timeRemainingMinutes: 12 },
  { id: 'DEV-2', name: 'Sysmex XN-1000', status: 'Idle', currentBatchSize: 0, maxBatchSize: 50 },
  { id: 'DEV-3', name: 'Centrifuge Unit B', status: 'Error', currentBatchSize: 12, maxBatchSize: 24 },
];

const mockQc: QCProtocol[] = [
  { id: 'QC-1', taskName: 'Daily Calibration Run', instrumentId: 'Roche Cobas 6000', status: 'Passed', dueDate: new Date(Date.now() - 3600000).toISOString() },
  { id: 'QC-2', taskName: 'Reagent Blank Check', instrumentId: 'Sysmex XN-1000', status: 'Pending', dueDate: new Date(Date.now() + 1800000).toISOString() },
];

const mockAlerts: LabTechAlert[] = [
  { id: 'ALT-LT-1', type: 'STAT Pending', severity: 'warning', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'Active', message: 'STAT Metabolic panel awaiting centrifuge.' },
  { id: 'ALT-LT-2', type: 'Device Error', severity: 'critical', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Active', message: 'Centrifuge Unit B detected lid lock failure.' },
];

export const labTechApi = {
  getDashboardSummary: async (filters: LabTechFilters) => ({
    data: {
      kpis: mockKpis,
      samples: mockSamples,
      activeSample: mockSamples[0],
      processingSteps: mockSteps,
      devices: mockDevices,
      qcTasks: mockQc,
      alerts: mockAlerts,
    } as LabTechDashboardData,
    message: 'Success', status: 200,
  }),

  completeStep: async (stepId: string) => ({ data: { success: true }, message: `Step marked completed`, status: 200 }),
  loadDeviceBatch: async (deviceId: string) => ({ data: { success: true }, message: `Batch loaded to device`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
