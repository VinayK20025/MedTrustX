/**
 * MedTrustX — Nursing Assistant API Client
 * Basic care tasks and patient routing
 */
import type { AssistantDashboardData } from '../types/assistant.types';

const BASE_URL = '/api/v1/nursing/assistant';

export interface AssistantFilters {
  status?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: AssistantDashboardData['kpis'] = [
  { id: '1', title: 'Pending Tasks', value: 5, status: 'warning', delta: '2 overdue' },
  { id: '2', title: 'Completed', value: 12, status: 'success', delta: 'This shift' },
  { id: '3', title: 'Patient Calls', value: 1, status: 'critical', delta: 'Needs assistance' },
];

const mockTasks: AssistantDashboardData['tasks'] = [
  { 
    id: 'T1', type: 'feeding', title: 'Assist Feeding', patientName: 'Mary Johnson', bed: 'Ward A - Bed 12', timeScheduled: '12:00 PM', status: 'pending',
    instructions: ['Check patient name band', 'Sit patient upright at 45 degrees', 'Assist with lunch tray', 'Record amount eaten']
  },
  { 
    id: 'T2', type: 'hygiene', title: 'Bed Bath', patientName: 'Robert Smith', bed: 'Ward A - Bed 14', timeScheduled: '12:30 PM', status: 'pending',
    instructions: ['Gather clean towels and wipes', 'Ensure privacy', 'Assist with partial bath', 'Change bed linens if needed']
  },
  { 
    id: 'T3', type: 'mobility', title: 'Assist Walking', patientName: 'Emma Davis', bed: 'Ward B - Bed 05', timeScheduled: '01:00 PM', status: 'pending',
    instructions: ['Apply non-slip socks', 'Use gait belt', 'Walk to nurse station and back', 'Report any dizziness']
  },
];

const mockPatients: AssistantDashboardData['patients'] = [
  { id: 'P1', name: 'Mary Johnson', bed: 'Ward A - Bed 12', requiresAssistance: true, notes: 'Fall risk' },
  { id: 'P2', name: 'Robert Smith', bed: 'Ward A - Bed 14', requiresAssistance: true, notes: 'Bedbound' },
  { id: 'P3', name: 'Emma Davis', bed: 'Ward B - Bed 05', requiresAssistance: false, notes: 'Independent' },
];

const mockAlerts: AssistantDashboardData['alerts'] = [
  { id: 'A1', type: 'nurse_call', message: 'Ward A - Bed 12: Patient requested assistance (Water)', severity: 'medium', timestamp: new Date().toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const assistantApi = {
  getDashboardSummary: async (filters: AssistantFilters) => ({
    data: {
      kpis: mockKpis,
      tasks: mockTasks,
      patients: mockPatients,
      alerts: mockAlerts,
    } as AssistantDashboardData,
    message: 'Success', status: 200,
  }),
};
