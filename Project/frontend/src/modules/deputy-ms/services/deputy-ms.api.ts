/**
 * MedTrustX — Deputy MS API Client
 * Real-time Execution data layer
 */
import type { DeputyMSDashboardData } from '../types/deputy-ms.types';

const BASE_URL = '/api/v1/clinical/deputy-ms';

export interface DeputyFilters {
  ward?: string;
  shift?: 'morning' | 'afternoon' | 'night' | 'all';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: DeputyMSDashboardData['kpis'] = [
  { id: '1', title: 'Patients Waiting', value: 18, status: 'warning', delta: '6 >30 min wait', actionLabel: 'Queue', actionUrl: '/dashboard/deputy-ms/patient-flow' },
  { id: '2', title: 'Discharges Pending', value: 24, status: 'critical', delta: '9 delayed', actionLabel: 'Expedite', actionUrl: '/dashboard/deputy-ms/patient-flow' },
  { id: '3', title: 'Beds Available', value: 12, status: 'warning', delta: 'across 5 wards', actionLabel: 'Allocate', actionUrl: '/dashboard/deputy-ms/beds' },
  { id: '4', title: 'ICU Alerts', value: 4, status: 'critical', delta: '2 critical', actionLabel: 'ICU', actionUrl: '/dashboard/deputy-ms/icu' },
  { id: '5', title: 'Active Complaints', value: 6, status: 'warning', delta: '2 unassigned', actionLabel: 'Review', actionUrl: '/dashboard/deputy-ms/incidents' },
  { id: '6', title: 'Active Issues', value: 14, status: 'critical', delta: '5 critical', actionLabel: 'Resolve Now', actionUrl: '/dashboard/deputy-ms/alerts' },
];

const mockFlowQueue: DeputyMSDashboardData['flowQueue'] = [
  { id: 'Q1', type: 'er_triage', patientName: 'K. Sharma', age: 58, department: 'Emergency', priority: 'emergency', status: 'waiting', waitTime: 45, assignedTo: 'Dr. Patel' },
  { id: 'Q2', type: 'admission', patientName: 'R. Verma', age: 34, department: 'Medicine', ward: 'Ward 3A', priority: 'urgent', status: 'delayed', waitTime: 120, delayReason: 'No beds available in Ward 3A' },
  { id: 'Q3', type: 'discharge', patientName: 'A. Gupta', age: 42, department: 'Surgery', ward: 'Ward 2B', bed: 'B-12', priority: 'routine', status: 'delayed', waitTime: 240, delayReason: 'Pending final summary from surgeon' },
  { id: 'Q4', type: 'discharge', patientName: 'M. Singh', age: 67, department: 'Medicine', ward: 'Ward 1A', bed: 'A-8', priority: 'routine', status: 'delayed', waitTime: 180, delayReason: 'Pharmacy discharge meds pending' },
  { id: 'Q5', type: 'admission', patientName: 'P. Reddy', age: 28, department: 'Obstetrics', priority: 'urgent', status: 'processing', waitTime: 15, assignedTo: 'Bed Coordinator' },
  { id: 'Q6', type: 'er_triage', patientName: 'S. Khan', age: 71, department: 'Emergency', priority: 'emergency', status: 'waiting', waitTime: 8 },
];

const mockWards: DeputyMSDashboardData['wards'] = [
  { id: 'W1', name: 'Ward 1A (Medicine)', totalBeds: 30, occupied: 28, available: 2, pendingDischarges: 5, criticalCount: 1, status: 'high' },
  { id: 'W2', name: 'Ward 2B (Surgery)', totalBeds: 24, occupied: 19, available: 5, pendingDischarges: 4, criticalCount: 0, status: 'normal' },
  { id: 'W3', name: 'Ward 3A (Medicine)', totalBeds: 28, occupied: 28, available: 0, pendingDischarges: 9, criticalCount: 2, status: 'full' },
  { id: 'W4', name: 'Ward 4 (Obstetrics)', totalBeds: 20, occupied: 15, available: 5, pendingDischarges: 2, criticalCount: 0, status: 'normal' },
];

const mockIssues: DeputyMSDashboardData['issues'] = [
  { id: 'IS-101', title: 'Patient family complaint — 4hr admission wait in Emergency', type: 'complaint', severity: 'critical', department: 'Emergency', status: 'open', reportedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'IS-102', title: 'Ward 3A full — 2 admission requests queued with no beds', type: 'delay', severity: 'critical', department: 'Medicine', status: 'assigned', reportedAt: new Date(Date.now() - 3600000).toISOString(), assignedTo: 'Ward In-Charge' },
  { id: 'IS-103', title: 'Pharmacy delay — 6 discharge prescriptions pending >2hr', type: 'escalation', severity: 'high', department: 'Pharmacy', status: 'in_progress', reportedAt: new Date(Date.now() - 5400000).toISOString(), assignedTo: 'Pharmacy Head' },
  { id: 'IS-104', title: 'Surgical discharge summary not signed — Dr. Rao unavailable', type: 'delay', severity: 'high', department: 'Surgery', status: 'open', reportedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'IS-105', title: 'Patient fall in Ward 1A — incident report required', type: 'incident', severity: 'high', department: 'Medicine', status: 'assigned', reportedAt: new Date(Date.now() - 10800000).toISOString(), assignedTo: 'Nursing In-Charge' },
];

const mockTasks: DeputyMSDashboardData['tasks'] = [
  { id: 'TK1', title: 'Expedite 9 pending discharges in Ward 3A', priority: 'critical', assignedTo: 'Ward 3A In-Charge', department: 'Medicine', status: 'in_progress', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'TK2', title: 'Arrange bed for R. Verma admission (urgent)', priority: 'critical', assignedTo: 'Bed Coordinator', department: 'Medicine', status: 'assigned', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'TK3', title: 'Follow up pharmacy — clear discharge med backlog', priority: 'high', assignedTo: 'Pharmacy Duty', department: 'Pharmacy', status: 'assigned', createdAt: new Date(Date.now() - 5400000).toISOString() },
  { id: 'TK4', title: 'Get discharge summary signed — Surgery Ward 2B', priority: 'high', assignedTo: 'Duty Registrar', department: 'Surgery', status: 'pending', createdAt: new Date(Date.now() - 9000000).toISOString() },
  { id: 'TK5', title: 'File incident report — Ward 1A patient fall', priority: 'medium', assignedTo: 'Nursing IC', department: 'Medicine', status: 'pending', createdAt: new Date(Date.now() - 10800000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const deputyMSApi = {
  getDashboardSummary: async (filters: DeputyFilters) => ({
    data: {
      kpis: mockKpis,
      flowQueue: mockFlowQueue,
      wards: mockWards,
      issues: mockIssues,
      tasks: mockTasks,
    } as DeputyMSDashboardData,
    message: 'Success',
    status: 200,
  }),

  resolveItem: async (id: string) => ({ data: { success: true }, message: 'Resolved', status: 200 }),
  assignTask: async (id: string, to: string) => ({ data: { success: true }, message: 'Assigned', status: 200 }),
  completeTask: async (id: string) => ({ data: { success: true }, message: 'Completed', status: 200 }),
};
