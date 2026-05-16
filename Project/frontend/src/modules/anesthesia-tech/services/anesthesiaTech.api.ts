import type {
  AnesthesiaTechDashboardData, AnesthesiaKPI, AnesthesiaMachine, AnesthesiaTelemetry,
  AnesthesiaSetupTask, DrugPreparationTask, AnesthesiaAlert
} from '../types/anesthesiaTech.types';

export interface AnesthesiaTechFilters {
  otRoom?: string;
}

const mockKpis: AnesthesiaKPI[] = [
  { id: '1', title: 'Machines Ready', value: 4, format: 'number', status: 'normal' },
  { id: '2', title: 'Drugs Pending', value: 3, format: 'number', status: 'warning', actionLabel: 'Prep Drugs', actionUrl: '/dashboard/anesthesia-tech/drugs' },
  { id: '3', title: 'Gas Warnings', value: 1, format: 'number', status: 'warning' },
  { id: '4', title: 'Critical Alerts', value: 0, format: 'number', status: 'success' },
];

const mockMachines: AnesthesiaMachine[] = [
  { id: 'ANES-01', otRoom: 'OT-1', model: 'Dräger Apollo', status: 'In Use', gasLevels: { O2: 85, N2O: 90, Air: 95 }, absorberStatus: 40, vaporizerLevel: 60 },
  { id: 'ANES-02', otRoom: 'OT-2', model: 'GE Aisys CS2', status: 'Ready', gasLevels: { O2: 100, N2O: 100, Air: 100 }, absorberStatus: 90, vaporizerLevel: 80 },
  { id: 'ANES-03', otRoom: 'OT-3', model: 'Dräger Apollo', status: 'Checkout Required', gasLevels: { O2: 15, N2O: 40, Air: 80 }, absorberStatus: 5, vaporizerLevel: 10 },
];

const mockTelemetry: AnesthesiaTelemetry[] = [
  { machineId: 'ANES-01', timestamp: new Date().toISOString(), circuitPressure: 18, tidalVolume: 450, fio2: 45, etco2: 36, status: 'Nominal' },
];

const mockSetup: AnesthesiaSetupTask[] = [
  { id: 'SET-1', otRoom: 'OT-3', caseId: 'CASE-008', description: 'Perform automated machine checkout', category: 'Machine Check', status: 'Pending' },
  { id: 'SET-2', otRoom: 'OT-3', caseId: 'CASE-008', description: 'Prepare MAC blade 3 and 4, verify light', category: 'Airway Equipment', status: 'Verified' },
  { id: 'SET-3', otRoom: 'OT-3', caseId: 'CASE-008', description: 'Change exhausted CO2 absorber', category: 'Machine Check', status: 'Pending' },
];

const mockDrugs: DrugPreparationTask[] = [
  { id: 'DRUG-1', caseId: 'CASE-008', drugName: 'Propofol', dosage: '200 mg', concentration: '10 mg/mL', status: 'Pending' },
  { id: 'DRUG-2', caseId: 'CASE-008', drugName: 'Rocuronium', dosage: '50 mg', concentration: '10 mg/mL', status: 'Pending' },
  { id: 'DRUG-3', caseId: 'CASE-008', drugName: 'Fentanyl', dosage: '100 mcg', concentration: '50 mcg/mL', status: 'Prepared', preparedBy: 'A. Tech' },
];

const mockAlerts: AnesthesiaAlert[] = [
  { id: 'ALT-1', machineId: 'ANES-03', otRoom: 'OT-3', type: 'Gas Low', severity: 'warning', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Active', message: 'O2 cylinder reserve below 20%. Replace cylinder.' },
  { id: 'ALT-2', machineId: 'ANES-03', otRoom: 'OT-3', type: 'Absorber Exhausted', severity: 'warning', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Active', message: 'CO2 absorber life at 5%. Replacement required.' },
];

export const anesthesiaTechApi = {
  getDashboardSummary: async (filters: AnesthesiaTechFilters) => ({
    data: {
      kpis: mockKpis,
      machines: mockMachines,
      liveTelemetry: mockTelemetry,
      setupChecklist: mockSetup,
      drugQueue: mockDrugs,
      alerts: mockAlerts,
    } as AnesthesiaTechDashboardData,
    message: 'Success', status: 200,
  }),

  verifySetupTask: async (taskId: string) => ({ data: { success: true }, message: 'Setup verified', status: 200 }),
  prepareDrug: async (taskId: string) => ({ data: { success: true }, message: 'Drug prepared and labeled', status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
