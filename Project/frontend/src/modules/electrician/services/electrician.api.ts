import type {
  ElectricianDashboardData, ElectricianKPI, ElectricalTask, ElectricalSystem
} from '../types/electrician.types';

export interface ElectFilters { status?: string; priority?: string; }

const mockKpis: ElectricianKPI[] = [
  { id: '1', title: 'Pending Tasks', value: 4, status: 'warning' },
  { id: '2', title: 'Critical Faults', value: 1, status: 'critical' },
  { id: '3', title: 'Systems Normal', value: '94%', status: 'success' },
];

const mockTasks: ElectricalTask[] = [
  { id: 'EL-001', title: 'ICU Power Fluctuation', description: 'Voltage drop detected on secondary line.', location: 'ICU Block A', system: 'Panel 3A', priority: 'Critical', status: 'Assigned', assignedAt: new Date(Date.now() - 900000).toISOString(), isEmergency: true, safetyChecklistCompleted: false },
  { id: 'EL-002', title: 'Ward Light Fault', description: 'Corridor lights tripping breaker.', location: 'Ward 4', system: 'Circuit C2', priority: 'Medium', status: 'In Progress', assignedAt: new Date(Date.now() - 3600000).toISOString(), isEmergency: false, safetyChecklistCompleted: true },
  { id: 'EL-003', title: 'UPS Battery Check', description: 'Routine diagnostic on OT backup UPS.', location: 'OT Power Room', system: 'UPS-OT1', priority: 'Routine', status: 'Assigned', assignedAt: new Date(Date.now() - 7200000).toISOString(), isEmergency: false, safetyChecklistCompleted: false },
];

const mockSystems: ElectricalSystem[] = [
  { id: 'SYS-1', name: 'Generator 1 (Primary)', type: 'Generator', status: 'OK', loadPercentage: 45, location: 'Basement' },
  { id: 'SYS-2', name: 'UPS-OT1', type: 'UPS', status: 'Warning', loadPercentage: 88, location: 'OT Power Room' },
  { id: 'SYS-3', name: 'Panel 3A', type: 'Panel', status: 'Fault', location: 'ICU Block A' },
];

export const electricianApi = {
  getDashboardSummary: async (filters: ElectFilters) => ({
    data: { kpis: mockKpis, tasks: mockTasks, systems: mockSystems } as ElectricianDashboardData,
    message: 'Success', status: 200,
  }),
  updateTaskState: async (taskId: string, payload: Partial<ElectricalTask>) => ({ data: { success: true }, message: `Task updated`, status: 200 }),
  completeSafetyCheck: async (taskId: string) => ({ data: { success: true }, message: 'Safety checklist verified', status: 200 }),
};
