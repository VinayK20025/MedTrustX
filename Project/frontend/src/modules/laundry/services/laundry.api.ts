import type { LaundryData } from '../types/laundry.types';

export interface LndFilters { status?: string; }

const mockData: LaundryData = {
  kpis: [
    { id: '1', label: 'Processed Today', value: '450 kg', status: 'success' },
    { id: '2', label: 'Pending Collections', value: 3, status: 'warning' },
    { id: '3', label: 'Infectious Batches', value: 1, status: 'critical' },
    { id: '4', label: 'Clean Deliveries', value: 12, status: 'normal' },
  ],
  tasks: [
    { id: 'TSK-201', department: 'ICU', type: 'Collection', category: 'Infectious', quantity: 25, unit: 'kg', status: 'Pending', timeLog: new Date(Date.now() - 600000).toISOString() },
    { id: 'TSK-202', department: 'Ward A', type: 'Distribution', category: 'Normal', quantity: 50, unit: 'items', status: 'Pending', timeLog: new Date(Date.now() - 1800000).toISOString() },
    { id: 'TSK-203', department: 'OT 1', type: 'Collection', category: 'Soiled', quantity: 40, unit: 'kg', status: 'In Progress', timeLog: new Date(Date.now() - 3600000).toISOString() },
  ],
  activeBatches: [
    { id: 'BCH-1', batchType: 'Normal', weight: '100 kg', stage: 'Dry', progress: 80 },
    { id: 'BCH-2', batchType: 'Infectious', weight: '25 kg', stage: 'Wash', progress: 30 },
  ]
};

export const laundryApi = {
  getDashboardSummary: async (f: LndFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateTaskStatus: async (taskId: string, status: string) => ({ data: { success: true }, message: `Task status updated`, status: 200 }),
  advanceBatchStage: async (batchId: string) => ({ data: { success: true }, message: 'Batch moved to next stage', status: 200 }),
};
