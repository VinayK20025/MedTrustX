import type {
  BiomedTechDashboardData, BiomedTechKPI, BiomedTask, BiomedDevice, MaintenanceLog
} from '../types/biomedTech.types';

export interface BiomedTechFilters {
  status?: string;
}

const mockKpis: BiomedTechKPI[] = [
  { id: '1', title: 'Tasks Pending', value: 3, format: 'number', status: 'warning' },
  { id: '2', title: 'Tasks Completed', value: 8, format: 'number', status: 'success' },
  { id: '3', title: 'Escalated', value: 0, format: 'number', status: 'normal' },
  { id: '4', title: 'Avg Time/Task', value: '25m', format: 'time', status: 'normal' },
];

const mockDevices: BiomedDevice[] = [
  { id: 'DEV-VENT-01', name: 'Puritan Bennett 980', serialNumber: 'SN-980-001', type: 'Ventilator', department: 'ICU', location: 'Bed 4', status: 'Fault' },
  { id: 'DEV-MON-05', name: 'Philips IntelliVue MX700', serialNumber: 'SN-MX7-005', type: 'Monitor', department: 'Ward 3', location: 'Room 302', status: 'Online' },
];

const mockTasks: BiomedTask[] = [
  {
    id: 'TSK-101',
    deviceId: 'DEV-VENT-01',
    type: 'Repair',
    priority: 'Emergency',
    status: 'In Progress',
    assignedAt: new Date(Date.now() - 3600000).toISOString(),
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    checklist: [
      { id: 'C-1', description: 'Inspect compressor connections', isCompleted: true },
      { id: 'C-2', description: 'Replace HEPA filters', isCompleted: true },
      { id: 'C-3', description: 'Run automated POST (Power-On Self-Test)', isCompleted: false },
      { id: 'C-4', description: 'Verify O2 sensor calibration', isCompleted: false },
    ]
  },
  {
    id: 'TSK-102',
    deviceId: 'DEV-MON-05',
    type: 'Preventive',
    priority: 'Routine',
    status: 'Assigned',
    assignedAt: new Date(Date.now() - 86400000).toISOString(),
    checklist: [
      { id: 'C-5', description: 'Visual inspection of chassis', isCompleted: false },
      { id: 'C-6', description: 'Check NIBP cuff integrity', isCompleted: false },
      { id: 'C-7', description: 'Clean SpO2 sensor array', isCompleted: false },
    ]
  }
];

const mockLogs: MaintenanceLog[] = [
  { id: 'LOG-1', taskId: 'TSK-099', deviceId: 'DEV-MON-02', date: new Date(Date.now() - 86400000).toISOString(), durationMinutes: 15, summary: 'Replaced broken SpO2 cable.', status: 'Successful' }
];

export const biomedTechApi = {
  getDashboardSummary: async (filters: BiomedTechFilters) => ({
    data: {
      kpis: mockKpis,
      tasks: mockTasks,
      activeTask: mockTasks.find(t => t.status === 'In Progress'),
      devices: mockDevices,
      recentLogs: mockLogs,
    } as BiomedTechDashboardData,
    message: 'Success', status: 200,
  }),

  updateTaskStatus: async (taskId: string, status: BiomedTask['status']) => ({ data: { success: true }, message: `Task status updated to ${status}`, status: 200 }),
  updateChecklistStep: async (taskId: string, stepId: string, isCompleted: boolean) => ({ data: { success: true }, message: 'Checklist step updated', status: 200 }),
  escalateTask: async (taskId: string, reason: string) => ({ data: { success: true }, message: 'Task escalated to Biomedical Engineer', status: 200 }),
};
