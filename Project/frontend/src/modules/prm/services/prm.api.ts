import type {
  PrmDashboardData, PrmKPI, PatientFeedback,
  PatientComplaint, ServiceQualityMetric
} from '../types/prm.types';

export interface PrmFilters {
  department?: string;
  sentiment?: string;
}

const mockKpis: PrmKPI[] = [
  { id: '1', title: 'Hospital CSAT', value: '4.6/5', format: 'text', status: 'success' },
  { id: '2', title: 'Net Promoter Score', value: '+42', format: 'text', status: 'success' },
  { id: '3', title: 'Active Complaints', value: 12, format: 'number', status: 'warning', actionLabel: 'Resolve Issues', actionUrl: '/dashboard/prm/complaints' },
  { id: '4', title: 'Avg Resolution Time', value: '14 hrs', format: 'text', status: 'normal' },
];

const mockFeedback: PatientFeedback[] = [
  { id: 'FB-101', patientName: 'Maria Garcia', department: 'Maternity', rating: 5, comment: 'The nursing staff was incredibly supportive during my delivery.', sentiment: 'Positive', dateReceived: new Date(Date.now() - 3600000).toISOString() },
  { id: 'FB-102', patientName: 'Robert Chen', department: 'Emergency', rating: 2, comment: 'Waited over 3 hours just to see a triage nurse. Unacceptable.', sentiment: 'Negative', dateReceived: new Date(Date.now() - 7200000).toISOString() },
  { id: 'FB-103', patientName: 'Sarah Jenkins', department: 'Pharmacy', rating: 4, comment: 'Quick service but the waiting area was too crowded.', sentiment: 'Neutral', dateReceived: new Date(Date.now() - 86400000).toISOString() },
];

const mockComplaints: PatientComplaint[] = [
  { id: 'CMP-101', patientName: 'Robert Chen', category: 'Wait Time', description: 'Patient experienced a 3-hour delay in the ER lobby before initial triage assessment.', priority: 'High', status: 'New', assignedToDepartment: 'Emergency', dateFiled: new Date(Date.now() - 7200000).toISOString() },
  { id: 'CMP-102', patientName: 'Linda Smith', category: 'Billing', description: 'Patient was double-charged for anesthesiology services on her recent surgery.', priority: 'Medium', status: 'Investigating', assignedToDepartment: 'Billing', dateFiled: new Date(Date.now() - 172800000).toISOString() },
];

const mockQuality: ServiceQualityMetric[] = [
  { department: 'Maternity', avgRating: 4.8, npsScore: 55, complaintVolume: 2, trend: 'Improving' },
  { department: 'Surgery', avgRating: 4.5, npsScore: 40, complaintVolume: 5, trend: 'Stable' },
  { department: 'Emergency', avgRating: 3.2, npsScore: -10, complaintVolume: 28, trend: 'Declining' },
];

export const prmApi = {
  getDashboardSummary: async (filters: PrmFilters) => ({
    data: {
      kpis: mockKpis,
      recentFeedback: mockFeedback,
      activeComplaints: mockComplaints,
      qualityMetrics: mockQuality,
    } as PrmDashboardData,
    message: 'Success', status: 200,
  }),

  escalateComplaint: async (complaintId: string) => ({ data: { success: true }, message: `Complaint escalated to department head`, status: 200 }),
  resolveComplaint: async (complaintId: string, resolutionNotes: string) => ({ data: { success: true }, message: `Complaint marked as resolved`, status: 200 }),
  sendPatientFollowup: async (patientId: string, message: string) => ({ data: { success: true }, message: `Follow-up message sent to patient`, status: 200 }),
};
