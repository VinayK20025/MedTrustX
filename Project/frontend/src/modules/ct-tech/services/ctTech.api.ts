import type {
  CtTechDashboardData, CtKPI, CtPatientQueue,
  ContrastScreening, CtProtocol, RadiationDoseRecord, CtAlert
} from '../types/ctTech.types';

export interface CtFilters {
  status?: string;
}

const mockKpis: CtKPI[] = [
  { id: '1', title: 'Patients Waiting', value: 8, format: 'number', status: 'warning' },
  { id: '2', title: 'Scans Completed', value: 34, format: 'number', status: 'success' },
  { id: '3', title: 'Avg Dose (Today)', value: 4.2, format: 'mSv', status: 'normal' },
  { id: '4', title: 'Dose Alerts', value: 1, format: 'number', status: 'critical', actionLabel: 'Review Limits', actionUrl: '/dashboard/ct-tech/radiation' },
];

const mockQueue: CtPatientQueue[] = [
  { id: 'CT-Q-1', patientName: 'Alice Johnson', mrn: 'MRN-8812', study: 'CT Angiography Chest', status: 'Screening', priority: 'STAT', appointmentTime: new Date(Date.now() - 300000).toISOString() },
  { id: 'CT-Q-2', patientName: 'Bob Smith', mrn: 'MRN-9934', study: 'CT Abdomen/Pelvis w/ Contrast', status: 'Waiting', priority: 'Routine', appointmentTime: new Date(Date.now() + 1800000).toISOString() },
];

const mockScreening: ContrastScreening = {
  id: 'CHK-8812',
  patientId: 'CT-Q-1',
  isCleared: false,
  egfrValue: 65, // Normal kidney function
  questions: [
    { id: 'q1', text: 'Does the patient have a history of iodine or contrast allergy?', isSafe: true, isCriticalBlocker: true },
    { id: 'q2', text: 'Does the patient have a history of renal disease or failure?', isSafe: true, isCriticalBlocker: true },
    { id: 'q3', text: 'Is the patient diabetic or taking Metformin?', isSafe: null, isCriticalBlocker: false },
    { id: 'q4', text: 'Is the patient pregnant or possibly pregnant?', isSafe: true, isCriticalBlocker: true },
  ]
};

const mockProtocol: CtProtocol = {
  id: 'PROT-CT-ANGIO',
  name: 'PE Protocol (CT Angiography Chest)',
  description: 'High-speed bolus tracking for Pulmonary Embolism.',
  parameters: {
    kVp: 100,
    mA: 400,
    pitch: 1.2,
    sliceThickness: '1.25mm',
    contrastDelaySeconds: 25,
    estimatedDoseMSv: 6.5,
  },
  progressPercent: 0,
};

const mockDose: RadiationDoseRecord[] = [
  { id: 'DOSE-1', patientId: 'MRN-8812', studyId: 'CT-Q-1', ctdiVol: 12.4, dlp: 420.5, effectiveDoseMSv: 6.1, thresholdLimit: 10.0, isOverLimit: false, timestamp: new Date().toISOString() },
  { id: 'DOSE-2', patientId: 'MRN-7721', studyId: 'CT-Q-OLD', ctdiVol: 28.5, dlp: 950.0, effectiveDoseMSv: 14.2, thresholdLimit: 10.0, isOverLimit: true, timestamp: new Date(Date.now() - 7200000).toISOString() },
];

const mockAlerts: CtAlert[] = [
  { id: 'ALT-CT-1', type: 'High Radiation Dose', patientId: 'MRN-7721', severity: 'critical', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'Active', message: 'Dose exceeded protocol threshold limit (10.0 mSv). Immediate review required.' },
  { id: 'ALT-CT-2', type: 'STAT Delay', patientId: 'MRN-8812', severity: 'warning', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Active', message: 'STAT Angiogram is approaching 15-minute SLA.' },
];

export const ctTechApi = {
  getDashboardSummary: async (filters: CtFilters) => ({
    data: {
      kpis: mockKpis,
      queue: mockQueue,
      activePatient: mockQueue[0],
      activeScreening: mockScreening,
      activeProtocol: mockProtocol,
      doseRecords: mockDose,
      alerts: mockAlerts,
    } as CtTechDashboardData,
    message: 'Success', status: 200,
  }),

  answerScreeningQuestion: async (screeningId: string, questionId: string, isSafe: boolean) => ({ data: { success: true }, message: `Question answered`, status: 200 }),
  signScreening: async (screeningId: string) => ({ data: { success: true }, message: `Contrast clearance signed`, status: 200 }),
  triggerScan: async () => ({ data: { success: true }, message: `X-Ray exposure initiated`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
