import type { IcnDashboardData } from '../types/icn.types';

export interface IcnFilters { status?: string; ward?: string; }

const mockData: IcnDashboardData = {
  nurseName: 'Nurse Sarah Jenkins',
  kpis: [
    { id: '1', label: 'Audits Today', value: 12, status: 'success' },
    { id: '2', label: 'Pending Tasks', value: 4, status: 'warning' },
    { id: '3', label: 'Non-Compliance', value: 2, status: 'critical' },
  ],
  tasks: [
    { id: 'TSK-901', title: 'Hand Hygiene Audit', type: 'Hygiene Audit', ward: 'ICU', priority: 'High', status: 'In Progress', dueAt: new Date(Date.now() + 1800000).toISOString() },
    { id: 'TSK-902', title: 'PPE Check — Isolation Bay', type: 'PPE Audit', ward: 'Ward A', priority: 'High', status: 'Pending', dueAt: new Date(Date.now() + 3600000).toISOString() },
    { id: 'TSK-903', title: 'MRSA Contact Tracing Swabs', type: 'Surveillance Check', ward: 'Surgical', priority: 'Medium', status: 'Pending', dueAt: new Date(Date.now() + 7200000).toISOString() },
    { id: 'TSK-904', title: 'Setup C.diff Isolation Room', type: 'Isolation Setup', ward: 'Ward B', priority: 'Medium', status: 'Pending', dueAt: new Date(Date.now() + 10800000).toISOString() },
    { id: 'TSK-905', title: 'Central Line Care Audit', type: 'Hygiene Audit', ward: 'ICU', priority: 'Low', status: 'Completed', dueAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  activeAudit: {
    id: 'AUD-550',
    taskId: 'TSK-901',
    ward: 'ICU',
    type: 'Hygiene',
    status: 'Draft',
    items: [
      { id: 'chk-1', label: 'Hand hygiene before patient contact', status: 'Pass' },
      { id: 'chk-2', label: 'Hand hygiene before aseptic task', status: 'Fail', notes: 'Missed by nurse at bed 4' },
      { id: 'chk-3', label: 'Hand hygiene after fluid exposure risk', status: 'Pending' },
      { id: 'chk-4', label: 'Hand hygiene after patient contact', status: 'Pending' },
      { id: 'chk-5', label: 'Hand hygiene after touching surroundings', status: 'Pending' },
      { id: 'chk-6', label: 'Alcohol rub available at point of care', status: 'Pending' },
    ],
  },
  patients: [
    { id: 'PT-101', patientTag: 'P-1290', ward: 'ICU', bed: 'Bed 4', infectionRisk: 'High', isolated: true, lastCheckedAt: new Date(Date.now() - 3600000).toISOString(), notes: 'MRSA positive. Contact precautions active.' },
    { id: 'PT-102', patientTag: 'P-1295', ward: 'Ward A', bed: 'Bed 12', infectionRisk: 'Moderate', isolated: false, lastCheckedAt: new Date(Date.now() - 7200000).toISOString(), notes: 'Awaiting C.diff culture results.' },
  ],
};

export const icnApi = {
  getDashboardSummary: async (f: IcnFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateChecklistItem: async (auditId: string, itemId: string, status: 'Pass' | 'Fail', notes?: string) => ({ data: { success: true }, message: 'Item updated', status: 200 }),
  submitAudit: async (auditId: string) => ({ data: { success: true }, message: 'Audit submitted successfully', status: 200 }),
  updateTaskStatus: async (taskId: string, status: string) => ({ data: { success: true }, message: 'Task updated', status: 200 }),
  reportIssue: async (type: string, description: string, ward: string) => ({ data: { success: true }, message: 'Issue reported to ICO', status: 200 }),
};
