import type { LegalDashboardData } from '../types/legal.types';

export interface LegalFilters { status?: string; type?: string; }

const mockData: LegalDashboardData = {
  kpis: [
    { id: '1', label: 'Active Litigation Cases', value: 4, status: 'critical' },
    { id: '2', label: 'Contracts Expiring (<30d)', value: 2, status: 'warning' },
    { id: '3', label: 'Compliance Status', value: '95%', status: 'success' },
    { id: '4', label: 'High Risk Alerts', value: 1, status: 'critical' },
  ],
  cases: [
    { id: 'LC-101', title: 'Smith vs MedTrustX', type: 'Medical Negligence', severity: 'High', status: 'In Court', parties: 'Patient Family vs Hospital (Dr. Gupta)', department: 'Surgery', openedAt: new Date(Date.now() - 86400000 * 120).toISOString(), nextHearingDate: new Date(Date.now() + 86400000 * 5).toISOString() },
    { id: 'LC-102', title: 'BioWaste Vendor Breach', type: 'Contractual Breach', severity: 'Medium', status: 'Settlement', parties: 'Hospital vs EcoWaste Ltd', openedAt: new Date(Date.now() - 86400000 * 45).toISOString() },
    { id: 'LC-103', title: 'Labor Tribunal Complaint', type: 'Labor Dispute', severity: 'Low', status: 'Open', parties: 'Nurse Union vs HR', department: 'HR', openedAt: new Date(Date.now() - 86400000 * 12).toISOString(), nextHearingDate: new Date(Date.now() + 86400000 * 14).toISOString() },
  ],
  timeline: [
    { id: 'TE-1', caseId: 'LC-101', date: new Date(Date.now() - 86400000 * 30).toISOString(), event: 'Initial court notice received', actor: 'High Court Registry' },
    { id: 'TE-2', caseId: 'LC-101', date: new Date(Date.now() - 86400000 * 15).toISOString(), event: 'Hospital legal reply filed', actor: 'Legal Counsel' },
    { id: 'TE-3', caseId: 'LC-101', date: new Date(Date.now() - 86400000 * 2).toISOString(), event: 'Evidence subpoena received for Dr. Gupta', actor: 'Opposing Counsel' },
  ],
  documents: [
    { id: 'DOC-91', caseId: 'LC-101', title: 'Subpoena Order', type: 'Court Notice', status: 'Final', uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(), isConfidential: true },
    { id: 'DOC-92', caseId: 'LC-101', title: 'Dr. Gupta Internal Statement', type: 'Evidence', status: 'In Review', uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(), isConfidential: true },
    { id: 'DOC-93', title: 'Annual Equipment Maintenance Contract', type: 'Contract', status: 'Signed', uploadedAt: new Date(Date.now() - 86400000 * 180).toISOString(), isConfidential: false },
  ],
  contracts: [
    { id: 'CON-1', vendor: 'EcoWaste Ltd', service: 'Bio-medical waste disposal', status: 'Breach', expiryDate: new Date(Date.now() + 86400000 * 60).toISOString(), value: '$45,000/yr' },
    { id: 'CON-2', vendor: 'TechMed Imaging', service: 'MRI AMC', status: 'Expiring Soon', expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(), value: '$120,000/yr' },
    { id: 'CON-3', vendor: 'CleanCorp', service: 'Facility Housekeeping', status: 'Active', expiryDate: new Date(Date.now() + 86400000 * 210).toISOString(), value: '$85,000/yr' },
  ],
  compliance: [
    { id: 'REG-1', regulation: 'PCPNDT Act Guidelines', status: 'Compliant', lastAudit: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'REG-2', regulation: 'Bio-Medical Waste Rules 2016', status: 'At Risk', lastAudit: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'REG-3', regulation: 'Clinical Establishments Act', status: 'Compliant', lastAudit: new Date(Date.now() - 86400000 * 90).toISOString() },
  ],
};

export const legalApi = {
  getDashboardSummary: async (f: LegalFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateCaseStatus: async (caseId: string, status: string) => ({ data: { success: true }, message: 'Case status updated', status: 200 }),
  uploadDocument: async (caseId: string | null, file: any) => ({ data: { success: true }, message: 'Document uploaded securely', status: 200 }),
  addTimelineEvent: async (caseId: string, event: string) => ({ data: { success: true }, message: 'Timeline updated', status: 200 }),
  renewContract: async (contractId: string) => ({ data: { success: true }, message: 'Contract renewal process initiated', status: 200 }),
};
