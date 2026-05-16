import type { AuditorData } from '../types/external-auditor.types';

export interface AuditFilters { status?: string; }

const mockData: AuditorData = {
  kpis: [
    { id: '1', label: 'Active Audits', value: 2, status: 'normal' },
    { id: '2', label: 'Non-Compliance', value: 7, status: 'critical' },
    { id: '3', label: 'Compliance Score', value: '85%', status: 'warning' },
    { id: '4', label: 'Risk Level', value: 'Medium', status: 'warning' },
  ],
  audits: [
    { id: 'AUD-301', title: 'NABH Pre-Accreditation Assessment', scope: 'Hospital-Wide', standard: 'NABH', status: 'Active', department: 'All Departments', startDate: new Date(Date.now() - 259200000).toISOString(), complianceScore: 85, findingsCount: 7 },
    { id: 'AUD-302', title: 'ICU Infection Control Audit', scope: 'Focused', standard: 'JCI', status: 'Active', department: 'ICU / Critical Care', startDate: new Date(Date.now() - 86400000).toISOString(), complianceScore: 91, findingsCount: 3 },
    { id: 'AUD-303', title: 'OT Safety Compliance Check', scope: 'Focused', standard: 'Internal', status: 'Report Draft', department: 'Operation Theatre', startDate: new Date(Date.now() - 604800000).toISOString(), complianceScore: 78, findingsCount: 12 },
  ],
  checklist: [
    { id: 'cl1', criteria: 'Hand hygiene compliance ≥90%', standard: 'NABH ME 1.3', status: 'Compliant', evidenceLinked: true },
    { id: 'cl2', criteria: 'Crash cart checked daily with sign-off', standard: 'NABH ME 2.1', status: 'Non-Compliant', evidenceLinked: true },
    { id: 'cl3', criteria: 'Patient identification bands on all admitted patients', standard: 'JCI IPSG.1', status: 'Compliant', evidenceLinked: true },
    { id: 'cl4', criteria: 'Medication storage temperature logs maintained', standard: 'NABH ME 3.4', status: 'Partial', evidenceLinked: false },
    { id: 'cl5', criteria: 'Fire safety drills conducted quarterly', standard: 'NABH FMS 4.2', status: 'Non-Compliant', evidenceLinked: false },
    { id: 'cl6', criteria: 'Biomedical waste segregation at source', standard: 'NABH ME 5.1', status: 'Compliant', evidenceLinked: true },
    { id: 'cl7', criteria: 'Consent forms signed before invasive procedures', standard: 'JCI PFR.6.1', status: 'Compliant', evidenceLinked: true },
    { id: 'cl8', criteria: 'Staff credentialing files complete', standard: 'NABH HRM 1.1', status: 'Not Assessed', evidenceLinked: false },
  ],
  findings: [
    { id: 'F-01', issue: 'Crash cart checklist missing for 3 consecutive days in Ward B', severity: 'Major', department: 'Nursing', status: 'Open', evidenceRef: 'Photo evidence + ward log' },
    { id: 'F-02', issue: 'Fire drill not conducted in Q1 2024', severity: 'Major', department: 'Facility Management', status: 'Open' },
    { id: 'F-03', issue: 'Medication fridge temperature excursion not documented', severity: 'Minor', department: 'Pharmacy', status: 'Action Planned', evidenceRef: 'Temperature log gap' },
    { id: 'F-04', issue: 'Two patients found without identification bands in ICU', severity: 'Critical', department: 'ICU', status: 'Open', evidenceRef: 'Spot-check observation' },
  ]
};

export const auditorApi = {
  getDashboardSummary: async (f: AuditFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateCheckStatus: async (itemId: string, status: string) => ({ data: { success: true }, message: 'Checklist item updated', status: 200 }),
  closeFinding: async (findingId: string) => ({ data: { success: true }, message: 'Finding closed', status: 200 }),
  generateReport: async (auditId: string) => ({ data: { url: '/reports/audit.pdf' }, message: 'Audit report generated', status: 200 }),
};
