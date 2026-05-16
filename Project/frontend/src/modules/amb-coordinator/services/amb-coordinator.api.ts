import type { AmbCoordinatorData } from '../types/amb-coordinator.types';

export interface CoordFilters { status?: string; }

const mockData: AmbCoordinatorData = {
  kpis: [
    { id: '1', label: 'Active Dispatches', value: 5, status: 'warning' },
    { id: '2', label: 'Available Units', value: 2, status: 'critical' },
    { id: '3', label: 'Avg Response Time', value: '4m 30s', status: 'success' },
    { id: '4', label: 'Calls Today', value: 42, status: 'normal' },
  ],
  incomingCalls: [
    { id: 'CALL-501', caller: 'Bystander', location: 'MG Road Junction', condition: 'MVA - Multiple Casualties', priority: 'Critical', status: 'Pending Dispatch', receivedAt: new Date(Date.now() - 30000).toISOString() },
    { id: 'CALL-502', caller: 'Nursing Home', location: 'Indiranagar 2nd Stage', condition: 'Cardiac Arrest', priority: 'Critical', status: 'Assigned', receivedAt: new Date(Date.now() - 240000).toISOString() },
    { id: 'CALL-503', caller: 'Patient Relative', location: 'Koramangala Block 4', condition: 'Severe Abdominal Pain', priority: 'Urgent', status: 'Pending Dispatch', receivedAt: new Date(Date.now() - 180000).toISOString() },
  ],
  fleet: [
    { id: 'UNIT-A1', callSign: 'A-101 (ALS)', status: 'Available', currentLocation: 'Hospital Base' },
    { id: 'UNIT-A2', callSign: 'A-102 (BLS)', status: 'En Route', currentLocation: 'Old Airport Road', etaToTarget: '4m', assignedCaseId: 'CALL-502' },
    { id: 'UNIT-A3', callSign: 'A-103 (ALS)', status: 'Transporting', currentLocation: 'Domlur Flyover', etaToTarget: '8m' },
    { id: 'UNIT-A4', callSign: 'A-104 (ICU)', status: 'Available', currentLocation: 'South Zone Standby' }
  ]
};

export const ambCoordinatorApi = {
  getDashboardSummary: async (f: CoordFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  assignUnit: async (callId: string, unitId: string) => ({ data: { success: true }, message: `Unit ${unitId} dispatched to ${callId}`, status: 200 }),
  notifyER: async (callId: string) => ({ data: { success: true }, message: 'ER notified of incoming transport', status: 200 }),
};
