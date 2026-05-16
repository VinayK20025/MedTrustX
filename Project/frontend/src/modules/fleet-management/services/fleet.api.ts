import { apiGet, apiPost } from '@/services/api';
import type { FleetDashboardData, Vehicle, DispatchMission } from '../types/fleet.types';

const m = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString();
const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockVehicles: Vehicle[] = [
  { id: 'AMB-001', licensePlate: 'MED-101', type: 'ALS Ambulance', status: 'On Mission', currentLocation: { lat: 40.7128, lng: -74.006, address: '5th Ave & E 42nd St' }, fuelLevelPercent: 82, lastMaintenanceDate: t(12) },
  { id: 'AMB-002', licensePlate: 'MED-102', type: 'BLS Ambulance', status: 'Available', currentLocation: { lat: 40.7589, lng: -73.9851, address: 'Times Square Central' }, fuelLevelPercent: 95, lastMaintenanceDate: t(5) },
  { id: 'AMB-003', licensePlate: 'MED-103', type: 'Critical Care', status: 'Maintenance', currentLocation: { lat: 40.7829, lng: -73.9654, address: 'Central Park North' }, fuelLevelPercent: 40, lastMaintenanceDate: t(30) },
];

const mockMissions: DispatchMission[] = [
  { id: 'MSN-882', vehicleId: 'AMB-001', driverId: 'DRV-11', priority: 'Emergency', status: 'Transporting', origin: 'Brooklyn Heights', destination: 'Main Hospital ER', startTime: m(25) },
  { id: 'MSN-883', vehicleId: 'AMB-004', driverId: 'DRV-09', priority: 'Scheduled', status: 'Completed', origin: 'Main Hospital', destination: 'Nursing Home Alpha', startTime: m(120) },
];

const mockData: FleetDashboardData = {
  metrics: {
    totalVehicles: 12,
    availableVehicles: 4,
    activeMissions: 5,
    averageResponseTimeMinutes: 8.4,
    fleetUptimePercent: 98.2
  },
  vehicles: mockVehicles,
  activeMissions: mockMissions,
  maintenanceAlerts: [
    { vehicleId: 'AMB-003', issue: 'Brake Pad Wear', dueDate: t(-1) },
    { vehicleId: 'AMB-007', issue: 'Engine Oil Change', dueDate: t(-5) }
  ]
};

export const fleetApi = {
  getDashboardData: async (): Promise<{ data: FleetDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: FleetDashboardData }>('/api/v1/fleet/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  dispatchVehicle: async (vehicleId: string, missionData: any) => {
    try {
      return await apiPost(`/api/v1/fleet/vehicles/${vehicleId}/dispatch`, missionData);
    } catch {
      return { data: { success: true }, message: 'Vehicle dispatched (Mock)', status: 200 };
    }
  }
};
