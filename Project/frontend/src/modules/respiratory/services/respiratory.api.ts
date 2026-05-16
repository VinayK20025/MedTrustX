import type {
  RespiratoryDashboardData, RespiratoryKPI, RespiratoryPatient, RespiratoryDevice,
  RespiratoryVitals, RespiratoryTherapy, RespiratoryProcedure, RespiratoryAlert
} from '../types/respiratory.types';

export interface RespiratoryFilters {
  department?: string;
}

const mockKpis: RespiratoryKPI[] = [
  { id: '1', title: 'Ventilated Patients', value: 8, format: 'number', status: 'critical', actionLabel: 'View Vents', actionUrl: '/dashboard/respiratory/devices' },
  { id: '2', title: 'Active Oxygen Therapy', value: 24, format: 'number', status: 'normal' },
  { id: '3', title: 'Pending Procedures', value: 3, format: 'number', status: 'warning', actionLabel: 'View Schedule', actionUrl: '/dashboard/respiratory/procedures' },
  { id: '4', title: 'Critical Alarms', value: 1, format: 'number', status: 'critical', actionLabel: 'Investigate', actionUrl: '/dashboard/respiratory/alerts' },
];

const mockPatients: RespiratoryPatient[] = [
  { id: 'PAT-RT-01', name: 'John Doe', bed: 'ICU-04', department: 'ICU', diagnosis: 'ARDS', deviceConnected: 'DEV-VENT-01', respiratoryStatus: 'Critical', oxygenLevel: 88, lastIntervention: new Date(Date.now() - 900000).toISOString() },
  { id: 'PAT-RT-02', name: 'Jane Smith', bed: 'ICU-07', department: 'ICU', diagnosis: 'COPD Exacerbation', deviceConnected: 'DEV-BIPAP-02', respiratoryStatus: 'Guarded', oxygenLevel: 92, lastIntervention: new Date(Date.now() - 3600000).toISOString() },
  { id: 'PAT-RT-03', name: 'Baby Rivera', bed: 'NICU-02', department: 'NICU', diagnosis: 'RDS', deviceConnected: 'DEV-CPAP-01', respiratoryStatus: 'Stable', oxygenLevel: 96, lastIntervention: new Date(Date.now() - 7200000).toISOString() },
];

const mockDevices: RespiratoryDevice[] = [
  { id: 'DEV-VENT-01', type: 'Ventilator', patientId: 'PAT-RT-01', bedLocation: 'ICU-04', status: 'Active', mode: 'SIMV-VC', fio2: 60, peep: 10, tidalVolume: 450, respiratoryRate: 16 },
  { id: 'DEV-BIPAP-02', type: 'BiPAP', patientId: 'PAT-RT-02', bedLocation: 'ICU-07', status: 'Active', mode: 'S/T', fio2: 40, peep: 5 },
  { id: 'DEV-VENT-03', type: 'Ventilator', patientId: null, bedLocation: 'Storage Room A', status: 'Standby' },
  { id: 'DEV-O2-01', type: 'High Flow Nasal Cannula', patientId: null, bedLocation: 'ER-Trauma', status: 'Alarm' },
];

const mockLiveVitals: RespiratoryVitals[] = [
  { patientId: 'PAT-RT-01', timestamp: new Date().toISOString(), spO2: 88, respiratoryRate: 28, tidalVolume: 350, etco2: 45 },
  { patientId: 'PAT-RT-02', timestamp: new Date().toISOString(), spO2: 92, respiratoryRate: 22, tidalVolume: 400, etco2: 38 },
];

const mockTherapies: RespiratoryTherapy[] = [
  { id: 'THER-01', patientId: 'PAT-RT-02', type: 'Nebulization', medication: 'Albuterol / Ipratropium', frequency: 'Q4H', status: 'Scheduled', lastAdministered: new Date(Date.now() - 14400000).toISOString() },
  { id: 'THER-02', patientId: 'PAT-RT-03', type: 'Oxygen Therapy', frequency: 'Continuous', status: 'In Progress', lastAdministered: new Date().toISOString() },
];

const mockProcedures: RespiratoryProcedure[] = [
  { id: 'PROC-01', patientId: 'PAT-RT-01', name: 'Suctioning', status: 'Pending', scheduledTime: new Date(Date.now() + 1800000).toISOString(), notes: 'Copious secretions noted, PRN suctioning.' },
  { id: 'PROC-02', patientId: 'PAT-RT-02', name: 'Extubation', status: 'Completed', scheduledTime: new Date(Date.now() - 86400000).toISOString(), notes: 'Successfully extubated to BiPAP.' },
];

const mockAlerts: RespiratoryAlert[] = [
  { id: 'ALT-RT-01', patientId: 'PAT-RT-01', deviceId: 'DEV-VENT-01', type: 'Desaturation', severity: 'critical', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'Active', description: 'SpO2 dropped below 90% for > 1 minute.' },
  { id: 'ALT-RT-02', patientId: 'PAT-RT-02', deviceId: 'DEV-BIPAP-02', type: 'High Pressure', severity: 'warning', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'Acknowledged', description: 'Peak pressure limit reached, check for mask leak or obstruction.' },
];

export const respiratoryApi = {
  getDashboardSummary: async (filters: RespiratoryFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      devices: mockDevices,
      liveVitals: mockLiveVitals,
      therapies: mockTherapies,
      procedures: mockProcedures,
      alerts: mockAlerts,
    } as RespiratoryDashboardData,
    message: 'Success', status: 200,
  }),

  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
  updateDeviceSettings: async (deviceId: string, settings: Partial<RespiratoryDevice>) => ({ data: { success: true }, message: 'Device settings updated safely', status: 200 }),
  completeProcedure: async (procedureId: string, notes: string) => ({ data: { success: true }, message: 'Procedure documented', status: 200 }),
  recordTherapy: async (therapyId: string) => ({ data: { success: true }, message: 'Therapy administration recorded', status: 200 }),
};
