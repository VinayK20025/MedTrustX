import type { QualityManagerData } from '../types/quality-manager.types';

export interface QmFilters { department?: string; dateRange?: string; }

const mockData: QualityManagerData = {
  kpis: [
    { id: '1', label: 'Hospital Compliance', value: '92%', trend: 'up', status: 'success' },
    { id: '2', label: 'Infection Rate', value: '1.4%', trend: 'down', status: 'success' },
    { id: '3', label: 'Open Incidents', value: 8, trend: 'up', status: 'warning' },
    { id: '4', label: 'CAPA Resolution', value: '78%', trend: 'flat', status: 'warning' },
  ],
  scorecards: [
    { id: 'SC-ICU', department: 'ICU', score: 85, complianceScore: 88, incidentCount: 4, status: 'Warning' },
    { id: 'SC-OT', department: 'Operation Theatre', score: 96, complianceScore: 98, incidentCount: 1, status: 'Pass' },
    { id: 'SC-ER', department: 'Emergency Room', score: 72, complianceScore: 76, incidentCount: 12, status: 'Fail' },
    { id: 'SC-WARDB', department: 'Ward B', score: 91, complianceScore: 90, incidentCount: 2, status: 'Pass' },
  ],
  audits: [
    { id: 'AUD-01', title: 'NABH Pre-Assessment', type: 'NABH', area: 'All Departments', status: 'In Progress', scheduledDate: new Date(Date.now() - 86400000).toISOString(), auditor: 'Dr. Sharma' },
    { id: 'AUD-02', title: 'Medication Safety Audit', type: 'Internal', area: 'Pharmacy & Wards', status: 'Scheduled', scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(), auditor: 'Priya N.' },
    { id: 'AUD-03', title: 'JCI Mock Drill', type: 'JCI', area: 'ICU', status: 'Review', scheduledDate: new Date(Date.now() - 86400000 * 5).toISOString(), auditor: 'Quality Team' },
  ],
  incidents: [
    { id: 'INC-991', type: 'Medication Error', severity: 'Sentinel', department: 'ICU', status: 'RCA Required', reportedAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'INC-992', type: 'Fall', severity: 'Moderate', department: 'Ward B', status: 'Reported', reportedAt: new Date(Date.now() - 1200000).toISOString() },
    { id: 'INC-993', type: 'Equipment Failure', severity: 'Major', department: 'ER', status: 'RCA Ongoing', reportedAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  capas: [
    { id: 'CAPA-12', issue: 'High Hand Hygiene failure rate in night shift', action: 'Implement random spot checks and mandate supervisor sign-off.', department: 'All Wards', status: 'Implemented', dueDate: new Date(Date.now() - 86400000).toISOString() },
    { id: 'CAPA-13', issue: 'Repeated medication dispensing delays', action: 'Revise pneumatic tube protocol.', department: 'Pharmacy', status: 'Verifying', dueDate: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: 'CAPA-14', issue: 'Ventilator maintenance overdue', action: 'Integrate AMC alerts directly into Biomedical Dashboard.', department: 'ICU', status: 'Draft', dueDate: new Date(Date.now() + 86400000 * 5).toISOString() },
  ],
  alerts: [
    { id: 'AL-1', title: 'Sentinel Event Reported', description: 'A sentinel medication error occurred in the ICU. Immediate RCA required by NABH guidelines.', severity: 'Critical', department: 'ICU', detectedAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'AL-2', title: 'Compliance Drop', description: 'ER compliance score dropped below the 80% minimum threshold.', severity: 'High', department: 'ER', detectedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
};

export const qualityManagerApi = {
  getDashboardSummary: async (f: QmFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  initiateRca: async (incidentId: string) => ({ data: { success: true }, message: 'RCA process initiated', status: 200 }),
  approveCapa: async (capaId: string) => ({ data: { success: true }, message: 'CAPA approved', status: 200 }),
  scheduleAudit: async (payload: any) => ({ data: { success: true }, message: 'Audit scheduled', status: 200 }),
  dismissAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert dismissed', status: 200 }),
};
