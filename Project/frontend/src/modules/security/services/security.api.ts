import type { SecurityDashboardData } from '../types/security.types';

export interface SecurityFilters { zone?: string; status?: string; }

const mockData: SecurityDashboardData = {
  kpis: [
    { id: '1', title: 'Active Incidents', value: 2, status: 'critical' },
    { id: '2', title: 'Guards On Duty', value: 18, status: 'success' },
    { id: '3', title: 'Restricted Alerts', value: 1, status: 'warning' },
    { id: '4', title: 'Visitor Count', value: 342, status: 'normal' },
  ],
  zones: [
    { id: 'ZONE-ICU', name: 'ICU', status: 'Alert', guardCount: 3, lastScanAt: new Date(Date.now() - 60000).toISOString() },
    { id: 'ZONE-OT', name: 'Operation Theatre', status: 'Secure', guardCount: 2, lastScanAt: new Date(Date.now() - 120000).toISOString() },
    { id: 'ZONE-ER', name: 'Emergency', status: 'Crowd', guardCount: 4, lastScanAt: new Date().toISOString() },
    { id: 'ZONE-OPD', name: 'OPD', status: 'Secure', guardCount: 3, lastScanAt: new Date(Date.now() - 90000).toISOString() },
    { id: 'ZONE-MAIN', name: 'Main Gate', status: 'Secure', guardCount: 2, lastScanAt: new Date().toISOString() },
    { id: 'ZONE-PHAR', name: 'Pharmacy', status: 'Secure', guardCount: 1, lastScanAt: new Date(Date.now() - 180000).toISOString() },
  ],
  cameras: [
    { id: 'CAM-01', name: 'ICU Entrance', zone: 'ICU', status: 'Alert', thumbnailColor: 'from-red-900 to-red-950' },
    { id: 'CAM-02', name: 'OT Corridor', zone: 'OT', status: 'Live', thumbnailColor: 'from-gray-800 to-gray-900' },
    { id: 'CAM-03', name: 'ER Bay', zone: 'ER', status: 'Live', thumbnailColor: 'from-slate-800 to-slate-900' },
    { id: 'CAM-04', name: 'Main Gate', zone: 'Main Gate', status: 'Live', thumbnailColor: 'from-zinc-800 to-zinc-900' },
    { id: 'CAM-05', name: 'Pharmacy Store', zone: 'Pharmacy', status: 'Offline', thumbnailColor: 'from-black to-gray-900' },
    { id: 'CAM-06', name: 'Server Room', zone: 'IT', status: 'Live', thumbnailColor: 'from-blue-900 to-blue-950' },
  ],
  incidents: [
    { id: 'SEC-201', type: 'Unauthorized Access', location: 'ICU Block B', severity: 'High', status: 'Responding', reportedAt: new Date(Date.now() - 600000).toISOString(), assignedGuard: 'Guard Ravi', description: 'Unidentified individual bypassed ICU biometric scanner.' },
    { id: 'SEC-202', type: 'Crowd Overload', location: 'ER Triage', severity: 'Medium', status: 'Assigned', reportedAt: new Date(Date.now() - 900000).toISOString(), assignedGuard: 'Guard Priya', description: 'ER capacity exceeded 120%. Patient flow backup at triage.' },
  ],
  guards: [
    { id: 'G-01', name: 'Guard Ravi', location: 'ICU Block B', status: 'Responding' },
    { id: 'G-02', name: 'Guard Priya', location: 'ER Triage', status: 'Responding' },
    { id: 'G-03', name: 'Guard Ahmed', location: 'Main Gate', status: 'On Duty' },
    { id: 'G-04', name: 'Guard Sunita', location: 'OPD', status: 'On Duty' },
  ]
};

export const securityApi = {
  getDashboardSummary: async (filters: SecurityFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  dispatchGuard: async (incidentId: string, guardId: string) => ({ data: { success: true }, message: `Guard dispatched to incident ${incidentId}`, status: 200 }),
  lockZone: async (zoneId: string) => ({ data: { success: true }, message: `Zone locked down`, status: 200 }),
  resolveIncident: async (incidentId: string) => ({ data: { success: true }, message: 'Incident resolved', status: 200 }),
};
