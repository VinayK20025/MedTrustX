import type { GuardDashboardData } from '../types/guard.types';

export interface GuardFilters { status?: string; }

const mockData: GuardDashboardData = {
  guardName: 'Guard Ravi Kumar',
  shiftEnd: new Date(Date.now() + 4 * 3600000).toISOString(),
  kpis: [
    { id: '1', label: 'Tasks Today', value: 8, status: 'normal' },
    { id: '2', label: 'Completed', value: 6, status: 'success' },
    { id: '3', label: 'Active Alerts', value: 1, status: 'critical' },
    { id: '4', label: 'Patrol Progress', value: '75%', status: 'normal' },
  ],
  tasks: [
    {
      id: 'TSK-001', title: 'Unauthorized Entry — ICU Block B', location: 'ICU Block B — 2nd Floor',
      type: 'Incident Response', priority: 'Emergency', status: 'In Progress',
      assignedAt: new Date(Date.now() - 600000).toISOString(), isEmergency: true,
      instructions: 'An unidentified individual bypassed the ICU biometric scanner. Proceed immediately. Do NOT allow further entry. Contact Dr. ICU Head if required.',
    },
    {
      id: 'TSK-002', title: 'Crowd Control — OPD Triage', location: 'OPD Triage Gate — Ground Floor',
      type: 'Incident Response', priority: 'High', status: 'Pending',
      assignedAt: new Date(Date.now() - 900000).toISOString(), isEmergency: false,
      instructions: 'OPD is over-capacity. Manage patient queuing. Ensure no one bypasses the token counter.',
    },
    {
      id: 'TSK-003', title: 'Visitor Escort — VIP Suite', location: 'VIP Wing — 5th Floor',
      type: 'Visitor Escort', priority: 'Normal', status: 'Pending',
      assignedAt: new Date(Date.now() - 1800000).toISOString(), isEmergency: false,
      instructions: 'Escort Mr. Sharma (visitor pass VP-12) from Main Gate to VIP Suite 502.',
    },
  ],
  todayPatrol: [
    { id: 'CP-1', name: 'Main Gate', location: 'Ground Floor — Entrance', checked: true, checkedAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'CP-2', name: 'OPD Block', location: 'Ground Floor — Wing A', checked: true, checkedAt: new Date(Date.now() - 5400000).toISOString() },
    { id: 'CP-3', name: 'Emergency Bay', location: 'Ground Floor — Wing C', checked: true, checkedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'CP-4', name: 'ICU Entrance', location: '2nd Floor — Critical Care', checked: false },
    { id: 'CP-5', name: 'Pharmacy Store', location: 'Ground Floor — East Wing', checked: false },
    { id: 'CP-6', name: 'Server Room', location: 'Basement — IT Block', checked: false },
  ],
};

export const guardApi = {
  getDashboardSummary: async (filters: GuardFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateTaskStatus: async (taskId: string, status: string) => ({ data: { success: true }, message: `Task ${status}`, status: 200 }),
  checkPatrolPoint: async (checkpointId: string) => ({ data: { success: true }, message: 'Checkpoint logged', status: 200 }),
  escalateIncident: async (taskId: string) => ({ data: { success: true }, message: 'Escalated to Security Manager', status: 200 }),
  reportIncident: async (payload: { type: string; description: string; location: string }) => ({ data: { success: true }, message: 'Incident reported', status: 200 }),
};
