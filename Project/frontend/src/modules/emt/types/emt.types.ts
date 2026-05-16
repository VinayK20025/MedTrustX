/**
 * MedTrustX — Medical Technician (EMT - Role 126) Types
 * Bedside emergency support, device integration, and rapid procedure assistance.
 */

export interface EmtKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface EmtCase {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  complaint: string;
  triageLevel: 'Critical' | 'Urgent' | 'Stable';
  location: string;
}

export interface EmtTask {
  id: string;
  label: string;
  priority: 'High' | 'Normal';
  isCompleted: boolean;
  type: 'Procedure' | 'Equipment';
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'ECG' | 'SpO2' | 'Defibrillator' | 'Ventilator';
  status: 'Connected' | 'Disconnected' | 'Syncing' | 'Error';
  lastReading?: string;
  batteryLevel?: number;
}

export interface EmtVitals {
  id: string;
  hr: number;
  bp: string;
  spo2: number;
  respRate: number;
  isAbnormal: boolean;
}

export interface EmtData {
  kpis: EmtKPI[];
  activeCase: EmtCase | null;
  tasks: EmtTask[];
  devices: ConnectedDevice[];
  vitals: EmtVitals | null;
}
