import type { GeneticData } from '../types/genetic.types';

export interface GeneticFilters { status?: string; }

const mockData: GeneticData = {
  metrics: {
    activeCases: 42,
    sessionsConducted: 8,
    highRiskPatients: 12,
    followUpRate: 90,
  },
  patients: [
    { id: 'GP-1001', name: 'Emily Clark', mrn: 'MRN-77312', age: 34, gender: 'F', referralReason: 'Strong family history of breast cancer', riskLevel: 'High', status: 'Post-Test', nextSessionDate: new Date(Date.now() + 86400000).toISOString() },
    { id: 'GP-1002', name: 'David Lee', mrn: 'MRN-88210', age: 41, gender: 'M', referralReason: 'Preconception carrier screening', riskLevel: 'Low', status: 'Pre-Test' },
    { id: 'GP-1003', name: 'Sarah Jenkins', mrn: 'MRN-91022', age: 29, gender: 'F', referralReason: 'Early-onset colorectal cancer', riskLevel: 'High', status: 'Counseling Complete' },
  ],
  familyHistories: {
    'GP-1001': [
      { id: 'FM-1', relation: 'Mother', condition: 'Breast Cancer', ageOfOnset: 45, deceased: true },
      { id: 'FM-2', relation: 'Maternal Aunt', condition: 'Ovarian Cancer', ageOfOnset: 52, deceased: false },
    ],
    'GP-1003': [
      { id: 'FM-3', relation: 'Father', condition: 'Colorectal Cancer', ageOfOnset: 38, deceased: true },
    ]
  },
  risks: {
    'GP-1001': [
      { condition: 'Breast Cancer', probabilityPercentage: 85, riskCategory: 'High', keyFactors: ['Maternal history', 'BRCA1 Pathogenic Variant'] },
      { condition: 'Ovarian Cancer', probabilityPercentage: 40, riskCategory: 'High', keyFactors: ['Maternal Aunt history', 'BRCA1 Pathogenic Variant'] },
    ],
    'GP-1002': [
      { condition: 'Cystic Fibrosis (Carrier)', probabilityPercentage: 25, riskCategory: 'Elevated', keyFactors: ['Partner is a known carrier'] },
    ]
  },
  reports: {
    'GP-1001': [
      { id: 'REP-001', testName: 'Comprehensive Hereditary Cancer Panel', gene: 'BRCA1', variant: 'c.5266dupC', pathogenicity: 'Pathogenic', impact: 'Significantly increased risk for breast and ovarian cancer.', dateReported: new Date(Date.now() - 5 * 86400000).toISOString() }
    ],
    'GP-1003': [
      { id: 'REP-002', testName: 'Lynch Syndrome Panel', gene: 'MLH1', variant: 'c.2252_2253delAA', pathogenicity: 'Pathogenic', impact: 'Diagnosis of Lynch Syndrome confirmed.', dateReported: new Date(Date.now() - 30 * 86400000).toISOString() }
    ]
  },
  sessions: {
    'GP-1001': [
      { id: 'SESS-1', date: new Date(Date.now() - 2 * 86400000).toISOString(), discussionSummary: 'Reviewed positive BRCA1 result. Discussed implications for patient and family members. Reviewed risk-reducing mastectomy and oophorectomy options.', recommendations: ['Consult with breast surgeon', 'Referral to gynecologic oncologist', 'Cascade testing for siblings'], patientUnderstanding: 'Excellent' }
    ]
  }
};

export const geneticApi = {
  getDashboardData: async (f: GeneticFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  logSession: async (patientId: string, summary: string, recommendations: string[]) => ({ data: { success: true }, message: 'Session logged', status: 200 }),
  updateRiskLevel: async (patientId: string, level: string) => ({ data: { success: true }, message: 'Risk level updated', status: 200 }),
};
