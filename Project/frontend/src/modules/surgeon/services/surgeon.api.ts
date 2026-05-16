import type {
  SurgeonDashboardData, SurgeonKPI, SurgicalCase, ActiveSurgery, IntraOpVitals,
  PreOpReview, PostOpNote, SurgicalAlert
} from '../types/surgeon.types';

export interface SurgeonFilters {
  date?: string;
  room?: string;
}

const mockKpis: SurgeonKPI[] = [
  { id: '1', title: 'Surgeries Today', value: 4, format: 'number', status: 'normal' },
  { id: '2', title: 'In Progress', value: 1, format: 'number', status: 'success', actionLabel: 'View OT-3', actionUrl: '/dashboard/surgeon/intraop' },
  { id: '3', title: 'Pending Notes', value: 2, format: 'number', status: 'warning', actionLabel: 'Dictate Now', actionUrl: '/dashboard/surgeon/postop' },
  { id: '4', title: 'Critical Alerts', value: 0, format: 'number', status: 'normal' },
];

const mockCases: SurgicalCase[] = [
  { id: 'CASE-001', patientName: 'Robert Langdon', mrn: 'MRN-8812', procedure: 'Laparoscopic Cholecystectomy', type: 'Elective', otRoom: 'OT-1', scheduledTime: '08:00 AM', status: 'Completed', estimatedDuration: 90, surgeonRole: 'Primary' },
  { id: 'CASE-002', patientName: 'Maria Garcia', mrn: 'MRN-3341', procedure: 'Total Knee Arthroplasty (Right)', type: 'Elective', otRoom: 'OT-3', scheduledTime: '11:00 AM', status: 'In Progress', estimatedDuration: 150, surgeonRole: 'Primary' },
  { id: 'CASE-003', patientName: 'John Smith', mrn: 'MRN-1122', procedure: 'Exploratory Laparotomy', type: 'Emergency', otRoom: 'OT-2', scheduledTime: '03:00 PM', status: 'Pre-Op', estimatedDuration: 120, surgeonRole: 'Primary' },
];

const mockPreOpReviews: PreOpReview[] = [
  { caseId: 'CASE-003', patientId: 'PAT-SURG-03', diagnosis: 'Acute Abdomen, suspected perforation', history: 'HTN, Type 2 DM. NPO since 06:00.', clearanceStatus: 'Cleared', imagingAvailable: true, labsReviewed: true, bloodMatched: true, surgicalPlan: 'Midline incision, explore all four quadrants, repair/resect as indicated.' },
];

const mockActiveSurgery: ActiveSurgery = {
  caseId: 'CASE-002',
  startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  durationMinutes: 60,
  currentPhase: 'Resection',
  bloodLoss: 150,
  fluidsGiven: 1000,
  complications: [],
  steps: [
    { id: 'STEP-1', description: 'Patient positioning & prep', status: 'Completed', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'STEP-2', description: 'Incision & exposure', status: 'Completed', timestamp: new Date(Date.now() - 2700000).toISOString() },
    { id: 'STEP-3', description: 'Bone resection & sizing', status: 'In Progress' },
    { id: 'STEP-4', description: 'Implant placement', status: 'Pending' },
    { id: 'STEP-5', description: 'Closure', status: 'Pending' },
  ]
};

const mockLiveVitals: IntraOpVitals = {
  caseId: 'CASE-002',
  timestamp: new Date().toISOString(),
  heartRate: 72,
  bloodPressure: { sys: 118, dia: 76 },
  spO2: 99,
  etco2: 36,
  temp: 36.6,
  anesthesiaDepth: 45 // BIS score (40-60 is adequate general anesthesia)
};

const mockPostOpNotes: PostOpNote[] = [
  { id: 'NOTE-001', caseId: 'CASE-001', date: new Date().toISOString(), surgeonId: 'SURG-01', preOpDiagnosis: 'Symptomatic Cholelithiasis', postOpDiagnosis: 'Same', procedurePerformed: 'Laparoscopic Cholecystectomy', findings: 'Distended gallbladder with multiple stones. No evidence of acute inflammation.', complications: 'None', status: 'Draft' },
];

const mockAlerts: SurgicalAlert[] = [];

export const surgeonApi = {
  getDashboardSummary: async (filters: SurgeonFilters) => ({
    data: {
      kpis: mockKpis,
      casesToday: mockCases,
      activeSurgery: mockActiveSurgery,
      liveVitals: mockLiveVitals,
      preOpReviews: mockPreOpReviews,
      postOpNotes: mockPostOpNotes,
      alerts: mockAlerts,
    } as SurgeonDashboardData,
    message: 'Success', status: 200,
  }),

  advanceSurgicalStep: async (caseId: string, stepId: string) => ({ data: { success: true }, message: 'Surgical phase advanced', status: 200 }),
  signPostOpNote: async (noteId: string) => ({ data: { success: true }, message: 'Operative note signed cryptographically', status: 200 }),
  logComplication: async (caseId: string, text: string) => ({ data: { success: true }, message: 'Intra-op event logged', status: 200 }),
};
