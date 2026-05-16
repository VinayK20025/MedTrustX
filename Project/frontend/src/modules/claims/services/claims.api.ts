import type {
  ClaimsDashboardData, ClaimsKPI, ClaimDetails, ClaimFollowUp
} from '../types/claims.types';

export interface ClaimsFilters { stage?: string; insurer?: string; aging?: string; }

const mockKpis: ClaimsKPI[] = [
  { id: '1', title: 'Submitted', value: 145, format: 'number', status: 'normal' },
  { id: '2', title: 'Paid Today', value: 250000, format: 'currency', status: 'success' },
  { id: '3', title: 'Rejection Rate', value: '12%', format: 'text', status: 'critical' },
  { id: '4', title: 'Outstanding >30d', value: 850000, format: 'currency', status: 'warning' },
];

const mockClaims: ClaimDetails[] = [
  { id: 'CLM-5001', patientName: 'Anita Sharma', mrn: 'MRN-9901', insurer: 'Star Health', policyNumber: 'SH-29881', claimAmount: 150000, expectedAmount: 145000, receivedAmount: 145000, stage: 'Paid', submittedAt: new Date(Date.now() - 3600000000).toISOString(), agingDays: 41, agingBucket: '30+', missingDocuments: [] },
  { id: 'CLM-5002', patientName: 'Rajesh Kumar', mrn: 'MRN-4420', insurer: 'HDFC Ergo', policyNumber: 'HE-11029', claimAmount: 85000, expectedAmount: 85000, stage: 'Under Review', submittedAt: new Date(Date.now() - 1728000000).toISOString(), agingDays: 20, agingBucket: '8-30', missingDocuments: [] },
  { id: 'CLM-5003', patientName: 'Vikram Singh', mrn: 'MRN-3301', insurer: 'ICICI Lombard', policyNumber: 'IL-45230', claimAmount: 320000, expectedAmount: 300000, stage: 'Rejected', submittedAt: new Date(Date.now() - 864000000).toISOString(), agingDays: 10, agingBucket: '8-30', rejectionReason: 'Diagnosis code mismatch', missingDocuments: [] },
  { id: 'CLM-5004', patientName: 'Maya Devi', mrn: 'MRN-4402', insurer: 'New India Assurance', policyNumber: 'NI-88210', claimAmount: 45000, expectedAmount: 45000, stage: 'Draft', agingDays: 2, agingBucket: '0-7', missingDocuments: ['Final Bill', 'Discharge Summary'] },
  { id: 'CLM-5005', patientName: 'Sunita Rao', mrn: 'MRN-6620', insurer: 'Star Health', policyNumber: 'SH-31002', claimAmount: 75000, expectedAmount: 70000, receivedAmount: 50000, stage: 'Approved', submittedAt: new Date(Date.now() - 4320000000).toISOString(), agingDays: 50, agingBucket: '30+', missingDocuments: [] },
];

const mockFollowUps: ClaimFollowUp[] = [
  { id: 'FU-1', claimId: 'CLM-5003', patientName: 'Vikram Singh', insurer: 'ICICI Lombard', lastContact: new Date(Date.now() - 172800000).toISOString(), nextAction: 'Call relationship manager regarding rejection code', dueDate: new Date().toISOString(), status: 'Pending' },
  { id: 'FU-2', claimId: 'CLM-5005', patientName: 'Sunita Rao', insurer: 'Star Health', lastContact: new Date(Date.now() - 604800000).toISOString(), nextAction: 'Follow up on short payment (₹20K variance)', dueDate: new Date(Date.now() - 86400000).toISOString(), status: 'Overdue' },
];

export const claimsApi = {
  getDashboardSummary: async (filters: ClaimsFilters) => ({
    data: { kpis: mockKpis, claims: mockClaims, followUps: mockFollowUps } as ClaimsDashboardData,
    message: 'Success', status: 200,
  }),
  scheduleFollowUp: async (claimId: string, action: string, dueDate: string) => ({ data: { success: true }, message: 'Follow-up scheduled', status: 200 }),
  markFollowUpComplete: async (fuId: string) => ({ data: { success: true }, message: 'Follow-up completed', status: 200 }),
  resubmitClaim: async (claimId: string) => ({ data: { success: true }, message: 'Claim resubmitted', status: 200 }),
};
