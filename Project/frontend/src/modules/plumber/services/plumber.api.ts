import type {
  PlumberDashboardData, PlumberKPI, PlumbingTask, PlumbingSystem
} from '../types/plumber.types';

export interface PlumFilters { status?: string; priority?: string; }

const mockKpis: PlumberKPI[] = [
  { id: '1', title: 'Pending Tasks', value: 3, status: 'warning' },
  { id: '2', title: 'Critical Leaks', value: 1, status: 'critical' },
  { id: '3', title: 'Pressure Normal', value: '98%', status: 'success' },
];

const mockTasks: PlumbingTask[] = [
  { id: 'PL-001', title: 'ICU Water Leak', description: 'Burst pipe in scrub sink area causing pooling.', location: 'ICU Block B', system: 'Water Supply', priority: 'Critical', status: 'Assigned', assignedAt: new Date(Date.now() - 900000).toISOString(), isEmergency: true, hygieneChecklistCompleted: false },
  { id: 'PL-002', title: 'Ward Drainage Block', description: 'Patient washroom drain blocked.', location: 'Ward 2, Room 104', system: 'Drainage', priority: 'Medium', status: 'In Progress', assignedAt: new Date(Date.now() - 3600000).toISOString(), isEmergency: false, hygieneChecklistCompleted: true },
  { id: 'PL-003', title: 'O2 Line Pressure Check', description: 'Routine check of medical gas pipeline joints.', location: 'OT-2', system: 'Medical Gas', priority: 'Routine', status: 'Assigned', assignedAt: new Date(Date.now() - 7200000).toISOString(), isEmergency: false, hygieneChecklistCompleted: false },
];

const mockSystems: PlumbingSystem[] = [
  { id: 'SYS-P1', name: 'Main Water Line', type: 'Water', status: 'Warning', pressureReading: '4.2 bar (High)', location: 'Basement Pump Room' },
  { id: 'SYS-P2', name: 'ICU Drainage', type: 'Drainage', status: 'Fault', location: 'ICU Block B' },
  { id: 'SYS-P3', name: 'OT Medical Gas', type: 'Medical Gas', status: 'OK', pressureReading: 'Normal', location: 'OT Wing' },
];

export const plumberApi = {
  getDashboardSummary: async (filters: PlumFilters) => ({
    data: { kpis: mockKpis, tasks: mockTasks, systems: mockSystems } as PlumberDashboardData,
    message: 'Success', status: 200,
  }),
  updateTaskState: async (taskId: string, payload: Partial<PlumbingTask>) => ({ data: { success: true }, message: `Task updated`, status: 200 }),
  completeHygieneCheck: async (taskId: string) => ({ data: { success: true }, message: 'Hygiene & Safety checklist verified', status: 200 }),
};
