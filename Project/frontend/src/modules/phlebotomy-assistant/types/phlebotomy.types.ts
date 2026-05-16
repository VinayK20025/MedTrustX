/**
 * MedTrustX — Assistant Phlebotomist Types
 */

export interface PhlebotomyKPI {
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

export interface PhlebotomyPatient {
  id: string;
  patientName: string;
  mrn: string; // Medical Record Number
  dob: string;
  room?: string;
  status: 'Waiting' | 'In Progress' | 'Collected' | 'Handover Pending' | 'Completed';
  priority: 'Routine' | 'Fasting' | 'STAT';
  waitTimeMinutes: number;
}

export interface CollectionTest {
  id: string;
  patientId: string;
  testName: string;
  tubeColor: 'Red' | 'Purple (Lavender)' | 'Light Blue' | 'Green' | 'Gray' | 'Gold (SST)';
  preparationNotes: string;
  status: 'Pending' | 'Tube Prepared' | 'Label Printed' | 'Collected';
}

export interface VerificationStep {
  id: string;
  stepName: string;
  description: string;
  isVerified: boolean;
  isRequired: boolean;
}

export interface HandoverBatch {
  id: string;
  tubeCount: number;
  destinationLab: string;
  status: 'Pending Transfer' | 'In Transit' | 'Received by Lab';
  createdAt: string;
}

export interface PhlebotomyAlert {
  id: string;
  patientId?: string;
  type: 'Patient Mismatch' | 'Label Error' | 'STAT Delay' | 'Duplicate Request';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface PhlebotomyDashboardData {
  kpis: PhlebotomyKPI[];
  patientQueue: PhlebotomyPatient[];
  activePatient?: PhlebotomyPatient;
  activeTests: CollectionTest[];
  verificationSteps: VerificationStep[];
  handoverBatches: HandoverBatch[];
  alerts: PhlebotomyAlert[];
}
