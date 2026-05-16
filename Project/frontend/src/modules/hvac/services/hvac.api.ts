import type {
  HVACDashboardData, HVACKPI, HVACTask, HVACSystem
} from '../types/hvac.types';

export interface HvacFilters { zone?: string; status?: string; }

const mockKpis: HVACKPI[] = [
  { id: '1', title: 'Critical Temp Alerts', value: 1, status: 'critical' },
  { id: '2', title: 'AHU Uptime', value: '99.1%', status: 'success' },
  { id: '3', title: 'Pending Tasks', value: 4, status: 'warning' },
];

const mockSystems: HVACSystem[] = [
  { id: 'SYS-AHU1', name: 'AHU-1 (Isolation)', type: 'AHU', status: 'Fault', location: 'ICU Isolation Ward', criticalZone: true, sensors: { temperature: 26.5, humidity: 65, pressure: 'Loss of -ve', airQuality: 'Poor' } },
  { id: 'SYS-AHU2', name: 'AHU-2 (Surgery)', type: 'AHU', status: 'OK', location: 'OT Wing', criticalZone: true, sensors: { temperature: 19.0, humidity: 45, pressure: '+ve', airQuality: 'Excellent' } },
  { id: 'SYS-CH1', name: 'Chiller Unit A', type: 'Cooling', status: 'Warning', location: 'Roof Deck', criticalZone: false, sensors: { temperature: 12.0, humidity: 50, pressure: 'Normal', airQuality: 'Good' } },
];

const mockTasks: HVACTask[] = [
  { id: 'HV-001', title: 'ICU Isolation Pressure Loss', description: 'AHU-1 failed to maintain negative pressure. Inspect exhaust fan belts immediately.', location: 'ICU Isolation Ward', systemId: 'SYS-AHU1', priority: 'Critical', status: 'Assigned', isEmergency: true, safetyChecklistCompleted: false },
  { id: 'HV-002', title: 'Chiller Freon Level', description: 'Low coolant warning on Chiller Unit A.', location: 'Roof Deck', systemId: 'SYS-CH1', priority: 'Routine', status: 'In Progress', isEmergency: false, safetyChecklistCompleted: true },
  { id: 'HV-003', title: 'OT Filter Replacement', description: 'Preventive HEPA filter replacement.', location: 'OT Wing', systemId: 'SYS-AHU2', priority: 'Preventive', status: 'Assigned', isEmergency: false, safetyChecklistCompleted: false },
];

export const hvacApi = {
  getDashboardSummary: async (filters: HvacFilters) => ({
    data: { kpis: mockKpis, tasks: mockTasks, systems: mockSystems } as HVACDashboardData,
    message: 'Success', status: 200,
  }),
  updateTaskState: async (taskId: string, payload: Partial<HVACTask>) => ({ data: { success: true }, message: `Task updated`, status: 200 }),
  completeSafetyCheck: async (taskId: string) => ({ data: { success: true }, message: 'Safety checklist verified', status: 200 }),
  adjustSystemParameters: async (sysId: string, params: any) => ({ data: { success: true }, message: 'System parameters updated', status: 200 }),
};
