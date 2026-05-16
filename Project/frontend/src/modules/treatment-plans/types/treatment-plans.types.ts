/**
 * MedTrustX — Treatment Plans Types
 */

export interface TreatmentPlanItem {
  id: string;
  treatmentPlanId: string;
  itemType: 'medication' | 'procedure' | 'monitoring' | 'lifestyle';
  description: string;
  schedule: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'active';
  createdAt: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  encounterId?: string;
  planName: string;
  status: 'active' | 'completed' | 'suspended';
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: TreatmentPlanItem[];
}

export interface TreatmentPlanVersion {
  id: string;
  treatmentPlanId: string;
  version: number;
  changes: Record<string, any>;
  createdAt: string;
}

export interface TreatmentAdherence {
  id: string;
  patientId: string;
  treatmentPlanId: string;
  adherenceStatus: 'compliant' | 'non_compliant' | 'partial';
  notes?: string;
  recordedAt: string;
}

export interface TreatmentPlanKPI {
  id: string;
  label: string;
  value: number | string;
  subLabel: string;
  status: 'success' | 'warning' | 'critical' | 'normal';
}

export interface TreatmentPlansDashboardData {
  kpis: TreatmentPlanKPI[];
  plans: TreatmentPlan[];
  activePlan?: TreatmentPlan;
  recentVersions: TreatmentPlanVersion[];
  adherenceRecords: TreatmentAdherence[];
}

export interface TreatmentPlansFilters {
  patientId?: string;
  planId?: string;
}

export interface TreatmentPlanCreateRequest {
  patientId: string;
  encounterId?: string;
  planName: string;
  items: Array<{
    itemType: 'medication' | 'procedure' | 'monitoring' | 'lifestyle';
    description: string;
    schedule: Record<string, any>;
  }>;
}
