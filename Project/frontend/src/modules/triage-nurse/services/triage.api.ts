/**
 * MedTrustX — Triage Nurse API Client
 * High-speed intake data and routing endpoints
 */
import type { TriageDashboardData } from '../types/triage.types';

const BASE_URL = '/api/v1/nursing/triage';

export interface TriageFilters {
  status?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: TriageDashboardData['kpis'] = [
  { id: '1', title: 'Waiting Triage', value: 8, status: 'warning', delta: 'Avg wait: 4m' },
  { id: '2', title: 'Critical Identified', value: 2, status: 'critical', delta: 'Immediate route' },
  { id: '3', title: 'Avg Triage Time', value: '2m 15s', status: 'success', delta: 'Target: <3m' },
];

const mockIncomingQueue: TriageDashboardData['incomingQueue'] = [
  { id: 'P1', name: 'James Wilson', age: 54, complaint: 'Chest pain, radiating to left arm', arrivalTime: '10:15 AM', waitTimeMins: 2, status: 'waiting_triage', assignedLevel: 'unassigned' },
  { id: 'P2', name: 'Anna Lee', age: 22, complaint: 'Sprained ankle, swelling', arrivalTime: '10:05 AM', waitTimeMins: 12, status: 'waiting_triage', assignedLevel: 'unassigned' },
  { id: 'P3', name: 'Robert Chen', age: 67, complaint: 'Shortness of breath, dizzy', arrivalTime: '10:10 AM', waitTimeMins: 7, status: 'waiting_triage', assignedLevel: 'unassigned' },
];

const mockRecentTriaged: TriageDashboardData['recentTriaged'] = [
  { id: 'P4', name: 'Maria Garcia', age: 34, complaint: 'High fever, vomiting', arrivalTime: '09:45 AM', waitTimeMins: 0, status: 'routed', assignedLevel: 'urgent' },
  { id: 'P5', name: 'David Smith', age: 41, complaint: 'Minor laceration', arrivalTime: '09:30 AM', waitTimeMins: 0, status: 'routed', assignedLevel: 'non-urgent' },
];

const mockAlerts: TriageDashboardData['alerts'] = [
  { id: 'A1', type: 'critical_arrival', message: 'Ambulance ETA 2m: Stroke protocol', severity: 'critical', timestamp: new Date().toISOString() },
  { id: 'A2', type: 'wait_time_exceeded', message: '2 patients exceeding target wait time', severity: 'medium', timestamp: new Date(Date.now() - 300000).toISOString() },
];

const mockRoutingOptions: TriageDashboardData['routingOptions'] = [
  { id: 'R1', name: 'ER Resus Bay', capacity: '1/4 beds available', status: 'busy' },
  { id: 'R2', name: 'ER Treatment', capacity: '5/12 beds available', status: 'available' },
  { id: 'R3', name: 'Fast Track / OPD', capacity: 'Wait: 45m', status: 'available' },
];

/* ── API Service ───────────────────────────────────────── */

export const triageApi = {
  getDashboardSummary: async (filters: TriageFilters) => ({
    data: {
      kpis: mockKpis,
      incomingQueue: mockIncomingQueue,
      recentTriaged: mockRecentTriaged,
      alerts: mockAlerts,
      routingOptions: mockRoutingOptions,
    } as TriageDashboardData,
    message: 'Success', status: 200,
  }),
};
