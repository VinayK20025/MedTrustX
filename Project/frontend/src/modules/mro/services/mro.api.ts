import type {
  MroDashboardData, MroKPI, PatientRecord,
  CodingData, ValidationDeficiency
} from '../types/mro.types';

export interface MroFilters {
  status?: string;
}

const mockKpis: MroKPI[] = [
  { id: '1', title: 'Pending Coding', value: 42, format: 'number', status: 'warning', actionLabel: 'Start Coding', actionUrl: '/dashboard/mro/coding' },
  { id: '2', title: 'Incomplete Records', value: 15, format: 'number', status: 'critical', actionLabel: 'Review Deficiencies', actionUrl: '/dashboard/mro/validation' },
  { id: '3', title: 'Coding Accuracy', value: '98.5%', format: 'text', status: 'success' },
  { id: '4', title: 'Release Requests', value: 7, format: 'number', status: 'normal' },
];

const mockRecords: PatientRecord[] = [
  { id: 'REC-101', patientName: 'William Carter', mrn: 'MRN-4491', encounterType: 'Inpatient', status: 'Incomplete', completionPercentage: 85, dischargeDate: new Date(Date.now() - 172800000).toISOString() },
  { id: 'REC-102', patientName: 'Samantha Jones', mrn: 'MRN-8821', encounterType: 'ER', status: 'Pending Coding', completionPercentage: 100, dischargeDate: new Date(Date.now() - 86400000).toISOString() },
];

const mockCoding: CodingData = {
  id: 'COD-102',
  recordId: 'REC-102',
  clinicalNotes: 'Patient presented to ER with acute right lower quadrant abdominal pain, nausea, and fever. CT confirmed acute appendicitis. Emergent laparoscopic appendectomy performed without complications.',
  suggestedICDCodes: [
    { code: 'K35.80', description: 'Unspecified acute appendicitis', confidence: 95 },
    { code: 'R10.31', description: 'Right lower quadrant pain', confidence: 88 },
  ],
  suggestedCPTCodes: [
    { code: '44970', description: 'Laparoscopy, surgical, appendectomy', confidence: 98 },
  ],
  assignedICD: [],
  assignedCPT: [],
  codingStatus: 'Pending',
};

const mockDeficiencies: ValidationDeficiency[] = [
  { id: 'DEF-1', recordId: 'REC-101', severity: 'critical', category: 'Missing Signature', description: 'Attending physician signature missing on final discharge summary.', assignedPhysician: 'Dr. Evans', status: 'Open' },
  { id: 'DEF-2', recordId: 'REC-101', severity: 'warning', category: 'Incomplete Note', description: 'Operative note missing estimated blood loss.', assignedPhysician: 'Dr. Evans', status: 'Open' },
];

export const mroApi = {
  getDashboardSummary: async (filters: MroFilters) => ({
    data: {
      kpis: mockKpis,
      records: mockRecords,
      activeCoding: mockCoding,
      deficiencies: mockDeficiencies,
    } as MroDashboardData,
    message: 'Success', status: 200,
  }),

  assignCode: async (codingId: string, type: 'ICD' | 'CPT', code: string) => ({ data: { success: true }, message: `${type} code assigned`, status: 200 }),
  finalizeCoding: async (codingId: string) => ({ data: { success: true }, message: `Coding finalized for record`, status: 200 }),
  nudgePhysician: async (deficiencyId: string) => ({ data: { success: true }, message: `Reminder sent to physician`, status: 200 }),
};
