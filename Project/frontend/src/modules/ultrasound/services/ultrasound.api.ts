import type {
  UltrasoundDashboardData, UltrasoundKPI, UltrasoundQueue,
  UltrasoundPreset, LiveScanState, UltrasoundMeasurement, UltrasoundAlert
} from '../types/ultrasound.types';

export interface UltrasoundFilters {
  examType?: string;
}

const mockKpis: UltrasoundKPI[] = [
  { id: '1', title: 'Patients Waiting', value: 4, format: 'number', status: 'warning' },
  { id: '2', title: 'Scans Completed', value: 18, format: 'number', status: 'success' },
  { id: '3', title: 'Pending PACS Transfer', value: 1, format: 'number', status: 'critical', actionLabel: 'Transfer Images', actionUrl: '/dashboard/ultrasound/transfer' },
  { id: '4', title: 'Transducer Status', value: 'Online', format: 'text', status: 'normal' },
];

const mockQueue: UltrasoundQueue[] = [
  { id: 'US-Q-1', patientName: 'Jessica Taylor', mrn: 'MRN-4421', examType: 'Obstetric', status: 'Scanning', priority: 'Routine', appointmentTime: new Date(Date.now() - 600000).toISOString() },
  { id: 'US-Q-2', patientName: 'Michael Brown', mrn: 'MRN-5591', examType: 'Cardiac', status: 'Waiting', priority: 'STAT', appointmentTime: new Date(Date.now() + 1800000).toISOString() },
];

const mockPresets: UltrasoundPreset[] = [
  { id: 'PRE-OB-1', name: 'Obstetric 2nd/3rd Trimester', examType: 'Obstetric', description: 'Optimized for fetal biometry and anatomy.', parameters: { probeHz: 'C5-1 Convex', depthCm: 16, gain: 55, mode: 'B-Mode' } },
  { id: 'PRE-CARD-1', name: 'Adult Echocardiogram', examType: 'Cardiac', description: 'High frame rate for chamber sizing and valve assessment.', parameters: { probeHz: 'S5-1 Phased Array', depthCm: 20, gain: 60, mode: 'Color Doppler' } },
];

const mockLiveState: LiveScanState = {
  isScanning: true,
  currentMode: 'B-Mode',
  depthCm: 16,
  gainPercent: 55,
  cineLoopBufferSec: 10,
  capturedFrames: 4,
};

const mockMeasurements: UltrasoundMeasurement[] = [
  { id: 'MEAS-1', patientId: 'US-Q-1', type: 'Distance', label: 'BPD (Biparietal Diameter)', value: '62.4 mm', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 'MEAS-2', patientId: 'US-Q-1', type: 'Fetal Heart Rate', label: 'FHR', value: '145 bpm', timestamp: new Date(Date.now() - 60000).toISOString() },
];

const mockAlerts: UltrasoundAlert[] = [
  { id: 'ALT-US-1', type: 'STAT Delay', patientId: 'MRN-5591', severity: 'warning', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Active', message: 'STAT Echocardiogram approaching 15-minute SLA limit.' },
];

export const ultrasoundApi = {
  getDashboardSummary: async (filters: UltrasoundFilters) => ({
    data: {
      kpis: mockKpis,
      queue: mockQueue,
      activePatient: mockQueue[0],
      presets: mockPresets,
      liveState: mockLiveState,
      measurements: mockMeasurements,
      alerts: mockAlerts,
    } as UltrasoundDashboardData,
    message: 'Success', status: 200,
  }),

  captureFrame: async (patientId: string) => ({ data: { success: true, frameId: `IMG-${Date.now()}` }, message: `Frame captured`, status: 200 }),
  saveMeasurement: async (meas: Omit<UltrasoundMeasurement, 'id' | 'timestamp'>) => ({ data: { success: true }, message: `Measurement saved`, status: 200 }),
  toggleScan: async (isScanning: boolean) => ({ data: { success: true }, message: isScanning ? 'Transducer active' : 'Scan frozen', status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
