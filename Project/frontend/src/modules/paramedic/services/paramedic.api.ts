import type { ParamedicData } from '../types/paramedic.types';

export interface ParaFilters { caseId?: string; }

const mockData: ParamedicData = {
  kpis: [
    { id: '1', label: 'Scene Time', value: '4m 30s', status: 'success' },
    { id: '2', label: 'SpO2 Trend', value: 'Dropping', status: 'critical' },
    { id: '3', label: 'Interventions', value: 3, status: 'normal' },
    { id: '4', label: 'ETA to ER', value: '8m', status: 'warning' },
  ],
  activeCase: {
    id: 'CASE-8821',
    patientId: 'UNIDENTIFIED-01',
    patientName: 'Unknown Male (Trauma)',
    age: 45,
    gender: 'M',
    complaint: 'Blunt Force Trauma (MVA)',
    triageLevel: 'Critical',
    timeEnRoute: '12 mins'
  },
  protocols: [
    { id: 'PR-1', condition: 'Severe Trauma Protocol', suggestedActions: ['Ensure Airway Patency', 'Apply Cervical Collar', 'Establish 2 Large Bore IVs', 'Administer O2 15L via NRB'], isCompleted: false }
  ],
  interventions: [
    { id: 'INT-1', action: 'Cervical Collar Applied', time: new Date(Date.now() - 300000).toISOString(), status: 'Administered' },
    { id: 'INT-2', action: 'O2 Administered (15L NRB)', time: new Date(Date.now() - 240000).toISOString(), status: 'Administered' },
  ],
  vitalsHistory: [
    { id: 'VIT-1', bp: '85/50', hr: 125, spo2: 88, temp: 97.2, recordedAt: new Date(Date.now() - 300000).toISOString(), isAbnormal: true },
    { id: 'VIT-2', bp: '90/55', hr: 118, spo2: 92, temp: 97.4, recordedAt: new Date(Date.now() - 60000).toISOString(), isAbnormal: true },
  ]
};

export const paramedicApi = {
  getDashboardSummary: async (f: ParaFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  logIntervention: async (action: string) => ({ data: { success: true }, message: `Intervention logged: ${action}`, status: 200 }),
  recordVitals: async (payload: any) => ({ data: { success: true }, message: 'Vitals transmitted to ER', status: 200 }),
  notifyER: async () => ({ data: { success: true }, message: 'ER trauma team activated', status: 200 }),
};
