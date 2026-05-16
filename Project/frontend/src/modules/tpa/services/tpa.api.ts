import type {
  TpaDashboardData, TpaKPI, TpaCase, TpaDocument, TpaCommunication
} from '../types/tpa.types';

export interface TpaFilters { stage?: string; insurer?: string; priority?: string; }

const mockKpis: TpaKPI[] = [
  { id: '1', title: 'Pending Approvals', value: 14, format: 'number', status: 'warning' },
  { id: '2', title: 'Approvals Today', value: 25, format: 'number', status: 'success' },
  { id: '3', title: 'Avg Turnaround', value: '6.5 hrs', format: 'text', status: 'normal' },
  { id: '4', title: 'Discharge Delays', value: 3, format: 'number', status: 'critical' },
];

const mockCases: TpaCase[] = [
  { id: 'TPA-101', patientName: 'Anita Sharma', mrn: 'MRN-9901', insurer: 'Star Health', policyNumber: 'SH-29881', estimatedCost: 150000, stage: 'Under Review', priority: 'Urgent', type: 'Pre-Auth', submittedAt: new Date(Date.now() - 21600000).toISOString(), agingHours: 6, dischargeBlocked: false },
  { id: 'TPA-102', patientName: 'Rajesh Kumar', mrn: 'MRN-4420', insurer: 'HDFC Ergo', tpaName: 'MediAssist', policyNumber: 'HE-11029', estimatedCost: 85000, approvedAmount: 85000, stage: 'Approved', priority: 'Routine', type: 'Pre-Auth', submittedAt: new Date(Date.now() - 86400000).toISOString(), agingHours: 24, dischargeBlocked: false },
  { id: 'TPA-103', patientName: 'Vikram Singh', mrn: 'MRN-3301', insurer: 'ICICI Lombard', policyNumber: 'IL-45230', estimatedCost: 320000, stage: 'Additional Info', priority: 'Emergency', type: 'Enhancement', submittedAt: new Date(Date.now() - 172800000).toISOString(), agingHours: 48, dischargeBlocked: true },
  { id: 'TPA-104', patientName: 'Maya Devi', mrn: 'MRN-4402', insurer: 'New India Assurance', policyNumber: 'NI-88210', estimatedCost: 45000, stage: 'Submitted', priority: 'Routine', type: 'Discharge', submittedAt: new Date(Date.now() - 14400000).toISOString(), agingHours: 4, dischargeBlocked: true },
  { id: 'TPA-105', patientName: 'Sunita Rao', mrn: 'MRN-6620', insurer: 'Star Health', policyNumber: 'SH-31002', estimatedCost: 75000, stage: 'Rejected', priority: 'Routine', type: 'Pre-Auth', submittedAt: new Date(Date.now() - 259200000).toISOString(), agingHours: 72, dischargeBlocked: false, rejectionReason: 'Condition pre-existing, waiting period not completed' },
];

const mockDocs: Record<string, TpaDocument[]> = {
  'TPA-101': [
    { id: 'D1', name: 'Aadhaar Card', type: 'ID Proof', status: 'Verified', uploadedAt: new Date().toISOString() },
    { id: 'D2', name: 'Star Health E-Card', type: 'Policy Copy', status: 'Verified', uploadedAt: new Date().toISOString() },
    { id: 'D3', name: 'Consultation Note', type: 'Doctor Note', status: 'Uploaded', uploadedAt: new Date().toISOString() },
    { id: 'D4', name: 'Surgery Estimate', type: 'Estimate', status: 'Missing' },
  ],
  'TPA-103': [
    { id: 'D5', name: 'Discharge Summary Draft', type: 'Discharge Summary', status: 'Missing' },
    { id: 'D6', name: 'Final Bill Estimate', type: 'Estimate', status: 'Uploaded', uploadedAt: new Date().toISOString() },
  ]
};

const mockLogs: Record<string, TpaCommunication[]> = {
  'TPA-101': [
    { id: 'L1', type: 'Portal', direction: 'Outbound', summary: 'Pre-auth request submitted online', timestamp: new Date(Date.now() - 21600000).toISOString(), user: 'TPA Coord' },
    { id: 'L2', type: 'Call', direction: 'Inbound', summary: 'TPA requested detailed estimate', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Insurer Desk' },
  ],
  'TPA-103': [
    { id: 'L3', type: 'Email', direction: 'Outbound', summary: 'Sent clinical notes for enhancement', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'TPA Coord' },
    { id: 'L4', type: 'Portal', direction: 'Inbound', summary: 'Status changed to "Query/Additional Info"', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Insurer Portal' },
  ]
};

export const tpaApi = {
  getDashboardSummary: async (filters: TpaFilters) => ({
    data: { kpis: mockKpis, cases: mockCases, documents: mockDocs, logs: mockLogs } as TpaDashboardData,
    message: 'Success', status: 200,
  }),
  uploadDocument: async (caseId: string, docType: string) => ({ data: { success: true }, message: 'Document uploaded', status: 200 }),
  addCommunication: async (caseId: string, message: string) => ({ data: { success: true }, message: 'Log added', status: 200 }),
  escalateCase: async (caseId: string) => ({ data: { success: true }, message: 'Case escalated to senior manager', status: 200 }),
};
