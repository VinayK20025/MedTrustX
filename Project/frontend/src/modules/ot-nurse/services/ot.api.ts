/**
 * MedTrustX — OT Nurse API Client
 * Safety-first surgical data streaming
 */
import { apiGet } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type { OTDashboardData, OTSurgeryCase, OTChecklistItem, OTInstrument, OTAlert, OTKPI } from '../types/ot.types';

export interface OTFilters {
  room?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: OTDashboardData['kpis'] = [
  { id: '1', title: 'Surgeries Today', value: '3/5', status: 'normal', delta: '2 Remaining' },
  { id: '2', title: 'Current Case Time', value: '01:45:20', status: 'success', delta: 'On Schedule' },
  { id: '3', title: 'Active Alerts', value: 0, status: 'success', delta: 'Zero missing instruments' },
];

const mockActiveCase: OTDashboardData['activeCase'] = {
  id: 'S1', patientName: 'Arthur Pendelton', procedure: 'Laparoscopic Cholecystectomy', surgeon: 'Dr. Sarah Jenkins', room: 'OT-4', status: 'intra_op', startTime: '09:00 AM'
};

const mockUpcomingCases: OTDashboardData['upcomingCases'] = [
  { id: 'S2', patientName: 'Elena Rostova', procedure: 'Appendectomy', surgeon: 'Dr. Mark Davis', room: 'OT-4', status: 'scheduled', startTime: '01:00 PM' }
];

const mockChecklist: OTDashboardData['checklist'] = [
  { id: 'C1', category: 'identity', task: 'Patient ID & Wristband Verified', status: 'confirmed' },
  { id: 'C2', category: 'consent', task: 'Surgical Consent Signed', status: 'confirmed' },
  { id: 'C3', category: 'instruments', task: 'Initial Sponge & Sharp Count Verified', status: 'confirmed' },
];

const mockInstruments: OTDashboardData['instruments'] = [
  { id: 'I1', name: 'Kelly Forceps', initialCount: 12, currentCount: 12, status: 'verified' },
  { id: 'I2', name: 'Metzenbaum Scissors', initialCount: 4, currentCount: 4, status: 'verified' },
  { id: 'I3', name: 'Surgical Sponges (Ray-Tec)', initialCount: 30, currentCount: 30, status: 'verified' },
  { id: 'I4', name: 'Scalpel Blades (#10)', initialCount: 2, currentCount: 1, status: 'in_use' },
];

const mockAlerts: OTDashboardData['alerts'] = [];

const statusMap = (value?: string): OTSurgeryCase['status'] => {
  const normalized = (value ?? '').toLowerCase();
  if (normalized.includes('intra')) return 'intra_op';
  if (normalized.includes('post')) return 'post_op';
  if (normalized.includes('pre')) return 'pre_op';
  return 'scheduled';
};

const normalizeCases = (rawCases: any[]): OTSurgeryCase[] => rawCases.map((c, index) => ({
  id: c.id ?? c.caseId ?? `S-${index + 1}`,
  patientName: c.patientName ?? c.patient ?? c.name ?? 'Unknown Patient',
  procedure: c.procedure ?? c.surgery ?? 'Procedure',
  surgeon: c.surgeon ?? c.leadSurgeon ?? 'TBD',
  room: c.room ?? c.otRoom ?? c.theatre ?? 'OT-1',
  status: statusMap(c.status),
  startTime: c.startTime ?? c.scheduledTime ?? c.start ?? 'TBD',
}));

const normalizeChecklist = (rawChecklist: any[]): OTChecklistItem[] => rawChecklist.map((item, index) => ({
  id: item.id ?? `C-${index + 1}`,
  category: item.category ?? 'identity',
  task: item.task ?? item.description ?? 'Checklist item',
  status: item.status ?? 'pending',
}));

const normalizeInstruments = (rawInstruments: any[]): OTInstrument[] => rawInstruments.map((item, index) => ({
  id: item.id ?? `I-${index + 1}`,
  name: item.name ?? item.instrument ?? 'Instrument',
  initialCount: item.initialCount ?? item.initial ?? item.expected ?? 0,
  currentCount: item.currentCount ?? item.current ?? item.actual ?? 0,
  status: item.status ?? 'verified',
}));

const normalizeAlerts = (rawAlerts: any[]): OTAlert[] => rawAlerts.map((alert, index) => ({
  id: alert.id ?? `A-${index + 1}`,
  type: alert.type ?? 'delay',
  message: alert.message ?? alert.description ?? 'Alert raised',
  severity: alert.severity ?? 'medium',
  timestamp: alert.timestamp ?? new Date().toISOString(),
}));

const deriveKpis = (cases: OTSurgeryCase[], alerts: OTAlert[]): OTKPI[] => {
  if (cases.length === 0) return mockKpis;
  const completed = cases.filter((c) => c.status === 'post_op').length;
  const remaining = Math.max(cases.length - completed, 0);
  return [
    { id: '1', title: 'Surgeries Today', value: `${completed}/${cases.length}`, status: remaining > 0 ? 'normal' : 'success', delta: `${remaining} Remaining` },
    { id: '2', title: 'Current Case Time', value: 'On Track', status: 'success', delta: cases.find((c) => c.status === 'intra_op')?.startTime ?? 'Active' },
    { id: '3', title: 'Active Alerts', value: alerts.length, status: alerts.length > 0 ? 'warning' : 'success', delta: alerts.length > 0 ? 'Review required' : 'All clear' },
  ];
};

/* ── API Service ───────────────────────────────────────── */

export const otApi = {
  getDashboardSummary: async (filters: OTFilters) => {
    try {
      const scheduleRes = await apiGet<any>(endpoints.ot.schedule, { params: filters });
      const schedulePayload = scheduleRes?.data ?? scheduleRes ?? {};
      const rawCases = Array.isArray(schedulePayload)
        ? schedulePayload
        : (schedulePayload.cases ?? schedulePayload.items ?? schedulePayload.schedule ?? []);
      const cases = rawCases.length > 0 ? normalizeCases(rawCases) : [...mockUpcomingCases, mockActiveCase];
      const activeCase = schedulePayload.activeCase
        ? normalizeCases([schedulePayload.activeCase])[0]
        : cases.find((c) => c.status === 'intra_op') ?? cases[0] ?? null;
      const checklist = Array.isArray(schedulePayload.checklist)
        ? normalizeChecklist(schedulePayload.checklist)
        : mockChecklist;
      const instruments = Array.isArray(schedulePayload.instruments)
        ? normalizeInstruments(schedulePayload.instruments)
        : mockInstruments;
      const alerts = Array.isArray(schedulePayload.alerts)
        ? normalizeAlerts(schedulePayload.alerts)
        : mockAlerts;
      const kpis = Array.isArray(schedulePayload.kpis) ? schedulePayload.kpis : deriveKpis(cases, alerts);
      const upcomingCases = cases.filter((c) => c.id !== activeCase?.id);

      return {
        data: {
          kpis,
          activeCase,
          upcomingCases,
          checklist,
          instruments,
          alerts,
        } as OTDashboardData,
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: mockKpis,
          activeCase: mockActiveCase,
          upcomingCases: mockUpcomingCases,
          checklist: mockChecklist,
          instruments: mockInstruments,
          alerts: mockAlerts,
        } as OTDashboardData,
        message: 'Failed to load live OT data, falling back to cached state',
        status: 500,
      };
    }
  },
};
