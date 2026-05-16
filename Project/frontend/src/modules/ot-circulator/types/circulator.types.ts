/**
 * MedTrustX — Circulating Nurse Types
 */

export interface CirculatorKPI {
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

export interface CirculatorCase {
  id: string;
  patientName: string;
  procedure: string;
  otRoom: string;
  surgeon: string;
  anesthesiologist: string;
  scrubNurse: string;
  status: 'Patient Prep' | 'Anesthesia Induction' | 'Incision' | 'Closure' | 'Transfer to PACU';
  startTime: string;
}

export interface CoordinationRequest {
  id: string;
  caseId: string;
  type: 'Instrument' | 'Supply' | 'Staff' | 'Blood Product' | 'Imaging';
  description: string;
  requestedBy: 'Surgeon' | 'Scrub Nurse' | 'Anesthesiologist';
  timeRequested: string;
  status: 'Pending' | 'Dispatched' | 'Fulfilled' | 'Escalated';
  priority: 'Routine' | 'Urgent' | 'STAT';
}

export interface SupplyItem {
  id: string;
  name: string;
  category: 'Implants' | 'Sutures' | 'Fluids' | 'Medications' | 'Drapes';
  location: string;
  quantityAvailable: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface SurgicalLog {
  id: string;
  caseId: string;
  timestamp: string;
  eventType: 'Time In' | 'Time Out' | 'Incision' | 'Specimen Sent' | 'Implant Placed' | 'Sponge Count' | 'Closure';
  notes: string;
  loggedBy: string;
}

export interface SafetyChecklistTask {
  id: string;
  caseId: string;
  phase: 'Sign In' | 'Time Out' | 'Sign Out';
  description: string;
  status: 'Pending' | 'Confirmed';
}

export interface CirculatorAlert {
  id: string;
  caseId: string;
  type: 'Missing Supply' | 'Safety Breach' | 'Delay' | 'Specimen Issue';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Resolved';
  message: string;
}

export interface CirculatorDashboardData {
  kpis: CirculatorKPI[];
  activeCase?: CirculatorCase;
  coordinationQueue: CoordinationRequest[];
  supplies: SupplyItem[];
  surgicalLogs: SurgicalLog[];
  safetyChecklist: SafetyChecklistTask[];
  alerts: CirculatorAlert[];
}
