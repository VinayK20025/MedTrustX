import { apiGet, apiPost } from '@/services/api';
import type { QualityDashboardData, QualityIncident, QualityIndicator, QualityProject } from '../types/quality.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockIncidents: QualityIncident[] = [
  { id: 'INC-202', type: 'Medication Near Miss', severity: 'Medium', status: 'Investigating', reporter: 'Nurse Jane Doe', department: 'ICU', dateReported: t(1), description: 'Wrong dosage of insulin prepared but caught before administration.' },
  { id: 'INC-201', type: 'Patient Fall', severity: 'High', status: 'Resolved', reporter: 'Dr. Mike Ross', department: 'Orthopedics', dateReported: t(3), description: 'Patient slipped in bathroom. Minor bruising.' },
  { id: 'INC-200', type: 'Equipment Failure', severity: 'Low', status: 'Closed', reporter: 'Tech Sarah', department: 'Radiology', dateReported: t(10), description: 'Defective IV pump removed from service.' },
];

const mockIndicators: QualityIndicator[] = [
  { id: 'QI-01', name: 'Hand Hygiene Compliance', value: 94.2, target: 95, unit: '%', trend: 'up', status: 'On Track' },
  { id: 'QI-02', name: 'Surgical Site Infection Rate', value: 1.8, target: 1.5, unit: '%', trend: 'down', status: 'Warning' },
  { id: 'QI-03', name: 'Emergency Dept Wait Time', value: 42, target: 30, unit: 'min', trend: 'up', status: 'Critical' },
];

const mockProjects: QualityProject[] = [
  { id: 'PRJ-10', title: 'Zero Harm Initiative', leads: ['Dr. Marcus Webb'], status: 'In Progress', startDate: t(60), targetCompletion: t(-120), progressPercent: 65 },
  { id: 'PRJ-11', title: 'Post-Op Sepsis Reduction', leads: ['Dr. Elena Rostova'], status: 'Planning', startDate: t(5), targetCompletion: t(-180), progressPercent: 12 },
];

const mockData: QualityDashboardData = {
  metrics: {
    incidentResolutionRate: 88.5,
    activeQiProjects: 12,
    overallComplianceScore: 92.1,
    mortalityRatePercent: 1.2,
    readmissionRatePercent: 8.4
  },
  incidents: mockIncidents,
  indicators: mockIndicators,
  projects: mockProjects
};

export const qualityApi = {
  getDashboardData: async (): Promise<{ data: QualityDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: QualityDashboardData }>('/api/v1/quality/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  reportIncident: async (incident: Partial<QualityIncident>) => {
    try {
      return await apiPost('/api/v1/quality/incidents', incident);
    } catch {
      return { data: { success: true }, message: 'Incident reported (Mock)', status: 200 };
    }
  }
};
