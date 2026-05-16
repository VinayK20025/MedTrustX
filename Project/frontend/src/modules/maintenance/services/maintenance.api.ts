import type {
  MaintenanceDashboardData, MaintenanceKPI, MaintenanceTask, EquipmentDetails, MaintenanceLog
} from '../types/maintenance.types';

export interface MaintenanceFilters { status?: string; priority?: string; }

const mockKpis: MaintenanceKPI[] = [
  { id: '1', title: 'Pending Tasks', value: 3, status: 'warning' },
  { id: '2', title: 'Completed Today', value: 12, status: 'success' },
  { id: '3', title: 'Emergency', value: 1, status: 'critical' },
];

const mockTasks: MaintenanceTask[] = [
  { id: 'TSK-201', workOrderId: 'WO-5001', title: 'Compressor Repair', description: 'AC compressor failure. Inspect and replace if needed.', location: 'ICU - Block B', assetId: 'AST-101', assetName: 'ICU Central AC Unit', priority: 'Emergency', status: 'In Progress', assignedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'TSK-202', workOrderId: 'WO-5003', title: 'Fix Flickering Lights', description: 'Patient reported flickering tube lights.', location: 'Ward C, Room 302', assetId: 'AST-099', assetName: 'Ward C Lighting', priority: 'Routine', status: 'Assigned', assignedAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'TSK-203', workOrderId: 'WO-5005', title: 'Oxygen Line Check', description: 'Minor pressure drop detected. Check seals.', location: 'OT-1', assetId: 'AST-202', assetName: 'Medical Gas Panel', priority: 'High', status: 'Assigned', assignedAt: new Date(Date.now() - 7200000).toISOString() },
];

const mockEquipment: Record<string, EquipmentDetails> = {
  'AST-101': { id: 'AST-101', name: 'ICU Central AC Unit', type: 'HVAC', model: 'Carrier XPower 500', serialNumber: 'SN-CR500-99812', location: 'Block B - Floor 3 Roof', status: 'Faulty', lastServiceDate: '2023-10-15', manualUrl: '#' },
  'AST-099': { id: 'AST-099', name: 'Ward C Lighting', type: 'Electrical', model: 'Philips LED Batten', serialNumber: 'N/A', location: 'Ward C, Room 302', status: 'Operational', lastServiceDate: '2023-11-20' },
  'AST-202': { id: 'AST-202', name: 'Medical Gas Panel', type: 'Pneumatics', model: 'BeaconMedaes', serialNumber: 'BM-202-A', location: 'OT-1', status: 'Operational', lastServiceDate: '2024-01-05' },
};

const mockLogs: MaintenanceLog[] = [
  { id: 'LOG-501', taskId: 'TSK-201', action: 'Task Started', timestamp: new Date(Date.now() - 3500000).toISOString() },
  { id: 'LOG-502', taskId: 'TSK-201', action: 'Diagnostic complete - compressor needs coolant.', timestamp: new Date(Date.now() - 1800000).toISOString() },
];

export const maintenanceApi = {
  getDashboardSummary: async (filters: MaintenanceFilters) => ({
    data: { kpis: mockKpis, tasks: mockTasks, equipment: mockEquipment, logs: mockLogs } as MaintenanceDashboardData,
    message: 'Success', status: 200,
  }),
  updateTaskStatus: async (taskId: string, status: string, notes?: string) => ({ data: { success: true }, message: `Task marked as ${status}`, status: 200 }),
  addPhoto: async (taskId: string) => ({ data: { success: true }, message: 'Photo attached', status: 200 }),
};
