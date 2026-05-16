import type {
  RadiologyTechDashboardData, RadiologyTechKPI, ImagingPatientQueue,
  ImagingProtocol, ImagingDeviceStatus, CapturedImage, RadiologyTechAlert
} from '../types/radiologyTech.types';

export interface RadiologyTechFilters {
  modality?: string;
}

const mockKpis: RadiologyTechKPI[] = [
  { id: '1', title: 'Patients Waiting', value: 5, format: 'number', status: 'warning' },
  { id: '2', title: 'Scans Completed', value: 42, format: 'number', status: 'success' },
  { id: '3', title: 'Pending PACS Transfer', value: 2, format: 'number', status: 'critical', actionLabel: 'Transfer Images', actionUrl: '/dashboard/radiology-tech/transfer' },
  { id: '4', title: 'Scanner Uptime', value: '100%', format: 'percentage', status: 'normal' },
];

const mockQueue: ImagingPatientQueue[] = [
  { id: 'IQ-101', patientName: 'Arthur Dent', mrn: 'MRN-7732', modality: 'CT', bodyPart: 'Head w/o Contrast', status: 'In Setup', priority: 'STAT', appointmentTime: new Date(Date.now() - 300000).toISOString() },
  { id: 'IQ-102', patientName: 'Ford Prefect', mrn: 'MRN-8821', modality: 'MRI', bodyPart: 'Lumbar Spine', status: 'Waiting', priority: 'Routine', appointmentTime: new Date(Date.now() + 1800000).toISOString() },
];

const mockProtocols: ImagingProtocol[] = [
  { id: 'PROT-CT-1', name: 'CT Head Non-Contrast', modality: 'CT', description: 'Standard trauma head protocol.', parameters: { kVp: 120, mA: 300, sliceThickness: '5mm', contrast: false, durationMinutes: 3 } },
  { id: 'PROT-CT-2', name: 'CT Angio Chest', modality: 'CT', description: 'PE Protocol with IV contrast.', parameters: { kVp: 100, mA: 400, sliceThickness: '1.25mm', contrast: true, durationMinutes: 5 } },
];

const mockDevices: ImagingDeviceStatus[] = [
  { id: 'DEV-CT-1', name: 'GE Revolution CT', modality: 'CT', status: 'Ready', temperature: 21, tubeHeatPercentage: 45 },
  { id: 'DEV-MRI-1', name: 'Siemens Magnetom 3T', modality: 'MRI', status: 'Scanning', activePatientId: 'MRN-3310' },
];

const mockImages: CapturedImage[] = [
  { id: 'IMG-SER-1', patientId: 'MRN-7732', seriesNumber: 1, imageCount: 120, quality: 'Excellent', isTransferredToPACS: false },
  { id: 'IMG-SER-2', patientId: 'MRN-1102', seriesNumber: 1, imageCount: 1, quality: 'Poor - Retake Required', isTransferredToPACS: false },
];

const mockAlerts: RadiologyTechAlert[] = [
  { id: 'ALT-RT-1', patientId: 'MRN-7732', type: 'STAT Delay', severity: 'warning', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'Active', message: 'STAT CT Head approaching 15-min SLA limit.' },
  { id: 'ALT-RT-2', deviceId: 'DEV-CT-1', type: 'Tube Overheat', severity: 'critical', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Resolved', message: 'X-Ray tube heat exceeded 85%. Cooling cycle engaged.' },
];

export const radiologyTechApi = {
  getDashboardSummary: async (filters: RadiologyTechFilters) => ({
    data: {
      kpis: mockKpis,
      queue: mockQueue,
      activePatient: mockQueue[0],
      protocols: mockProtocols,
      devices: mockDevices,
      recentImages: mockImages,
      alerts: mockAlerts,
    } as RadiologyTechDashboardData,
    message: 'Success', status: 200,
  }),

  startScan: async (patientId: string, protocolId: string, deviceId: string) => ({ data: { success: true }, message: `Scan initiated`, status: 200 }),
  transferToPacs: async (imageId: string) => ({ data: { success: true }, message: `Images sent to PACS`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
