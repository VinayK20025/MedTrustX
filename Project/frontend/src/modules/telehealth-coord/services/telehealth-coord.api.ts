import type { TelehealthCoordData } from '../types/telehealth-coord.types';

export interface ThcFilters { status?: string; }

const mockData: TelehealthCoordData = {
  kpis: [
    { id: '1', label: 'Sessions Today', value: 42, status: 'normal' },
    { id: '2', label: 'Completed', value: 28, status: 'success' },
    { id: '3', label: 'No-Show Rate', value: '4.8%', status: 'warning' },
    { id: '4', label: 'Open Issues', value: 3, status: 'warning' },
  ],
  sessions: [
    { id: 'SES-201', patientName: 'Anita Desai', doctorName: 'Dr. R. Kapoor', specialty: 'General Medicine', scheduledAt: new Date(Date.now() - 1200000).toISOString(), status: 'In Progress', duration: 12, connectionStatus: 'Both Connected' },
    { id: 'SES-202', patientName: 'Carlos Vega', doctorName: 'Dr. M. Hassan', specialty: 'Dermatology', scheduledAt: new Date(Date.now() + 300000).toISOString(), status: 'Patient Waiting', connectionStatus: 'Patient Connected' },
    { id: 'SES-203', patientName: 'Emily Watson', doctorName: 'Dr. P. Shah', specialty: 'Psychiatry', scheduledAt: new Date(Date.now() + 1800000).toISOString(), status: 'Scheduled', connectionStatus: 'Ready' },
    { id: 'SES-204', patientName: 'Felix Muller', doctorName: 'Dr. R. Kapoor', specialty: 'General Medicine', scheduledAt: new Date(Date.now() + 3600000).toISOString(), status: 'Scheduled', connectionStatus: 'Ready' },
    { id: 'SES-205', patientName: 'Grace Liu', doctorName: 'Dr. S. Nair', specialty: 'Endocrinology', scheduledAt: new Date(Date.now() - 3600000).toISOString(), status: 'No Show', connectionStatus: 'Issue' },
  ],
  doctors: [
    { id: 'doc1', name: 'Dr. R. Kapoor', specialty: 'General Medicine', status: 'In Consult', nextSlot: new Date(Date.now() + 1200000).toISOString(), sessionsToday: 8 },
    { id: 'doc2', name: 'Dr. M. Hassan', specialty: 'Dermatology', status: 'Available', nextSlot: new Date(Date.now() + 300000).toISOString(), sessionsToday: 5 },
    { id: 'doc3', name: 'Dr. P. Shah', specialty: 'Psychiatry', status: 'Available', nextSlot: new Date(Date.now() + 1800000).toISOString(), sessionsToday: 4 },
    { id: 'doc4', name: 'Dr. S. Nair', specialty: 'Endocrinology', status: 'Offline', nextSlot: '---', sessionsToday: 3 },
  ],
  issues: [
    { id: 'ISS-01', sessionId: 'SES-202', type: 'Connection', description: 'Doctor has not joined. Patient waiting for 5+ minutes.', status: 'Open', reportedAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'ISS-02', sessionId: 'SES-205', type: 'No Show', description: 'Patient did not connect. SMS and call attempted.', status: 'Open', reportedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'ISS-03', sessionId: 'SES-198', type: 'Technical', description: 'Video feed freezing due to low bandwidth on patient side.', status: 'Open', reportedAt: new Date(Date.now() - 7200000).toISOString() },
  ]
};

export const telehealthCoordApi = {
  getDashboardSummary: async (f: ThcFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  notifyDoctor: async (sessionId: string) => ({ data: { success: true }, message: 'Doctor notified via push + SMS', status: 200 }),
  rescheduleSession: async (sessionId: string) => ({ data: { success: true }, message: 'Session rescheduled', status: 200 }),
  resolveIssue: async (issueId: string) => ({ data: { success: true }, message: 'Issue resolved', status: 200 }),
};
