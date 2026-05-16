/**
 * MedTrustX — Medical Social Worker Types
 */

export interface SocialWorkKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface SocialWorkCase {
  id: string;
  patientName: string;
  mrn: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Assessment Pending' | 'Support Active' | 'Discharge Planning' | 'Follow-up';
  assignedDate: string;
}

export interface PsychosocialAssessment {
  id: string;
  caseId: string;
  socialFactors: {
    livingArrangement: string;
    familySupport: string;
    dependents: number;
  };
  emotionalStatus: {
    mentalHealthIndicators: string[];
    copingMechanism: string;
  };
  financialStatus: {
    incomeBracket: string;
    insuranceCoverage: string;
    financialStrain: boolean;
  };
  needsIdentified: string[];
  assessmentComplete: boolean;
}

export interface CommunityResource {
  id: string;
  name: string;
  type: 'Financial Aid' | 'Housing Support' | 'Counseling' | 'NGO' | 'Government Scheme';
  description: string;
  eligibilityCriteria: string;
  contactInfo: string;
  status: 'Available' | 'Waitlisted' | 'Unavailable';
}

export interface SocialWorkSupportPlan {
  id: string;
  caseId: string;
  interventions: {
    id: string;
    description: string;
    resourceMatched?: string;
    status: 'Planned' | 'In Progress' | 'Secured' | 'Failed';
  }[];
  planSummary: string;
}

export interface SocialWorkerDashboardData {
  kpis: SocialWorkKPI[];
  cases: SocialWorkCase[];
  activeAssessment?: PsychosocialAssessment;
  activePlan?: SocialWorkSupportPlan;
  resourceDirectory: CommunityResource[];
}
