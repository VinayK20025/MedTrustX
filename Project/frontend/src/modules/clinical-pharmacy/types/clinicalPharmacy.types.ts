/**
 * MedTrustX — Clinical Pharmacist Types
 */

export interface ClinicalPharmacyKPI {
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

export interface PatientReviewData {
  id: string;
  patientName: string;
  mrn: string;
  ward: string;
  diagnosis: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Needs Review' | 'Reviewed' | 'Intervention Required';
  lastLabUpdate: string;
  allergies: string[];
}

export interface MedicationOrder {
  id: string;
  drugName: string;
  dosage: string;
  route: 'PO' | 'IV' | 'IM' | 'SC' | 'Topical';
  frequency: string;
  prescribedBy: string;
  startDate: string;
  status: 'Active' | 'Discontinued' | 'On Hold';
  flags: ('Duplicate Therapy' | 'High Dose' | 'Renal Adjust Needed')[];
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB: string;
  severity: 'Contraindicated' | 'Major' | 'Moderate' | 'Minor';
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

export interface ClinicalAlert {
  id: string;
  patientId: string;
  type: 'Drug-Drug Interaction' | 'Drug-Lab Interaction' | 'Dose Adjustment Needed' | 'Adverse Event';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface ClinicalPharmacyDashboardData {
  kpis: ClinicalPharmacyKPI[];
  patients: PatientReviewData[];
  activePatient?: PatientReviewData;
  activeMedications: MedicationOrder[];
  interactions: DrugInteraction[];
  alerts: ClinicalAlert[];
}
