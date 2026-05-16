/**
 * MedTrustX — Health Data Scientist Types
 * Predictive modeling, cohorts, population health, and risk scoring.
 */

export type RiskLevel = 'High' | 'Medium' | 'Low';
export type TrendDirection = 'Increasing' | 'Stable' | 'Decreasing';

export interface PatientRiskPrediction {
  patientId: string;
  name: string;
  age: number;
  condition: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  primaryRiskFactor: string;
  predictionDate: string;
}

export interface PredictiveModel {
  id: string;
  name: string;
  target: 'Readmission' | 'Mortality' | 'Disease Progression' | 'LOS';
  accuracy: number;
  aucRoc: number;
  patientsScored: number;
  status: 'Active' | 'Retraining' | 'Archived';
}

export interface FeatureImportance {
  feature: string;
  importanceScore: number; // 0 to 1
  category: 'Demographic' | 'Clinical' | 'Lab' | 'Medication';
}

export interface PopulationTrend {
  id: string;
  disease: string;
  currentCases: number;
  trend: TrendDirection;
  changeRate: number; // percentage change
  impactLevel: 'Critical' | 'Warning' | 'Normal';
}

export interface CohortDefinition {
  id: string;
  name: string;
  criteria: string[];
  patientCount: number;
  avgAge: number;
  primaryCondition: string;
}

export interface DataScientistMetrics {
  totalPatientsAnalyzed: number;
  highRiskIdentified: number;
  activeModels: number;
  avgModelAccuracy: number;
  predictionLatencyMs: number;
  dataCoverage: number;
}

export interface InsightAlert {
  id: string;
  title: string;
  description: string;
  type: 'Anomaly' | 'Trend' | 'Data Quality';
  severity: 'Critical' | 'Warning' | 'Info';
  timestamp: string;
}

export interface DataScientistData {
  metrics: DataScientistMetrics;
  riskPredictions: PatientRiskPrediction[];
  models: PredictiveModel[];
  features: FeatureImportance[];
  populationTrends: PopulationTrend[];
  cohorts: CohortDefinition[];
  alerts: InsightAlert[];
}
