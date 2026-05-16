import type {
  ProcessingDashboardData, ProcessingKPI, ProcessingTask, ProcessingLog
} from '../types/processing.types';

export interface ProcessingFilters { status?: string; type?: string; priority?: string; }

const mockKpis: ProcessingKPI[] = [
  { id: '1', title: 'Processed Today', value: 142, format: 'number', status: 'success' },
  { id: '2', title: 'Pending Queue', value: 28, format: 'number', status: 'warning' },
  { id: '3', title: 'Error Rate', value: '2.4%', format: 'text', status: 'normal' },
  { id: '4', title: 'Avg Time / Task', value: '1.2m', format: 'text', status: 'success' },
];

const mockTasks: ProcessingTask[] = [
  { 
    id: 'TSK-9001', referenceId: 'CLM-4022', type: 'Claim Verification', priority: 'Critical', status: 'Pending', assignedAt: new Date(Date.now() - 3600000).toISOString(), patientName: 'Anita Sharma',
    formData: { 'Diagnosis Code': 'I21.9', 'Procedure Code': '36.06', 'Claim Amount': 150000 },
    validationIssues: [{ id: 'V1', field: 'Procedure Code', issue: 'Mismatch with primary diagnosis', severity: 'Error' }],
    requiredDocuments: [{ name: 'Discharge Summary', status: 'Uploaded' }]
  },
  { 
    id: 'TSK-9002', referenceId: 'BILL-8810', type: 'Billing Entry', priority: 'High', status: 'In Progress', assignedAt: new Date(Date.now() - 1800000).toISOString(), patientName: 'Rajesh Kumar',
    formData: { 'Consultation Fee': 1500, 'Lab Charges': 4500, 'Discount': 0 },
    validationIssues: [{ id: 'V2', field: 'Discount', issue: 'Corporate discount rule not applied', severity: 'Warning' }],
    requiredDocuments: []
  },
  { 
    id: 'TSK-9003', referenceId: 'DOC-5501', type: 'Document Check', priority: 'Routine', status: 'Blocked', assignedAt: new Date(Date.now() - 7200000).toISOString(), patientName: 'Maya Devi',
    formData: { 'ID Type': 'Aadhaar' },
    validationIssues: [{ id: 'V3', field: 'ID Proof', issue: 'Document is blurry/unreadable', severity: 'Error' }],
    requiredDocuments: [{ name: 'ID Proof', status: 'Uploaded' }]
  },
  { 
    id: 'TSK-9004', referenceId: 'BILL-8812', type: 'Billing Entry', priority: 'Routine', status: 'Pending', assignedAt: new Date().toISOString(), patientName: 'Vikram Singh',
    formData: { 'Pharmacy Total': 3200, 'Ward Charges': 12000 },
    validationIssues: [],
    requiredDocuments: []
  },
];

const mockLogs: ProcessingLog[] = [
  { id: 'LOG-1', taskId: 'TSK-8999', action: 'Claim Verification Submitted', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Success' },
  { id: 'LOG-2', taskId: 'TSK-8998', action: 'Billing Entry Processed', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'Success' },
  { id: 'LOG-3', taskId: 'TSK-9003', action: 'Validation Check Failed - Blurry ID', timestamp: new Date(Date.now() - 1200000).toISOString(), status: 'Failed' },
];

export const processingApi = {
  getDashboardSummary: async (filters: ProcessingFilters) => ({
    data: { kpis: mockKpis, tasks: mockTasks, logs: mockLogs } as ProcessingDashboardData,
    message: 'Success', status: 200,
  }),
  submitTask: async (taskId: string, data: any) => ({ data: { success: true }, message: 'Task processed successfully', status: 200 }),
  bulkProcessTasks: async (taskIds: string[]) => ({ data: { success: true, processed: taskIds.length }, message: `${taskIds.length} tasks bulk processed`, status: 200 }),
};
