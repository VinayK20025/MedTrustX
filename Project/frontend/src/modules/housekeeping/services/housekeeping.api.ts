import { apiGet, apiPost } from '@/services/api';
import type { HousekeepingDashboardData, RoomStatus, CleaningTask } from '../types/housekeeping.types';

const m = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString();
const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockRooms: RoomStatus[] = [
  { id: 'RM-401', roomNumber: '401', ward: 'Medical A', status: 'Dirty', lastCleanedAt: t(0.5), isIsolation: false },
  { id: 'RM-402', roomNumber: '402', ward: 'Medical A', status: 'In Progress', lastCleanedAt: t(1), assignedStaffId: 'HSK-12', isIsolation: true },
  { id: 'RM-310', roomNumber: '310', ward: 'Surgical B', status: 'Clean', lastCleanedAt: m(120), isIsolation: false },
];

const mockTasks: CleaningTask[] = [
  { id: 'TSK-901', location: 'Room 401', taskType: 'Discharge', priority: 'STAT', status: 'Pending', requestedAt: m(15) },
  { id: 'TSK-902', location: 'ICU Bay 4', taskType: 'Terminal', priority: 'Isolation', status: 'In Progress', assignedTo: 'John Cleaner', requestedAt: m(45) },
];

const mockData: HousekeepingDashboardData = {
  metrics: {
    averageTurnoverTimeMinutes: 42,
    cleanRoomCount: 156,
    dirtyRoomCount: 18,
    activeStaffCount: 24,
    pendingStatTasks: 3
  },
  rooms: mockRooms,
  activeTasks: mockTasks,
  lowLinenStock: [
    { id: 'LIN-01', itemName: 'Bed Sheets (Twin)', currentStock: 45, minRequired: 100, unit: 'sets' },
    { id: 'LIN-02', itemName: 'Pillow Covers', currentStock: 20, minRequired: 80, unit: 'pcs' }
  ]
};

export const housekeepingApi = {
  getDashboardData: async (): Promise<{ data: HousekeepingDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: HousekeepingDashboardData }>('/api/v1/housekeeping/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateRoomStatus: async (roomId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/housekeeping/rooms/${roomId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Room status updated (Mock)', status: 200 };
    }
  }
};
