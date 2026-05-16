import type { DataScientistData } from '../types/data-scientist.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: DataScientistData = {
  metrics: {
    totalPatientsAnalyzed: 142_500,
    highRiskIdentified: 1_240,
    activeModels: 12,
    avgModelAccuracy: 94.2,
    predictionLatencyMs: 185,
    dataCoverage: 98.4,
  },
  riskPredictions: [
    { patientId: 'P-84920', name: 'Rajesh Kumar', age: 68, condition: 'Heart Failure', riskScore: 88, riskLevel: 'High', primaryRiskFactor: 'Recent ICU admission (7 days ago)', predictionDate: t(-600) },
    { patientId: 'P-11024', name: 'Anita Desai', age: 54, condition: 'Type 2 Diabetes', riskScore: 72, riskLevel: 'High', primaryRiskFactor: 'HbA1c > 9.0%', predictionDate: t(-3600) },
    { patientId: 'P-44021', name: 'Mohammed Ali', age: 71, condition: 'COPD', riskScore: 65, riskLevel: 'Medium', primaryRiskFactor: 'Decreased SpO2 trends', predictionDate: t(-7200) },
    { patientId: 'P-99210', name: 'Sunita Sharma', age: 45, condition: 'Post-Op Gastric Bypass', riskScore: 24, riskLevel: 'Low', primaryRiskFactor: 'Normal recovery vitals', predictionDate: t(-14400) },
  ],
  models: [
    { id: 'MOD-01', name: '30-Day Readmission Predictor', target: 'Readmission', accuracy: 92.4, aucRoc: 0.89, patientsScored: 45200, status: 'Active' },
    { id: 'MOD-02', name: 'Sepsis Mortality Risk', target: 'Mortality', accuracy: 96.1, aucRoc: 0.94, patientsScored: 12400, status: 'Active' },
    { id: 'MOD-03', name: 'CKD Progression Model', target: 'Disease Progression', accuracy: 88.5, aucRoc: 0.82, patientsScored: 34100, status: 'Active' },
    { id: 'MOD-04', name: 'ICU Length of Stay', target: 'LOS', accuracy: 84.2, aucRoc: 0.79, patientsScored: 18500, status: 'Retraining' },
  ],
  features: [
    { feature: 'Prior Admissions (12mo)', importanceScore: 0.88, category: 'Clinical' },
    { feature: 'Age', importanceScore: 0.76, category: 'Demographic' },
    { feature: 'Creatinine Clearance', importanceScore: 0.72, category: 'Lab' },
    { feature: 'Polypharmacy (>5 meds)', importanceScore: 0.65, category: 'Medication' },
    { feature: 'Lactate Levels', importanceScore: 0.91, category: 'Lab' },
  ],
  populationTrends: [
    { id: 'TR-1', disease: 'Dengue Fever', currentCases: 142, trend: 'Increasing', changeRate: 45.2, impactLevel: 'Critical' },
    { id: 'TR-2', disease: 'Type 2 Diabetes Complications', currentCases: 840, trend: 'Increasing', changeRate: 12.4, impactLevel: 'Warning' },
    { id: 'TR-3', disease: 'Seasonal Influenza', currentCases: 56, trend: 'Decreasing', changeRate: -24.5, impactLevel: 'Normal' },
    { id: 'TR-4', disease: 'Hypertensive Crisis', currentCases: 312, trend: 'Stable', changeRate: 2.1, impactLevel: 'Warning' },
  ],
  cohorts: [
    { id: 'COH-1', name: 'Elderly Heart Failure (LVEF <40%)', criteria: ['Age > 65', 'Diagnosis = Heart Failure', 'LVEF < 40%'], patientCount: 1420, avgAge: 74, primaryCondition: 'Heart Failure' },
    { id: 'COH-2', name: 'Uncontrolled Diabetics', criteria: ['Diagnosis = T2DM', 'HbA1c > 8.5%'], patientCount: 3840, avgAge: 58, primaryCondition: 'Type 2 Diabetes' },
    { id: 'COH-3', name: 'Post-Surgical High Risk', criteria: ['Surgery in last 7 days', 'ASA Class >= 3'], patientCount: 420, avgAge: 62, primaryCondition: 'Surgical Recovery' },
  ],
  alerts: [
    { id: 'ALT-1', title: 'Unusual Spike in ICU Admissions', description: 'ICU admissions from the ER have increased by 35% in the last 24 hours. Primary diagnoses: Respiratory distress.', type: 'Anomaly', severity: 'Critical', timestamp: t(-3600) },
    { id: 'ALT-2', title: 'Readmission Model Drift', description: 'The 30-Day Readmission model accuracy dropped below 90% threshold for the surgical cohort.', type: 'Data Quality', severity: 'Warning', timestamp: t(-14400) },
  ],
};

export const dataScientistApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  retrainModel: async (id: string) => ({ data: { success: true }, message: 'Model retraining initiated', status: 200 }),
  exportCohort: async (id: string) => ({ data: { success: true }, message: 'Cohort exported to Data Lake', status: 200 }),
};
