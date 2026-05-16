/**
 * MedTrustX — Clinical Informaticist Types
 * Clinical workflows, data standardization, CDSS, data quality, and UX analytics.
 */

export type WorkflowStatus = 'Active' | 'Draft' | 'Deprecated';
export type StandardizationSystem = 'SNOMED CT' | 'ICD-10' | 'LOINC' | 'RxNorm';
export type QualityScoreStatus = 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical';
export type CDSSRuleStatus = 'Active' | 'Testing' | 'Inactive';

export interface ClinicalWorkflow {
  id: string;
  name: string;
  department: string;
  steps: string[];
  status: WorkflowStatus;
  adoptionRate: number; // percentage of clinicians using it
  avgTimeSavedMins: number;
  lastUpdated: string;
}

export interface StandardizationRule {
  id: string;
  field: string;
  codeSystem: StandardizationSystem;
  complianceRate: number; // percentage
  mappingErrors: number;
}

export interface CDSSRule {
  id: string;
  name: string;
  description: string;
  type: 'Drug Interaction' | 'Abnormal Vitals' | 'Care Pathway' | 'Sepsis Alert';
  status: CDSSRuleStatus;
  alertsFiredToday: number;
  overrideRate: number; // percentage of times clinicians dismiss/override the alert
}

export interface DataQualityMetric {
  id: string;
  metric: string;
  score: number; // percentage
  status: QualityScoreStatus;
  trend: 'up' | 'down' | 'flat';
}

export interface UXMetric {
  id: string;
  taskName: string;
  avgClicks: number;
  avgTimeMins: number;
  errorRate: number;
  satisfactionScore: number; // out of 10
}

export interface SmartAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
  timestamp: string;
  actionRequired: boolean;
}

export interface InformaticistMetrics {
  dataCompleteness: number;
  alertAccuracy: number;
  clinicianSatisfaction: number; // out of 100
  activeWorkflows: number;
  standardizationRate: number; // percentage of fields mapped correctly
  cdssFiredToday: number;
}

export interface InformaticistData {
  metrics: InformaticistMetrics;
  workflows: ClinicalWorkflow[];
  standardizationRules: StandardizationRule[];
  cdssRules: CDSSRule[];
  qualityMetrics: DataQualityMetric[];
  uxMetrics: UXMetric[];
  alerts: SmartAlert[];
}
