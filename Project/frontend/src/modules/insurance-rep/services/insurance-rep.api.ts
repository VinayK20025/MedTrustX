import type { InsuranceRepData } from '../types/insurance-rep.types';

export interface IrFilters { status?: string; }

const mockData: InsuranceRepData = {
  kpis: [
    { id: '1', label: 'Active Cases', value: 14, status: 'normal' },
    { id: '2', label: 'Pre-Auth Pending', value: 5, status: 'warning' },
    { id: '3', label: 'Claims Processed', value: 22, status: 'success' },
    { id: '4', label: 'Avg Turnaround', value: '4.2h', status: 'success' },
  ],
  cases: [
    { id: 'IC-701', patientName: 'Vikram Sehgal', policyNumber: 'POL-98712', insurer: 'Max Bupa Health', treatment: 'CABG Surgery', estimatedCost: 450000, coverageLimit: 500000, status: 'Pre-Auth Pending', admissionDate: new Date(Date.now() - 86400000).toISOString(), missingDocs: [] },
    { id: 'IC-702', patientName: 'Neha Agarwal', policyNumber: 'POL-45231', insurer: 'Star Health', treatment: 'Laparoscopic Cholecystectomy', estimatedCost: 85000, coverageLimit: 300000, status: 'Approved', admissionDate: new Date(Date.now() - 172800000).toISOString(), missingDocs: [] },
    { id: 'IC-703', patientName: 'Ravi Menon', policyNumber: 'POL-33109', insurer: 'ICICI Lombard', treatment: 'Knee Replacement (Right)', estimatedCost: 280000, coverageLimit: 200000, status: 'Claim Submitted', admissionDate: new Date(Date.now() - 604800000).toISOString(), missingDocs: ['Discharge Summary'] },
    { id: 'IC-704', patientName: 'Sunita Devi', policyNumber: 'POL-77845', insurer: 'Max Bupa Health', treatment: 'Dialysis (10 sessions)', estimatedCost: 120000, coverageLimit: 150000, status: 'Eligibility Check', admissionDate: new Date().toISOString(), missingDocs: ['Policy Card Copy', 'ID Proof'] },
  ],
  preAuths: [
    { id: 'PA-01', caseId: 'IC-701', treatment: 'CABG Surgery', estimatedAmount: 450000, status: 'Pending', requestedAt: new Date(Date.now() - 43200000).toISOString(), turnaroundHrs: 12 },
    { id: 'PA-02', caseId: 'IC-704', treatment: 'Dialysis (10 sessions)', estimatedAmount: 120000, status: 'Query Raised', requestedAt: new Date(Date.now() - 7200000).toISOString(), turnaroundHrs: 2 },
  ],
  claims: [
    { id: 'CLM-301', caseId: 'IC-703', claimAmount: 280000, approvedAmount: 200000, status: 'Under Review', submittedAt: new Date(Date.now() - 172800000).toISOString(), docsComplete: false },
    { id: 'CLM-302', caseId: 'IC-702', claimAmount: 82000, approvedAmount: 82000, status: 'Approved', submittedAt: new Date(Date.now() - 259200000).toISOString(), docsComplete: true },
  ]
};

export const insuranceRepApi = {
  getDashboardSummary: async (f: IrFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  approvePreAuth: async (id: string) => ({ data: { success: true }, message: 'Pre-authorization approved', status: 200 }),
  rejectPreAuth: async (id: string) => ({ data: { success: true }, message: 'Pre-authorization rejected', status: 200 }),
  approveClaim: async (id: string) => ({ data: { success: true }, message: 'Claim approved for settlement', status: 200 }),
  queryCase: async (id: string, message: string) => ({ data: { success: true }, message: 'Query raised with hospital', status: 200 }),
};
