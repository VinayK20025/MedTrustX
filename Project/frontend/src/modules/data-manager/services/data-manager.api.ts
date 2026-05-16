import type { DataMgrData } from '../types/data-manager.types';

export interface DmFilters { status?: string; }

const mockData: DataMgrData = {
  kpis: [
    { id: '1', label: 'Total Records', value: '12,450', status: 'normal' },
    { id: '2', label: 'Error Rate', value: '1.2%', status: 'warning' },
    { id: '3', label: 'Open Queries', value: 38, status: 'warning' },
    { id: '4', label: 'Data Quality', value: '96.4%', status: 'success' },
  ],
  datasets: [
    { id: 'DS-01', name: 'Demographics & Baseline', study: 'CardioMeds Phase 3', totalRecords: 4200, errorCount: 12, completeness: 99, status: 'Active' },
    { id: 'DS-02', name: 'Efficacy Endpoints', study: 'CardioMeds Phase 3', totalRecords: 3100, errorCount: 45, completeness: 92, status: 'Active' },
    { id: 'DS-03', name: 'Safety / AE Log', study: 'CardioMeds Phase 3', totalRecords: 850, errorCount: 3, completeness: 100, status: 'Locked' },
    { id: 'DS-04', name: 'Lab Results', study: 'NeuroRegen Phase 1', totalRecords: 4300, errorCount: 89, completeness: 87, status: 'Active' },
  ],
  queries: [
    { id: 'Q-101', field: 'Systolic BP', subject: 'SUBJ-045', site: 'Site Alpha', issue: 'Value 320 mmHg exceeds plausible range', status: 'Open', raisedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'Q-102', field: 'Visit Date', subject: 'SUBJ-112', site: 'Site Beta', issue: 'Visit 4 date precedes Visit 3 date', status: 'Responded', raisedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'Q-103', field: 'Hemoglobin', subject: 'SUBJ-078', site: 'Site Alpha', issue: 'Missing required lab value', status: 'Open', raisedAt: new Date(Date.now() - 43200000).toISOString() },
  ],
  validationRules: [
    { id: 'VR-1', rule: 'Blood Pressure within 60–250 mmHg', category: 'Range', failCount: 3, status: 'Fail' },
    { id: 'VR-2', rule: 'All primary endpoint fields populated', category: 'Completeness', failCount: 45, status: 'Fail' },
    { id: 'VR-3', rule: 'Visit dates chronologically ordered', category: 'Logic', failCount: 1, status: 'Fail' },
    { id: 'VR-4', rule: 'Subject ID format XXX-NNN', category: 'Format', failCount: 0, status: 'Pass' },
  ]
};

export const dataMgrApi = {
  getDashboardSummary: async (f: DmFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  resolveQuery: async (queryId: string) => ({ data: { success: true }, message: 'Query resolved', status: 200 }),
  lockDataset: async (datasetId: string) => ({ data: { success: true }, message: 'Dataset locked for submission', status: 200 }),
  runValidation: async (datasetId: string) => ({ data: { success: true }, message: 'Validation engine executed', status: 200 }),
};
