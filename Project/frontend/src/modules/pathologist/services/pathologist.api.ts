import type {
  PathologistDashboardData, PathologistKPI, PathologistCase, CaseResults, PathologistAlert
} from '../types/pathologist.types';

export interface PathologistFilters {
  priority?: string;
  status?: string;
}

const mockKpis: PathologistKPI[] = [
  { id: '1', title: 'Pending Review', value: 12, format: 'number', status: 'warning' },
  { id: '2', title: 'Critical Alerts', value: 2, format: 'number', status: 'critical', actionLabel: 'View Alerts', actionUrl: '/dashboard/pathologist/alerts' },
  { id: '3', title: 'Validated Today', value: 45, format: 'number', status: 'success' },
  { id: '4', title: 'Avg Turnaround', value: '4.2h', format: 'time', status: 'normal' },
];

const mockCases: PathologistCase[] = [
  { id: 'PATH-10293', patientName: 'John Doe', patientId: 'MRN-48572', testType: 'Histopathology', status: 'In Analysis', priority: 'Urgent', receivedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'PATH-10294', patientName: 'Jane Smith', patientId: 'MRN-92837', testType: 'Biochemistry', status: 'Pending Review', priority: 'STAT', receivedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'PATH-10295', patientName: 'Robert Johnson', patientId: 'MRN-33491', testType: 'Hematology', status: 'Pending Review', priority: 'Routine', receivedAt: new Date(Date.now() - 7200000).toISOString() },
];

const mockResults: CaseResults = {
  caseId: 'PATH-10293',
  results: [
    { id: 'R-1', parameterName: 'Hemoglobin', value: 9.2, unit: 'g/dL', referenceRange: '13.8 - 17.2', flag: 'Low' },
    { id: 'R-2', parameterName: 'WBC Count', value: 18.5, unit: '10^3/uL', referenceRange: '4.5 - 11.0', flag: 'Critical High' },
    { id: 'R-3', parameterName: 'Platelets', value: 250, unit: '10^3/uL', referenceRange: '150 - 450', flag: 'Normal' },
  ],
  historicalComparisons: [
    { parameterName: 'Hemoglobin', previousValue: 10.5, previousDate: new Date(Date.now() - 86400000 * 30).toISOString(), trend: 'Decreasing' },
    { parameterName: 'WBC Count', previousValue: 12.1, previousDate: new Date(Date.now() - 86400000 * 30).toISOString(), trend: 'Increasing' },
  ]
};

const mockAlerts: PathologistAlert[] = [
  { id: 'ALT-1', caseId: 'PATH-10293', patientName: 'John Doe', type: 'Critical Value', severity: 'critical', timestamp: new Date(Date.now() - 1000).toISOString(), status: 'Active', message: 'WBC Count is critically high (18.5 10^3/uL). Immediate review required.' },
  { id: 'ALT-2', caseId: 'PATH-10294', patientName: 'Jane Smith', type: 'STAT Pending', severity: 'warning', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'Active', message: 'STAT Biochemistry panel pending for 30 minutes.' },
];

export const pathologistApi = {
  getDashboardSummary: async (filters: PathologistFilters) => ({
    data: {
      kpis: mockKpis,
      cases: mockCases,
      activeCase: mockCases[0],
      activeResults: mockResults,
      alerts: mockAlerts,
    } as PathologistDashboardData,
    message: 'Success', status: 200,
  }),

  validateReport: async (caseId: string, notes: string) => ({ data: { success: true }, message: `Report validated for case ${caseId}`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
