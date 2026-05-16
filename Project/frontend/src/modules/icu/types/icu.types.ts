export type ICUSeverity = 'normal' | 'warning' | 'critical';

export interface ICUKpi {
  id: string;
  title: string;
  value: string | number;
  status: ICUSeverity;
  delta?: string;
}

export interface ICUVitals {
  hr: number;
  bp: string;
  spo2: number;
  resp: number;
  temp: number;
}

export interface ICUPatient {
  id: string;
  name: string;
  bed: string;
  status: 'stable' | 'warning' | 'critical';
  diagnosis: string;
  vitals: ICUVitals;
  lastUpdated: string;
  activeAlerts: number;
}

export interface ICUAlert {
  id: string;
  patientId?: string;
  bed?: string;
  message: string;
  severity: ICUSeverity;
  timestamp: string;
}

export interface ICUIntegration {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  sourceSystem: string;
  targetSystem: string;
  lastSync: string;
  throughputPerHour?: number;
}

export interface ICUDashboardData {
  kpis: ICUKpi[];
  patients: ICUPatient[];
  alerts: ICUAlert[];
  integrations: ICUIntegration[];
}
