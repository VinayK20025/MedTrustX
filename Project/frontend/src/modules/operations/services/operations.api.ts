import type {
  OperationsDashboardData, OpsKPI, PatientFlowMetrics, BedStatus, OpsIncident
} from '../types/operations.types';

export interface OpsFilters { department?: string; severity?: string; }

const mockKpis: OpsKPI[] = [
  { id: '1', title: 'Overall Occupancy', value: '88%', format: 'text', status: 'warning', trend: 'up' },
  { id: '2', title: 'Patients Handled', value: 342, format: 'number', status: 'success', trend: 'up' },
  { id: '3', title: 'Avg ER Wait', value: '24m', format: 'text', status: 'critical', trend: 'up' },
  { id: '4', title: 'Active Incidents', value: 5, format: 'number', status: 'critical', trend: 'flat' },
];

const mockFlow: PatientFlowMetrics[] = [
  { stage: 'ER / Triage', currentVolume: 45, avgWaitTimeMins: 24, bottleneck: true, trend: 'up' },
  { stage: 'Admissions', currentVolume: 12, avgWaitTimeMins: 15, bottleneck: false, trend: 'flat' },
  { stage: 'OPD Consults', currentVolume: 180, avgWaitTimeMins: 18, bottleneck: false, trend: 'down' },
  { stage: 'Discharges', currentVolume: 28, avgWaitTimeMins: 45, bottleneck: true, trend: 'up' },
];

const mockBeds: BedStatus[] = [
  { department: 'ICU', total: 40, occupied: 38, cleaning: 1, available: 1, occupancyRate: 95 },
  { department: 'General Ward', total: 150, occupied: 120, cleaning: 5, available: 25, occupancyRate: 80 },
  { department: 'Private Rooms', total: 60, occupied: 55, cleaning: 2, available: 3, occupancyRate: 91 },
  { department: 'NICU', total: 20, occupied: 14, cleaning: 1, available: 5, occupancyRate: 70 },
];

const mockIncidents: OpsIncident[] = [
  { id: 'INC-991', type: 'Patient Delay', location: 'Radiology / MRI', description: 'MRI scanning delayed by 45 mins due to technical glitch.', severity: 'High', status: 'Active', reportedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'INC-992', type: 'Equipment Failure', location: 'OT-3', description: 'Anesthesia workstation reporting sensor error.', severity: 'Critical', status: 'Assigned', assignedTo: 'Biomedical Eng', reportedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'INC-993', type: 'Staff Shortage', location: 'ICU', description: 'Nursing ratio dropped below 1:2 due to sick leaves.', severity: 'High', status: 'Active', reportedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'INC-994', type: 'Facility Issue', location: 'Ward B', description: 'HVAC system malfunction in patient rooms.', severity: 'Medium', status: 'Resolved', reportedAt: new Date(Date.now() - 14400000).toISOString() },
];

export const operationsApi = {
  getDashboardSummary: async (filters: OpsFilters) => ({
    data: { kpis: mockKpis, flow: mockFlow, beds: mockBeds, incidents: mockIncidents } as OperationsDashboardData,
    message: 'Success', status: 200,
  }),
  escalateIncident: async (incidentId: string, assignedTo: string) => ({ data: { success: true }, message: `Incident escalated to ${assignedTo}`, status: 200 }),
  resolveIncident: async (incidentId: string) => ({ data: { success: true }, message: 'Incident marked as resolved', status: 200 }),
  triggerEmergencyProtocol: async (department: string) => ({ data: { success: true }, message: `Emergency protocol activated for ${department}`, status: 200 }),
};
