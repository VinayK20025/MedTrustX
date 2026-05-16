import { apiGet, apiPost } from '@/services/api';
import type { IncidentDashboardData, IncidentReport, RootCauseAnalysis } from '../types/incident.types';

const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600000).toISOString();
const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockIncidents: IncidentReport[] = [
  { id: 'INC-2024-001', category: 'Patient Safety', severity: 'High', status: 'RCA in Progress', title: 'Patient Fall in Ward 4', location: 'Ward 4, Room 402', reportedAt: d(2), reportedBy: 'Nurse Sarah', description: 'Patient attempted to get out of bed without assistance and fell.' },
  { id: 'INC-2024-002', category: 'Security', severity: 'Medium', status: 'Reported', title: 'Unauthorised Access Attempt', location: 'IT Server Room', reportedAt: h(4), reportedBy: 'Security System', description: 'Repeated failed badge swipes at Server Room entry.' },
  { id: 'INC-2024-003', category: 'Occupational Health', severity: 'Low', status: 'Under Investigation', title: 'Needlestick Injury', location: 'Emergency Dept', reportedAt: d(1), reportedBy: 'Dr. Mike', description: 'Accidental needlestick during blood draw.' },
];

const mockRCAs: RootCauseAnalysis[] = [
  { id: 'RCA-101', incidentId: 'INC-2024-001', methodology: '5 Whys', findings: ['Inadequate floor lighting', 'Call bell malfunction'], recommendations: ['Repair call bell system', 'Install motion-sensor night lights'], assignedTo: 'Risk Manager Jane', targetCompletionDate: f(3) },
];

const mockData: IncidentDashboardData = {
  metrics: {
    totalIncidentsCount: 142,
    openInvestigationsCount: 12,
    averageTimeToClosureDays: 5.4,
    highSeverityAlertsCount: 2,
    rcaCompletionRatePercent: 94.5
  },
  recentIncidents: mockIncidents,
  criticalInvestigations: mockIncidents.filter(i => i.severity === 'High' || i.severity === 'Sentinel'),
  pendingRCAs: mockRCAs
};

export const incidentApi = {
  getDashboardData: async (): Promise<{ data: IncidentDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: IncidentDashboardData }>('/api/v1/incidents/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  reportIncident: async (incident: Partial<IncidentReport>) => {
    try {
      return await apiPost('/api/v1/incidents/report', incident);
    } catch {
      return { data: { success: true, id: 'INC-NEW-' + Date.now() }, message: 'Incident reported (Mock)', status: 200 };
    }
  }
};
