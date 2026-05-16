import type { AmbulanceData } from '../types/ambulance.types';

export interface AmbFilters { status?: string; }

const mockData: AmbulanceData = {
  kpis: [
    { id: '1', label: 'Avg Response Time', value: '5.2m', status: 'success' },
    { id: '2', label: 'Calls Today', value: 4, status: 'normal' },
    { id: '3', label: 'On-Time Arrival', value: '98%', status: 'success' },
    { id: '4', label: 'Current Traffic', value: 'Heavy', status: 'critical' },
  ],
  activeDispatch: {
    id: 'DSP-9921',
    type: 'Cardiac',
    pickupLocation: 'Block C, Tech Park, Koramangala',
    destination: 'MedTrustX Main ER',
    priority: 'Critical',
    distance: '4.2 km',
    etaToPickup: '6 mins',
    status: 'En Route to Pickup',
    dispatchedAt: new Date(Date.now() - 120000).toISOString()
  },
  fleetStatus: 'On Call'
};

export const ambulanceApi = {
  getDashboardSummary: async (f: AmbFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateDispatchStatus: async (id: string, status: string) => ({ data: { success: true }, message: `Status updated to: ${status}`, status: 200 }),
  triggerEmergencyHorn: async () => ({ data: { success: true }, message: 'Hospital ER Notified', status: 200 }),
};
