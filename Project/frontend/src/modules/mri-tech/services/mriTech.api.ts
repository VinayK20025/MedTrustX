import type {
  MriTechDashboardData, MriKPI, MriPatientQueue,
  SafetyChecklist, MriProtocol, MriAlert
} from '../types/mriTech.types';

export interface MriFilters {
  status?: string;
}

const mockKpis: MriKPI[] = [
  { id: '1', title: 'Patients Waiting', value: 3, format: 'number', status: 'normal' },
  { id: '2', title: 'Scans Completed', value: 12, format: 'number', status: 'success' },
  { id: '3', title: 'Safety Flags', value: 1, format: 'number', status: 'critical', actionLabel: 'Review Contraindications', actionUrl: '/dashboard/mri-tech/screening' },
  { id: '4', title: 'Scanner Status', value: 'Active', format: 'text', status: 'success' },
];

const mockQueue: MriPatientQueue[] = [
  { id: 'MRI-Q-1', patientName: 'Sarah Connor', mrn: 'MRN-1100', study: 'MRI Brain w/o Contrast', status: 'Screening', priority: 'Routine', appointmentTime: new Date(Date.now() - 900000).toISOString() },
  { id: 'MRI-Q-2', patientName: 'John Doe', mrn: 'MRN-2234', study: 'MRI Lumbar Spine', status: 'Waiting', priority: 'Routine', appointmentTime: new Date(Date.now() + 3600000).toISOString() },
];

const mockChecklist: SafetyChecklist = {
  id: 'CHK-1100',
  patientId: 'MRI-Q-1',
  isCleared: false,
  questions: [
    { id: 'q1', text: 'Does the patient have a cardiac pacemaker or defibrillator?', isSafe: true, isCriticalBlocker: true },
    { id: 'q2', text: 'Does the patient have a cochlear implant or neurostimulator?', isSafe: true, isCriticalBlocker: true },
    { id: 'q3', text: 'Does the patient have metal fragments in eyes or body?', isSafe: null, isCriticalBlocker: true },
    { id: 'q4', text: 'Is the patient pregnant or possibly pregnant?', isSafe: true, isCriticalBlocker: false },
    { id: 'q5', text: 'Has the patient removed all jewelry, piercings, and metal clothing?', isSafe: null, isCriticalBlocker: true },
  ]
};

const mockProtocol: MriProtocol = {
  id: 'PROT-BR-1',
  name: 'Routine Brain Non-Contrast',
  description: 'Standard protocol for headaches or demyelinating disease.',
  sequences: [
    { id: 'seq1', name: 'T1 Sagittal', tr: 500, te: 15, sliceThickness: '5mm', durationMinutes: 3, progressPercent: 100 },
    { id: 'seq2', name: 'T2 Axial', tr: 4000, te: 100, sliceThickness: '5mm', durationMinutes: 4, progressPercent: 45 },
    { id: 'seq3', name: 'FLAIR Axial', tr: 9000, te: 90, sliceThickness: '5mm', durationMinutes: 5, progressPercent: 0 },
    { id: 'seq4', name: 'DWI/ADC Axial', tr: 6000, te: 85, sliceThickness: '5mm', durationMinutes: 2, progressPercent: 0 },
  ]
};

const mockAlerts: MriAlert[] = [
  { id: 'ALT-MRI-1', type: 'Patient Distress', patientId: 'MRI-Q-1', severity: 'critical', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Active', message: 'Patient squeezed the emergency call ball. Pause scan immediately.' },
];

export const mriTechApi = {
  getDashboardSummary: async (filters: MriFilters) => ({
    data: {
      kpis: mockKpis,
      queue: mockQueue,
      activePatient: mockQueue[0],
      activeChecklist: mockChecklist,
      activeProtocol: mockProtocol,
      alerts: mockAlerts,
    } as MriTechDashboardData,
    message: 'Success', status: 200,
  }),

  answerSafetyQuestion: async (checklistId: string, questionId: string, isSafe: boolean) => ({ data: { success: true }, message: `Question answered`, status: 200 }),
  signSafetyChecklist: async (checklistId: string) => ({ data: { success: true }, message: `Safety clearance signed`, status: 200 }),
  triggerEmergencyStop: async () => ({ data: { success: true }, message: `EMERGENCY STOP ENGAGED`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
