/**
 * MedTrustX — Medical Coder (Role 70) Types
 */

export interface CoderKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface CoderCase {
  id: string;
  patientName: string;
  encounterType: 'IPD' | 'OPD' | 'ER';
  priority: 'Low' | 'Med' | 'High' | 'Urgent';
  status: 'Unassigned' | 'In Progress' | 'Validation Error' | 'Submitted';
  dueDate: string;
}

export interface ClinicalContext {
  caseId: string;
  patientHeader: { name: string; mrn: string; dob: string; admitDate: string };
  notes: {
    hpi: string;
    diagnosis: string;
    procedures: string;
  };
  nlpHighlights: { text: string; type: 'diagnosis' | 'procedure' | 'medication' }[];
}

export interface NlpSuggestion {
  code: string;
  description: string;
  confidence: number; // 0-100
  type: 'ICD-10' | 'CPT';
}

export interface ActiveCodingState {
  caseId: string;
  selectedICD: { code: string; description: string; primary: boolean }[];
  selectedCPT: { code: string; description: string; modifier?: string }[];
  validationErrors: string[];
}

export interface CoderDashboardData {
  kpis: CoderKPI[];
  queue: CoderCase[];
  activeContext?: ClinicalContext;
  suggestions: NlpSuggestion[];
  activeCoding?: ActiveCodingState;
}
