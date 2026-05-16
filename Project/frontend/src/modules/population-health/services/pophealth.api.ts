import { apiGet, apiPut } from '@/services/api';
import type { 
  PopHealthDashboardData, PopHealthCohort, 
  PopHealthCampaign, DiseaseSurveillance 
} from '../types/pophealth.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockCohorts: PopHealthCohort[] = [
  { id: 'COH-001', name: 'Diabetic Retinopathy High Risk', description: 'Patients with HbA1c > 8.0 without recent eye exams.', patientCount: 4200, averageAge: 62, riskLevel: 'High', primaryCondition: 'Diabetes Type II', lastUpdated: t(1), tags: ['Diabetes', 'Ophthalmology', 'Care Gap'] },
  { id: 'COH-002', name: 'Pediatric Asthma Non-Compliant', description: 'Asthmatic patients under 18 with 2+ ED visits in last 6 months.', patientCount: 850, averageAge: 9, riskLevel: 'Critical', primaryCondition: 'Asthma', lastUpdated: t(2), tags: ['Pediatrics', 'Asthma', 'ED Utilizers'] },
  { id: 'COH-003', name: 'Post-MI Cardiac Rehab', description: 'Recent myocardial infarction patients enrolled in cardiac rehab.', patientCount: 1100, averageAge: 68, riskLevel: 'Moderate', primaryCondition: 'Ischemic Heart Disease', lastUpdated: t(0), tags: ['Cardiology', 'Rehab'] },
  { id: 'COH-004', name: 'Healthy Aging Baseline', description: 'Patients over 65 with no major chronic conditions.', patientCount: 15400, averageAge: 71, riskLevel: 'Low', primaryCondition: 'None', lastUpdated: t(5), tags: ['Geriatrics', 'Preventive'] },
];

const mockCampaigns: PopHealthCampaign[] = [
  { id: 'CMP-001', title: 'Winter Flu Vaccination Drive', type: 'Vaccination', targetCohortId: 'COH-004', status: 'Active', startDate: t(30), endDate: t(-30), engagementRate: 42.5, conversionRate: 18.2, owner: 'Public Health Dept' },
  { id: 'CMP-002', title: 'Diabetic Eye Exam Outreach', type: 'Screening', targetCohortId: 'COH-001', status: 'Active', startDate: t(10), endDate: t(-60), engagementRate: 28.0, conversionRate: 5.4, owner: 'Endocrinology' },
  { id: 'CMP-003', title: 'Asthma Trigger Education', type: 'Education', targetCohortId: 'COH-002', status: 'Draft', startDate: t(-5), endDate: t(-90), engagementRate: 0, conversionRate: 0, owner: 'Pediatrics' },
];

const mockSurveillance: DiseaseSurveillance[] = [
  { id: 'SURV-001', diseaseName: 'Influenza A (H3N2)', activeCases: 420, weeklyTrend: 15.2, outbreakProbability: 88.5, lastUpdated: t(0), affectedRegions: ['North District', 'Downtown'], severity: 'Outbreak' },
  { id: 'SURV-002', diseaseName: 'Dengue Fever', activeCases: 45, weeklyTrend: 2.1, outbreakProbability: 12.0, lastUpdated: t(1), affectedRegions: ['East Suburbs'], severity: 'Endemic' },
  { id: 'SURV-003', diseaseName: 'Novel Coronavirus Variant', activeCases: 12, weeklyTrend: 120.0, outbreakProbability: 95.0, lastUpdated: t(0), affectedRegions: ['Airport Region'], severity: 'Pandemic Alert' },
];

const mockData: PopHealthDashboardData = {
  metrics: {
    totalMonitoredPatients: 21550,
    highRiskCohorts: 2,
    activeCampaigns: 2,
    overallEngagement: 35.2,
    surveillanceAlerts: 1,
  },
  cohorts: mockCohorts,
  campaigns: mockCampaigns,
  surveillance: mockSurveillance,
};

export const popHealthApi = {
  getDashboardData: async (): Promise<{ data: PopHealthDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: PopHealthDashboardData }>('/api/v1/population-health/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateCampaignStatus: async (campaignId: string, status: string) => {
    try {
      return await apiPut(`/api/v1/population-health/campaigns/${campaignId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Campaign status updated (Mock)', status: 200 };
    }
  }
};
