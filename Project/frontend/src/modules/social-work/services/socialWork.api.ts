import type {
  SocialWorkerDashboardData, SocialWorkKPI, SocialWorkCase,
  PsychosocialAssessment, SocialWorkSupportPlan, CommunityResource
} from '../types/socialWork.types';

export interface SocialWorkFilters {
  riskLevel?: string;
}

const mockKpis: SocialWorkKPI[] = [
  { id: '1', title: 'Active Cases', value: 24, format: 'number', status: 'normal' },
  { id: '2', title: 'High-Risk Patients', value: 5, format: 'number', status: 'critical', actionLabel: 'Review Cases', actionUrl: '/dashboard/social-work/cases' },
  { id: '3', title: 'Resources Secured', value: 12, format: 'number', status: 'success' },
  { id: '4', title: 'Pending Follow-ups', value: 8, format: 'number', status: 'warning', actionLabel: 'View Schedule', actionUrl: '/dashboard/social-work/followup' },
];

const mockCases: SocialWorkCase[] = [
  { id: 'SWC-101', patientName: 'Elena Rostova', mrn: 'MRN-8812', riskLevel: 'Critical', status: 'Assessment Pending', assignedDate: new Date(Date.now() - 86400000).toISOString() },
  { id: 'SWC-102', patientName: 'James Wilson', mrn: 'MRN-3341', riskLevel: 'Medium', status: 'Support Active', assignedDate: new Date(Date.now() - 432000000).toISOString() },
];

const mockAssessment: PsychosocialAssessment = {
  id: 'ASMT-101',
  caseId: 'SWC-101',
  socialFactors: { livingArrangement: 'Living alone, 3rd floor walk-up', familySupport: 'Estranged from children', dependents: 0 },
  emotionalStatus: { mentalHealthIndicators: ['Symptoms of severe depression', 'High anxiety regarding medical bills'], copingMechanism: 'Poor' },
  financialStatus: { incomeBracket: 'Below Poverty Line', insuranceCoverage: 'Uninsured', financialStrain: true },
  needsIdentified: ['Urgent Financial Aid for Surgery', 'Post-discharge Housing Support (no stairs)', 'Grief Counseling'],
  assessmentComplete: false,
};

const mockPlan: SocialWorkSupportPlan = {
  id: 'PLAN-101',
  caseId: 'SWC-101',
  interventions: [
    { id: 'INT-1', description: 'Apply for State Emergency Surgery Fund', status: 'In Progress' },
    { id: 'INT-2', description: 'Coordinate transfer to ground-floor assisted living', status: 'Planned' },
  ],
  planSummary: 'Patient requires immediate financial stabilization before surgery can proceed. Post-op living arrangement is unsafe.',
};

const mockResources: CommunityResource[] = [
  { id: 'RES-1', name: 'State Emergency Medical Fund', type: 'Financial Aid', description: 'Provides up to $15k for uninsured emergency surgeries.', eligibilityCriteria: 'Income < 138% FPL, Uninsured', contactInfo: 'admin@statemedfund.gov', status: 'Available' },
  { id: 'RES-2', name: 'Safe Haven Housing Coalition', type: 'Housing Support', description: 'Temporary ground-floor housing for post-op recovery.', eligibilityCriteria: 'Medical referral required', contactInfo: 'intake@safehaven.org', status: 'Waitlisted' },
];

export const socialWorkApi = {
  getDashboardSummary: async (filters: SocialWorkFilters) => ({
    data: {
      kpis: mockKpis,
      cases: mockCases,
      activeAssessment: mockAssessment,
      activePlan: mockPlan,
      resourceDirectory: mockResources,
    } as SocialWorkerDashboardData,
    message: 'Success', status: 200,
  }),

  updateAssessmentStatus: async (caseId: string) => ({ data: { success: true }, message: `Assessment marked complete`, status: 200 }),
  matchResource: async (interventionId: string, resourceId: string) => ({ data: { success: true }, message: `Resource matched to intervention`, status: 200 }),
  closeCase: async (caseId: string) => ({ data: { success: true }, message: `Case closed and archived`, status: 200 }),
};
