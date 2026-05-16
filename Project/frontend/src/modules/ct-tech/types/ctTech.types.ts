/**
 * MedTrustX — CT Scan Technician Types
 */

export interface CtKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time' | 'mSv';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface CtPatientQueue {
  id: string;
  patientName: string;
  mrn: string;
  study: string;
  status: 'Waiting' | 'Screening' | 'In Setup' | 'Scanning' | 'Image Review' | 'Completed';
  priority: 'Routine' | 'Urgent' | 'STAT';
  appointmentTime: string;
}

export interface ContrastScreening {
  id: string;
  patientId: string;
  questions: {
    id: string;
    text: string;
    isSafe: boolean | null; // null = unanswered, false = risk (e.g. allergy)
    isCriticalBlocker: boolean;
  }[];
  egfrValue?: number; // eGFR for kidney function
  isCleared: boolean;
  clearanceTimestamp?: string;
}

export interface CtProtocol {
  id: string;
  name: string;
  description: string;
  parameters: {
    kVp: number;
    mA: number;
    pitch: number;
    sliceThickness: string;
    contrastDelaySeconds?: number; // Timing for contrast
    estimatedDoseMSv: number;
  };
  progressPercent?: number;
}

export interface RadiationDoseRecord {
  id: string;
  patientId: string;
  studyId: string;
  ctdiVol: number; // mGy
  dlp: number; // mGy*cm
  effectiveDoseMSv: number; // mSv
  thresholdLimit: number;
  isOverLimit: boolean;
  timestamp: string;
}

export interface CtAlert {
  id: string;
  patientId?: string;
  type: 'High Radiation Dose' | 'Contrast Reaction' | 'STAT Delay' | 'Tube Heat Critical';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface CtTechDashboardData {
  kpis: CtKPI[];
  queue: CtPatientQueue[];
  activePatient?: CtPatientQueue;
  activeScreening?: ContrastScreening;
  activeProtocol?: CtProtocol;
  doseRecords: RadiationDoseRecord[];
  alerts: CtAlert[];
}
