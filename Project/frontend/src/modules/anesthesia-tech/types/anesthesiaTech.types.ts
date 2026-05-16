/**
 * MedTrustX — Anesthesia Technician Types
 */

export interface AnesthesiaKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface AnesthesiaMachine {
  id: string;
  otRoom: string;
  model: string;
  status: 'Ready' | 'In Use' | 'Checkout Required' | 'Failed';
  gasLevels: {
    O2: number; // percentage
    N2O: number;
    Air: number;
  };
  absorberStatus: number; // percentage life remaining
  vaporizerLevel: number; // percentage
}

export interface AnesthesiaTelemetry {
  machineId: string;
  timestamp: string;
  circuitPressure: number; // cmH2O
  tidalVolume: number; // mL
  fio2: number; // percentage
  etco2: number; // mmHg
  status: 'Nominal' | 'Warning' | 'Critical';
}

export interface AnesthesiaSetupTask {
  id: string;
  otRoom: string;
  caseId: string;
  description: string;
  category: 'Machine Check' | 'Airway Equipment' | 'Monitoring';
  status: 'Pending' | 'Verified';
}

export interface DrugPreparationTask {
  id: string;
  caseId: string;
  drugName: string;
  dosage: string;
  concentration: string;
  status: 'Pending' | 'Prepared' | 'Administered';
  preparedBy?: string;
}

export interface AnesthesiaAlert {
  id: string;
  machineId: string;
  otRoom: string;
  type: 'Gas Low' | 'Pressure Abnormal' | 'Absorber Exhausted' | 'Vaporizer Low';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface AnesthesiaTechDashboardData {
  kpis: AnesthesiaKPI[];
  machines: AnesthesiaMachine[];
  liveTelemetry: AnesthesiaTelemetry[];
  setupChecklist: AnesthesiaSetupTask[];
  drugQueue: DrugPreparationTask[];
  alerts: AnesthesiaAlert[];
}
