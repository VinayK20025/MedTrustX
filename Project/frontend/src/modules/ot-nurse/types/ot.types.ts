/**
 * MedTrustX — OT Nurse Types
 * Step-based surgical workflow, instrument tracking, and safety validations
 */

export interface OTKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface OTSurgeryCase {
  id: string;
  patientName: string;
  procedure: string;
  surgeon: string;
  room: string;
  status: 'scheduled' | 'pre_op' | 'intra_op' | 'post_op';
  startTime: string;
}

export interface OTChecklistItem {
  id: string;
  category: 'identity' | 'consent' | 'instruments' | 'anesthesia';
  task: string;
  status: 'pending' | 'confirmed' | 'issue';
}

export interface OTInstrument {
  id: string;
  name: string;
  initialCount: number;
  currentCount: number;
  status: 'verified' | 'missing' | 'in_use';
}

export interface OTAlert {
  id: string;
  type: 'instrument_missing' | 'vitals_warning' | 'delay';
  message: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

export interface OTDashboardData {
  kpis: OTKPI[];
  activeCase: OTSurgeryCase | null;
  upcomingCases: OTSurgeryCase[];
  checklist: OTChecklistItem[];
  instruments: OTInstrument[];
  alerts: OTAlert[];
}
