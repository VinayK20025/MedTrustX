import type { ERParamedicData } from '../types/er-paramedic.types';

export interface ERFilters { status?: string; }

const mockData: ERParamedicData = {
  kpis: [
    { id: '1', label: 'Code Response Time', value: '1m 12s', status: 'success' },
    { id: '2', label: 'Shift Codes', value: 2, status: 'warning' },
    { id: '3', label: 'ROSC Achieved', value: '100%', status: 'success' },
  ],
  activeCode: {
    id: 'CODE-991',
    codeType: 'Code Blue',
    location: 'Ward 3 - Bed B',
    patientName: 'Unknown Patient (Cardiac Arrest)',
    status: 'At Scene',
    dispatchedAt: new Date(Date.now() - 120000).toISOString()
  },
  protocolSteps: [
    { id: 'p1', action: 'Initiate High-Quality CPR', type: 'Procedure', isCompleted: true },
    { id: 'p2', action: 'Attach Defibrillator Pads', type: 'Procedure', isCompleted: true },
    { id: 'p3', action: 'Check Rhythm (Shockable?)', type: 'Assessment', isCompleted: false },
    { id: 'p4', action: 'Administer Epinephrine 1mg', type: 'Drug', isCompleted: false },
  ],
  logs: [
    { id: 'L1', time: new Date(Date.now() - 90000).toISOString(), action: 'Arrived at scene' },
    { id: 'L2', time: new Date(Date.now() - 80000).toISOString(), action: 'CPR Commenced' },
    { id: 'L3', time: new Date(Date.now() - 60000).toISOString(), action: 'Defibrillator Attached' }
  ],
  vitals: {
    id: 'V1',
    hr: '---', // no pulse detected
    bp: '---',
    spo2: 0,
    rhythm: 'VFib'
  }
};

export const erParamedicApi = {
  getDashboardSummary: async (f: ERFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  logAction: async (action: string) => ({ data: { success: true }, message: `Action logged`, status: 200 }),
  completeProtocolStep: async (stepId: string) => ({ data: { success: true }, message: 'Protocol advanced', status: 200 }),
};
