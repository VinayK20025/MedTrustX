import { apiGet, apiPost } from '@/services/api';
import type { MortuaryDashboardData, DeceasedRecord, MortuaryChamber } from '../types/mortuary.types';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600000).toISOString();

const mockDeceased: DeceasedRecord[] = [
  { id: 'DEC-2024-001', name: 'James Wilson', gender: 'Male', dateOfDeath: d(1), timeOfDeath: '14:20', status: 'Stored', chamberId: 'C-101', policeCase: false, autopsyRequested: false },
  { id: 'DEC-2024-002', name: 'Maria Garcia', gender: 'Female', dateOfDeath: d(0), timeOfDeath: '09:45', status: 'Awaiting Intake', policeCase: true, autopsyRequested: true },
  { id: 'DEC-2024-003', name: 'Robert Taylor', gender: 'Male', dateOfDeath: d(2), timeOfDeath: '23:10', status: 'Ready for Release', chamberId: 'C-105', policeCase: false, autopsyRequested: false },
];

const mockChambers: MortuaryChamber[] = [
  { id: 'C-101', bay: 'Bay A', status: 'Occupied', deceasedId: 'DEC-2024-001', temperatureCelsius: 3.2 },
  { id: 'C-102', bay: 'Bay A', status: 'Available', temperatureCelsius: 3.1 },
  { id: 'C-103', bay: 'Bay A', status: 'Maintenance', temperatureCelsius: 12.5 },
  { id: 'C-104', bay: 'Bay B', status: 'Available', temperatureCelsius: 2.9 },
  { id: 'C-105', bay: 'Bay B', status: 'Occupied', deceasedId: 'DEC-2024-003', temperatureCelsius: 3.0 },
];

const mockData: MortuaryDashboardData = {
  metrics: {
    totalCapacity: 40,
    currentOccupancy: 12,
    availableChambers: 26,
    pendingAutopsiesCount: 3,
    releasesTodayCount: 4
  },
  recentIntakes: mockDeceased,
  activeStorage: mockChambers,
  pendingReleases: mockDeceased.filter(d => d.status === 'Ready for Release')
};

export const mortuaryApi = {
  getDashboardData: async (): Promise<{ data: MortuaryDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: MortuaryDashboardData }>('/api/v1/mortuary/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateChamberStatus: async (chamberId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/mortuary/chambers/${chamberId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Chamber status updated (Mock)', status: 200 };
    }
  }
};
