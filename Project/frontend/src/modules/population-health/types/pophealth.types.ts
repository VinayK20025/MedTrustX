/**
 * MedTrustX — Population Health Service Types
 */

export type CohortRiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type CampaignStatus = 'Draft' | 'Active' | 'Completed' | 'Suspended';
export type CampaignType = 'Vaccination' | 'Screening' | 'Education' | 'Follow-up';

export interface PopHealthCohort {
  id: string;
  name: string;
  description: string;
  patientCount: number;
  averageAge: number;
  riskLevel: CohortRiskLevel;
  primaryCondition: string;
  lastUpdated: string;
  tags: string[];
}

export interface PopHealthCampaign {
  id: string;
  title: string;
  type: CampaignType;
  targetCohortId: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  engagementRate: number; // Percentage
  conversionRate: number; // Percentage
  owner: string;
}

export interface DiseaseSurveillance {
  id: string;
  diseaseName: string;
  activeCases: number;
  weeklyTrend: number; // Percentage change
  outbreakProbability: number; // 0-100%
  lastUpdated: string;
  affectedRegions: string[];
  severity: 'Endemic' | 'Outbreak' | 'Pandemic Alert';
}

export interface PopHealthMetrics {
  totalMonitoredPatients: number;
  highRiskCohorts: number;
  activeCampaigns: number;
  overallEngagement: number; // Percentage
  surveillanceAlerts: number;
}

export interface PopHealthDashboardData {
  metrics: PopHealthMetrics;
  cohorts: PopHealthCohort[];
  campaigns: PopHealthCampaign[];
  surveillance: DiseaseSurveillance[];
}
