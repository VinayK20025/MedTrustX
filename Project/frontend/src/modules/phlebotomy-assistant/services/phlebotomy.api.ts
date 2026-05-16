import type {
  PhlebotomyDashboardData, PhlebotomyKPI, PhlebotomyPatient, CollectionTest,
  VerificationStep, HandoverBatch, PhlebotomyAlert
} from '../types/phlebotomy.types';

export interface PhlebotomyFilters {
  priority?: string;
}

const mockKpis: PhlebotomyKPI[] = [
  { id: '1', title: 'Patients Waiting', value: 8, format: 'number', status: 'warning' },
  { id: '2', title: 'Samples Collected', value: 142, format: 'number', status: 'success' },
  { id: '3', title: 'Label Errors Prevented', value: 2, format: 'number', status: 'success' },
  { id: '4', title: 'Pending Handover', value: 14, format: 'number', status: 'critical', actionLabel: 'Send to Lab', actionUrl: '/dashboard/phlebotomy-assistant/handover' },
];

const mockPatients: PhlebotomyPatient[] = [
  { id: 'PT-991', patientName: 'Maria Garcia', mrn: 'MRN-88214', dob: '1985-04-12', status: 'Waiting', priority: 'STAT', waitTimeMinutes: 12, room: 'ER-Bed-4' },
  { id: 'PT-992', patientName: 'James Wilson', mrn: 'MRN-55102', dob: '1970-11-30', status: 'Waiting', priority: 'Fasting', waitTimeMinutes: 45, room: 'Outpatient Clinic' },
];

const mockTests: CollectionTest[] = [
  { id: 'TEST-1', patientId: 'PT-991', testName: 'Complete Blood Count (CBC)', tubeColor: 'Purple (Lavender)', preparationNotes: 'Invert 8-10 times immediately after collection', status: 'Pending' },
  { id: 'TEST-2', patientId: 'PT-991', testName: 'Comprehensive Metabolic Panel', tubeColor: 'Gold (SST)', preparationNotes: 'Allow to clot for 30 mins before centrifuge', status: 'Pending' },
];

const mockVerification: VerificationStep[] = [
  { id: 'VER-1', stepName: 'Identify Patient', description: 'Ask patient to state full name and DOB.', isVerified: false, isRequired: true },
  { id: 'VER-2', stepName: 'Check Wristband', description: 'Scan MRN barcode on patient wristband.', isVerified: false, isRequired: true },
  { id: 'VER-3', stepName: 'Hygiene Protocol', description: 'Wash hands and don fresh gloves.', isVerified: false, isRequired: true },
];

const mockBatches: HandoverBatch[] = [
  { id: 'BATCH-4401', tubeCount: 14, destinationLab: 'Core Biochemistry Lab', status: 'Pending Transfer', createdAt: new Date(Date.now() - 1800000).toISOString() },
];

const mockAlerts: PhlebotomyAlert[] = [
  { id: 'ALT-PH-1', patientId: 'PT-991', type: 'STAT Delay', severity: 'warning', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'Active', message: 'STAT collection for Maria Garcia is approaching 15-minute SLA.' },
  { id: 'ALT-PH-2', type: 'Label Error', severity: 'critical', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Active', message: 'Mismatch detected during barcode scan. Tube discarded and reprinted.' },
];

export const phlebotomyApi = {
  getDashboardSummary: async (filters: PhlebotomyFilters) => ({
    data: {
      kpis: mockKpis,
      patientQueue: mockPatients,
      activePatient: mockPatients[0],
      activeTests: mockTests,
      verificationSteps: mockVerification,
      handoverBatches: mockBatches,
      alerts: mockAlerts,
    } as PhlebotomyDashboardData,
    message: 'Success', status: 200,
  }),

  verifyStep: async (stepId: string) => ({ data: { success: true }, message: `Step verified`, status: 200 }),
  printLabel: async (testId: string) => ({ data: { success: true, barcode: '123456789' }, message: `Label sent to printer`, status: 200 }),
  transferBatch: async (batchId: string) => ({ data: { success: true }, message: `Batch transferred to lab`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
