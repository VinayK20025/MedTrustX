/**
 * MedTrustX — ER Paramedic / Code Response Team (Role 125) Types
 * Ultra-fast UI for code blue responses, ACLS/BLS protocols, and rapid documentation.
 */

export interface ERParamedicKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface CodeAlert {
  id: string;
  codeType: 'Code Blue' | 'Trauma Alert' | 'Stroke Alert' | 'Rapid Response';
  location: string;
  patientName?: string;
  status: 'Dispatched' | 'Responding' | 'At Scene' | 'Stabilized';
  dispatchedAt: string;
}

export interface ClinicalProtocolStep {
  id: string;
  action: string;
  type: 'Drug' | 'Procedure' | 'Shock' | 'Assessment';
  isCompleted: boolean;
}

export interface EmergencyLog {
  id: string;
  time: string;
  action: string;
}

export interface EmergencyVitals {
  id: string;
  hr: number | string;
  bp: string;
  spo2: number;
  rhythm: 'Sinus' | 'VFib' | 'VTach' | 'Asystole' | 'PEA';
}

export interface ERParamedicData {
  kpis: ERParamedicKPI[];
  activeCode: CodeAlert | null;
  protocolSteps: ClinicalProtocolStep[];
  logs: EmergencyLog[];
  vitals: EmergencyVitals | null;
}
