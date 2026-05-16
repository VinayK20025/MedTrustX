import type { LegalComplianceData } from '../types/legal-compliance.types';

export interface LcFilters { status?: string; department?: string; }

const mockData: LegalComplianceData = {
  kpis: [
    { id: '1', label: 'Overall Compliance', value: '94%', status: 'success' },
    { id: '2', label: 'Active Violations', value: 2, subLabel: '1 Critical', status: 'critical' },
    { id: '3', label: 'Expiring Licenses (<30d)', value: 1, status: 'warning' },
    { id: '4', label: 'Pending Audits', value: 4, status: 'normal' },
  ],
  licenses: [
    { id: 'LIC-01', name: 'AERB Radiology Certification', type: 'Radiology (AERB)', expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(), status: 'Expiring Soon', renewalStatus: 'In Progress' },
    { id: 'LIC-02', name: 'State Fire NOC', type: 'Fire Safety', expiryDate: new Date(Date.now() + 86400000 * 180).toISOString(), status: 'Active', renewalStatus: 'Not Started' },
    { id: 'LIC-03', name: 'Blood Bank FDA License', type: 'Blood Bank', expiryDate: new Date(Date.now() + 86400000 * 320).toISOString(), status: 'Active', renewalStatus: 'Not Started' },
    { id: 'LIC-04', name: 'Narcotics Storage License', type: 'Pharmacy', expiryDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Expired', renewalStatus: 'Submitted' },
  ],
  regulations: [
    { id: 'REG-01', law: 'Clinical Establishments (Registration and Regulation) Act', departmentScope: 'Hospital Wide', complianceStatus: 'Compliant', lastAuditDate: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'REG-02', law: 'Bio-Medical Waste Management Rules', departmentScope: 'Housekeeping & Wards', complianceStatus: 'At Risk', lastAuditDate: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: 'REG-03', law: 'PCPNDT Act (Pre-Conception & Pre-Natal)', departmentScope: 'Radiology & Maternity', complianceStatus: 'Compliant', lastAuditDate: new Date(Date.now() - 86400000 * 60).toISOString() },
    { id: 'REG-04', law: 'HIPAA / Data Privacy Act', departmentScope: 'IT & Records', complianceStatus: 'Non-Compliant', lastAuditDate: new Date(Date.now() - 86400000 * 5).toISOString() },
  ],
  violations: [
    { id: 'VIO-01', issue: 'Unencrypted patient data transfer detected on internal network.', severity: 'Critical', department: 'IT', status: 'Investigating', detectedAt: new Date(Date.now() - 86400000 * 2).toISOString(), penaltyRisk: 'Statutory Fines + Civil Liability' },
    { id: 'VIO-02', issue: 'Bio-waste red bags found co-mingled in general disposal.', severity: 'High', department: 'Ward B', status: 'Open', detectedAt: new Date(Date.now() - 43200000).toISOString(), penaltyRisk: 'License Suspension Warning' },
  ],
  checklists: [
    { id: 'CHK-01', title: 'Monthly Fire Safety Audit', department: 'Facility Mgmt', totalChecks: 45, completedChecks: 40, dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'In Progress' },
    { id: 'CHK-02', title: 'Pharmacy Narcotics Log Audit', department: 'Pharmacy', totalChecks: 20, completedChecks: 0, dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'Pending' },
  ],
};

export const legalComplianceApi = {
  getDashboardSummary: async (f: LcFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  initiateRenewal: async (licenseId: string) => ({ data: { success: true }, message: 'Renewal workflow initiated', status: 200 }),
  resolveViolation: async (violationId: string, notes: string) => ({ data: { success: true }, message: 'Violation marked as resolved', status: 200 }),
  exportComplianceReport: async () => ({ data: { success: true, link: '#' }, message: 'Statutory report generated', status: 200 }),
};
