import { apiGet, apiPost, apiPut } from '@/services/api';
import type { 
  ResearchDashboardData, ClinicalTrial, EnrolledPatient, 
  ResearchDataset, IRBProtocol 
} from '../types/research.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockTrials: ClinicalTrial[] = [
  { id: 'T-001', protocolId: 'PRT-2025-A', title: 'Efficacy of Novel ML-Guided Sepsis Intervention', principalInvestigator: 'Dr. Sarah Chen', department: 'Critical Care', phase: 'Phase 3', status: 'Recruiting', targetEnrollment: 500, currentEnrollment: 124, startDate: t(120), estimatedEndDate: t(-365), sponsor: 'MedTrustX Research Grant', tags: ['Sepsis', 'AI', 'ICU'] },
  { id: 'T-002', protocolId: 'PRT-2024-C', title: 'Long-term Outcomes of Robotic Assisted CABG', principalInvestigator: 'Dr. Marcus Webb', department: 'Cardiology', phase: 'Phase 4', status: 'Active', targetEnrollment: 1000, currentEnrollment: 980, startDate: t(600), estimatedEndDate: t(-120), sponsor: 'National Heart Institute', tags: ['Surgery', 'Robotics', 'CABG'] },
  { id: 'T-003', protocolId: 'PRT-2026-B', title: 'Genetic Markers for Early-Onset Alzheimer', principalInvestigator: 'Dr. Elena Rostova', department: 'Neurology', phase: 'Observational', status: 'Planning', targetEnrollment: 2000, currentEnrollment: 0, startDate: t(-30), estimatedEndDate: t(-1000), sponsor: 'Global Neuro Fund', tags: ['Genetics', 'Alzheimers', 'Observational'] },
  { id: 'T-004', protocolId: 'PRT-2025-X', title: 'Phase 2 Trial of Immunotherapy TX-45 in NSCLC', principalInvestigator: 'Dr. James Okafor', department: 'Oncology', phase: 'Phase 2', status: 'Suspended', targetEnrollment: 150, currentEnrollment: 45, startDate: t(200), estimatedEndDate: t(-200), sponsor: 'BioPharma Inc.', tags: ['Oncology', 'Immunotherapy', 'NSCLC'] },
];

const mockPatients: EnrolledPatient[] = [
  { id: 'EP-001', trialId: 'T-001', patientId: 'P-10042', patientName: 'Rajan Mehta', age: 62, gender: 'Male', enrollmentDate: t(45), status: 'Active', lastVisitDate: t(2), nextVisitDate: t(-12), adverseEvents: 0, protocolDeviations: 0 },
  { id: 'EP-002', trialId: 'T-001', patientId: 'P-10091', patientName: 'Leena Shah', age: 58, gender: 'Female', enrollmentDate: t(10), status: 'Screening', lastVisitDate: t(1), nextVisitDate: t(-5), adverseEvents: 0, protocolDeviations: 0 },
  { id: 'EP-003', trialId: 'T-002', patientId: 'P-98332', patientName: 'Arthur Dent', age: 71, gender: 'Male', enrollmentDate: t(400), status: 'Completed', lastVisitDate: t(10), nextVisitDate: '', adverseEvents: 1, protocolDeviations: 0 },
  { id: 'EP-004', trialId: 'T-004', patientId: 'P-87441', patientName: 'Maria Garcia', age: 44, gender: 'Female', enrollmentDate: t(150), status: 'Withdrawn', lastVisitDate: t(40), nextVisitDate: '', adverseEvents: 2, protocolDeviations: 1 },
];

const mockDatasets: ResearchDataset[] = [
  { id: 'DS-001', name: 'Sepsis Cohort Vitals 2024-2025', description: 'De-identified continuous vital signs for ICU patients with sepsis diagnosis.', trialId: 'T-001', patientCount: 4500, variableCount: 18, sizeMb: 14500, lastUpdated: t(1), accessLevel: 'Internal', format: 'Parquet', status: 'Published' },
  { id: 'DS-002', name: 'Cardiac Surgery Outcomes Registry', description: 'Longitudinal outcomes and complications for CABG surgeries.', trialId: 'T-002', patientCount: 12000, variableCount: 240, sizeMb: 350, lastUpdated: t(7), accessLevel: 'Restricted', format: 'CSV', status: 'Published' },
  { id: 'DS-003', name: 'Neuro Genomics Base Line', description: 'Genomic sequencing baseline data for observational cohort.', trialId: 'T-003', patientCount: 0, variableCount: 4000, sizeMb: 0, lastUpdated: t(0), accessLevel: 'Restricted', format: 'FHIR JSON', status: 'Draft' },
];

const mockProtocols: IRBProtocol[] = [
  { id: 'IRB-2025-042', trialId: 'T-001', irbNumber: 'IRB-MED-1234', status: 'Approved', approvalDate: t(150), expirationDate: t(-215), lastReviewDate: t(150), reviewer: 'IRB Board A' },
  { id: 'IRB-2024-118', trialId: 'T-002', irbNumber: 'IRB-MED-0991', status: 'Approved', approvalDate: t(650), expirationDate: t(-80), lastReviewDate: t(285), reviewer: 'IRB Board B' },
  { id: 'IRB-2026-001', trialId: 'T-003', irbNumber: 'PENDING', status: 'Pending Review', expirationDate: '', lastReviewDate: t(5), reviewer: 'IRB Board A' },
  { id: 'IRB-2025-088', trialId: 'T-004', irbNumber: 'IRB-MED-1402', status: 'Modifications Required', approvalDate: t(250), expirationDate: t(-115), lastReviewDate: t(10), reviewer: 'IRB Board C' },
];

const mockData: ResearchDashboardData = {
  metrics: {
    activeTrials: 14,
    totalEnrolledPatients: 3450,
    pendingIRBReviews: 3,
    adverseEventsLast30Days: 12,
    totalDatasetsPublished: 48,
    fundingActiveGrants: 12500000,
  },
  trials: mockTrials,
  patients: mockPatients,
  datasets: mockDatasets,
  protocols: mockProtocols,
};

export const researchApi = {
  getDashboardData: async (): Promise<{ data: ResearchDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: ResearchDashboardData }>('/api/v1/clinical-research/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateTrialStatus: async (trialId: string, status: string) => {
    try {
      return await apiPut(`/api/v1/clinical-research/trials/${trialId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Trial status updated (Mock)', status: 200 };
    }
  },

  enrollPatient: async (trialId: string, patientId: string) => {
    try {
      return await apiPost(`/api/v1/clinical-research/trials/${trialId}/enroll`, { patientId });
    } catch {
      return { data: { success: true }, message: 'Patient enrolled (Mock)', status: 200 };
    }
  },

  publishDataset: async (datasetId: string) => {
    try {
      return await apiPut(`/api/v1/clinical-research/datasets/${datasetId}/publish`, {});
    } catch {
      return { data: { success: true }, message: 'Dataset published (Mock)', status: 200 };
    }
  }
};
