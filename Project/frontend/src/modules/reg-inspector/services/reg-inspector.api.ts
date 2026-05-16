import type { InspectorData } from '../types/reg-inspector.types';

export interface RiFilters { status?: string; }

const mockData: InspectorData = {
  kpis: [
    { id: '1', label: 'Inspections Done', value: 3, status: 'normal' },
    { id: '2', label: 'Violations Found', value: 8, status: 'critical' },
    { id: '3', label: 'Enforcement Actions', value: 4, status: 'warning' },
    { id: '4', label: 'Compliance Score', value: '72%', status: 'critical' },
  ],
  inspections: [
    { id: 'INS-501', facility: 'City General Hospital', type: 'Scheduled', scope: 'Full Facility — Fire, Infection, Licensing', status: 'In Progress', date: new Date(Date.now() - 86400000).toISOString(), violationsFound: 5, complianceScore: 72 },
    { id: 'INS-502', facility: 'MedCare Specialty Clinic', type: 'Surprise', scope: 'Pharmacy & Drug Storage', status: 'Report Pending', date: new Date(Date.now() - 259200000).toISOString(), violationsFound: 3, complianceScore: 81 },
    { id: 'INS-503', facility: 'City General Hospital', type: 'Follow-Up', scope: 'Fire Safety Rectification', status: 'Planned', date: new Date(Date.now() + 604800000).toISOString(), violationsFound: 0, complianceScore: 0 },
  ],
  checklist: [
    { id: 'lc1', law: 'Clinical Establishments Act', section: 'Sec 12(1)', criteria: 'Valid registration certificate displayed', status: 'Compliant', evidenceCaptured: true },
    { id: 'lc2', law: 'Fire Safety Act', section: 'Rule 4.3', criteria: 'Fire exits unobstructed and clearly marked', status: 'Violation', evidenceCaptured: true },
    { id: 'lc3', law: 'Drugs & Cosmetics Act', section: 'Sec 18(c)', criteria: 'Controlled substances stored in locked cabinet with register', status: 'Violation', evidenceCaptured: true },
    { id: 'lc4', law: 'Bio-Medical Waste Rules', section: 'Rule 8', criteria: 'Color-coded waste bins at all generation points', status: 'Compliant', evidenceCaptured: true },
    { id: 'lc5', law: 'PNDT Act', section: 'Sec 4', criteria: 'Ultrasound Form F maintained and filed', status: 'Compliant', evidenceCaptured: false },
    { id: 'lc6', law: 'Fire Safety Act', section: 'Rule 7.1', criteria: 'Fire NOC valid and not expired', status: 'Violation', evidenceCaptured: true },
    { id: 'lc7', law: 'Clinical Establishments Act', section: 'Sec 14(2)', criteria: 'Minimum staffing ratios maintained', status: 'Partial', evidenceCaptured: false },
  ],
  violations: [
    { id: 'V-01', issue: 'Fire exit on 3rd floor blocked by storage equipment', law: 'Fire Safety Act, Rule 4.3', severity: 'Critical', department: 'Facility', status: 'Notice Issued', geoTag: '28.6139°N, 77.2090°E', evidenceCount: 3 },
    { id: 'V-02', issue: 'Controlled drugs register not updated for 14 days', law: 'Drugs & Cosmetics Act, Sec 18(c)', severity: 'Major', department: 'Pharmacy', status: 'Open', evidenceCount: 2 },
    { id: 'V-03', issue: 'Fire NOC expired since March 2024', law: 'Fire Safety Act, Rule 7.1', severity: 'Critical', department: 'Administration', status: 'Open', evidenceCount: 1 },
    { id: 'V-04', issue: 'Nurse-to-patient ratio below minimum in Ward C', law: 'Clinical Establishments Act, Sec 14(2)', severity: 'Minor', department: 'Nursing', status: 'Open', evidenceCount: 0 },
  ],
  actions: [
    { id: 'EA-01', violationId: 'V-01', type: 'Show Cause', status: 'Issued', issuedAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'EA-02', violationId: 'V-03', type: 'Warning Notice', status: 'Draft' },
  ]
};

export const regInspectorApi = {
  getDashboardSummary: async (f: RiFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  issueNotice: async (violationId: string, type: string) => ({ data: { success: true }, message: 'Legal notice issued', status: 200 }),
  closeViolation: async (violationId: string) => ({ data: { success: true }, message: 'Violation rectified and closed', status: 200 }),
  generateInspectionReport: async (inspectionId: string) => ({ data: { url: '/reports/inspection.pdf' }, message: 'Inspection report generated', status: 200 }),
};
