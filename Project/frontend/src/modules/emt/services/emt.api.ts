import type { EmtData } from '../types/emt.types';

export interface EmtFilters { caseId?: string; }

const mockData: EmtData = {
  kpis: [
    { id: '1', label: 'Procedures Assisted', value: 12, status: 'success' },
    { id: '2', label: 'Active Devices', value: 3, status: 'normal' },
    { id: '3', label: 'Critical Alerts', value: 1, status: 'critical' },
  ],
  activeCase: {
    id: 'CASE-404',
    patientName: 'Robert Miles',
    age: 58,
    gender: 'M',
    complaint: 'Acute Respiratory Distress',
    triageLevel: 'Critical',
    location: 'ER Trauma Bay 1'
  },
  tasks: [
    { id: 't1', label: 'Attach 12-Lead ECG', priority: 'High', isCompleted: true, type: 'Equipment' },
    { id: 't2', label: 'Setup IV Access (18G)', priority: 'High', isCompleted: false, type: 'Procedure' },
    { id: 't3', label: 'Apply Continuous SpO2', priority: 'Normal', isCompleted: true, type: 'Equipment' },
    { id: 't4', label: 'Prepare Intubation Kit', priority: 'High', isCompleted: false, type: 'Procedure' },
  ],
  devices: [
    { id: 'dev1', name: 'Zoll X Series Defib/ECG', type: 'ECG', status: 'Connected', lastReading: 'Sinus Tachycardia', batteryLevel: 95 },
    { id: 'dev2', name: 'Nellcor OxiMax SpO2', type: 'SpO2', status: 'Syncing', lastReading: '88%', batteryLevel: 80 },
    { id: 'dev3', name: 'Hamilton T1 Vent', type: 'Ventilator', status: 'Disconnected' }
  ],
  vitals: {
    id: 'v1',
    hr: 115,
    bp: '145/90',
    spo2: 88,
    respRate: 28,
    isAbnormal: true
  }
};

export const emtApi = {
  getDashboardSummary: async (f: EmtFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  completeTask: async (taskId: string) => ({ data: { success: true }, message: `Task marked complete`, status: 200 }),
  connectDevice: async (deviceId: string) => ({ data: { success: true }, message: 'Device pairing initiated via BLE/Wi-Fi', status: 200 }),
  logAction: async (action: string) => ({ data: { success: true }, message: 'Action logged', status: 200 }),
};
