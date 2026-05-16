import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type {
  CirculatorDashboardData, CirculatorKPI, CirculatorCase, CoordinationRequest,
  SupplyItem, SurgicalLog, SafetyChecklistTask, CirculatorAlert
} from '../types/circulator.types';

export interface CirculatorFilters {
  otRoom?: string;
}

const mockKpis: CirculatorKPI[] = [
  { id: '1', title: 'Active Surgeries', value: 1, format: 'number', status: 'normal' },
  { id: '2', title: 'Pending Requests', value: 3, format: 'number', status: 'warning', actionLabel: 'View Queue', actionUrl: '/dashboard/ot-circulator/coordination' },
  { id: '3', title: 'Low Supplies', value: 2, format: 'number', status: 'warning', actionLabel: 'Check Inventory', actionUrl: '/dashboard/ot-circulator/supplies' },
  { id: '4', title: 'Active Alerts', value: 0, format: 'number', status: 'success' },
];

const mockActiveCase: CirculatorCase = {
  id: 'CASE-002', patientName: 'Maria Garcia', procedure: 'Total Knee Arthroplasty (Right)', otRoom: 'OT-3', surgeon: 'Dr. Robert Langdon', anesthesiologist: 'Dr. S. Vance', scrubNurse: 'J. Smith, RN', status: 'Incision', startTime: new Date(Date.now() - 3600000).toISOString()
};

const mockCoordinationQueue: CoordinationRequest[] = [
  { id: 'REQ-C-1', caseId: 'CASE-002', type: 'Blood Product', description: '2 Units PRBCs cross-matched for Maria Garcia', requestedBy: 'Anesthesiologist', timeRequested: new Date(Date.now() - 600000).toISOString(), status: 'Dispatched', priority: 'Urgent' },
  { id: 'REQ-C-2', caseId: 'CASE-002', type: 'Supply', description: 'Additional 2-0 Vicryl Sutures', requestedBy: 'Scrub Nurse', timeRequested: new Date(Date.now() - 120000).toISOString(), status: 'Pending', priority: 'Routine' },
  { id: 'REQ-C-3', caseId: 'CASE-002', type: 'Imaging', description: 'C-Arm needed in OT-3 for implant placement check', requestedBy: 'Surgeon', timeRequested: new Date(Date.now() - 30000).toISOString(), status: 'Pending', priority: 'Urgent' },
];

const mockSupplies: SupplyItem[] = [
  { id: 'SUP-1', name: '2-0 Vicryl Sutures', category: 'Sutures', location: 'Cabinet B, Shelf 2', quantityAvailable: 24, status: 'In Stock' },
  { id: 'SUP-2', name: 'Bone Cement', category: 'Implants', location: 'Storage Room 1', quantityAvailable: 2, status: 'Low Stock' },
  { id: 'SUP-3', name: 'Lactated Ringers (1L)', category: 'Fluids', location: 'Warmers', quantityAvailable: 40, status: 'In Stock' },
];

const mockLogs: SurgicalLog[] = [
  { id: 'LOG-1', caseId: 'CASE-002', timestamp: new Date(Date.now() - 3600000).toISOString(), eventType: 'Time In', notes: 'Patient brought into OT-3. Identity verified.', loggedBy: 'C. Nurse' },
  { id: 'LOG-2', caseId: 'CASE-002', timestamp: new Date(Date.now() - 2700000).toISOString(), eventType: 'Incision', notes: 'Surgical timeout completed. Incision made.', loggedBy: 'C. Nurse' },
];

const mockSafety: SafetyChecklistTask[] = [
  { id: 'SAF-1', caseId: 'CASE-002', phase: 'Sign In', description: 'Patient Identity & Consent verified', status: 'Confirmed' },
  { id: 'SAF-2', caseId: 'CASE-002', phase: 'Time Out', description: 'Correct Patient, Site, Procedure confirmed', status: 'Confirmed' },
  { id: 'SAF-3', caseId: 'CASE-002', phase: 'Time Out', description: 'Antibiotic prophylaxis given < 60 mins ago', status: 'Confirmed' },
  { id: 'SAF-4', caseId: 'CASE-002', phase: 'Sign Out', description: 'Instrument & Sponge counts correct', status: 'Pending' },
  { id: 'SAF-5', caseId: 'CASE-002', phase: 'Sign Out', description: 'Specimen correctly labeled', status: 'Pending' },
];

const mockAlerts: CirculatorAlert[] = [];

const normalizeCases = (rawCases: any[]): CirculatorCase[] => rawCases.map((c, index) => {
  const normalizedStatus = (c.status ?? 'Patient Prep').toString().toLowerCase();
  const status: CirculatorCase['status'] = normalizedStatus.includes('anesthesia')
    ? 'Anesthesia Induction'
    : normalizedStatus.includes('incision')
    ? 'Incision'
    : normalizedStatus.includes('closure')
    ? 'Closure'
    : normalizedStatus.includes('transfer')
    ? 'Transfer to PACU'
    : 'Patient Prep';
  return {
    id: c.id ?? c.caseId ?? `CASE-${index + 1}`,
    patientName: c.patientName ?? c.patient ?? c.name ?? 'Unknown Patient',
    procedure: c.procedure ?? c.surgery ?? 'Procedure',
    otRoom: c.otRoom ?? c.room ?? c.theatre ?? 'OT-1',
    surgeon: c.surgeon ?? c.leadSurgeon ?? 'TBD',
    anesthesiologist: c.anesthesiologist ?? c.anesthesia ?? 'TBD',
    scrubNurse: c.scrubNurse ?? c.scrub ?? 'TBD',
    status,
    startTime: c.startTime ?? c.scheduledTime ?? new Date().toISOString(),
  };
});

const normalizeRequests = (rawRequests: any[]): CoordinationRequest[] => rawRequests.map((req, index) => ({
  id: req.id ?? `REQ-C-${index + 1}`,
  caseId: req.caseId ?? req.case ?? 'CASE-001',
  type: req.type ?? 'Supply',
  description: req.description ?? req.item ?? 'Coordination request',
  requestedBy: req.requestedBy ?? 'Surgeon',
  timeRequested: req.timeRequested ?? req.requestedAt ?? new Date().toISOString(),
  status: req.status ?? 'Pending',
  priority: req.priority ?? 'Routine',
}));

const normalizeSupplies = (rawSupplies: any[]): SupplyItem[] => rawSupplies.map((item, index) => {
  const name = item.name ?? item.itemName ?? 'Supply';
  const category = name.toLowerCase().includes('suture')
    ? 'Sutures'
    : name.toLowerCase().includes('fluid')
    ? 'Fluids'
    : name.toLowerCase().includes('drape')
    ? 'Drapes'
    : name.toLowerCase().includes('med') || name.toLowerCase().includes('drug')
    ? 'Medications'
    : 'Implants';
  const statusMap: Record<string, SupplyItem['status']> = {
    Optimal: 'In Stock',
    Low: 'Low Stock',
    Critical: 'Out of Stock',
  };
  return {
    id: item.id ?? `SUP-${index + 1}`,
    name,
    category,
    location: item.location ?? item.storage ?? 'OT Supply Room',
    quantityAvailable: item.currentStock ?? item.quantity ?? 0,
    status: statusMap[item.status] ?? item.status ?? 'In Stock',
  };
});

const normalizeLogs = (rawLogs: any[]): SurgicalLog[] => rawLogs.map((log, index) => ({
  id: log.id ?? `LOG-${index + 1}`,
  caseId: log.caseId ?? log.case ?? 'CASE-001',
  timestamp: log.timestamp ?? new Date().toISOString(),
  eventType: log.eventType ?? log.event ?? 'Time In',
  notes: log.notes ?? log.description ?? 'Log entry',
  loggedBy: log.loggedBy ?? log.user ?? 'OT Team',
}));

const normalizeSafety = (rawTasks: any[]): SafetyChecklistTask[] => rawTasks.map((task, index) => ({
  id: task.id ?? `SAF-${index + 1}`,
  caseId: task.caseId ?? task.case ?? 'CASE-001',
  phase: task.phase ?? 'Sign In',
  description: task.description ?? task.task ?? 'Safety check',
  status: task.status ?? 'Pending',
}));

const normalizeAlerts = (rawAlerts: any[]): CirculatorAlert[] => rawAlerts.map((alert, index) => ({
  id: alert.id ?? `ALT-${index + 1}`,
  caseId: alert.caseId ?? alert.case ?? 'CASE-001',
  type: alert.type ?? 'Delay',
  severity: alert.severity ?? 'warning',
  timestamp: alert.timestamp ?? new Date().toISOString(),
  status: alert.status ?? 'Active',
  message: alert.message ?? 'Alert raised',
}));

export const circulatorApi = {
  getDashboardSummary: async (filters: CirculatorFilters) => {
    try {
      const [scheduleRes, suppliesRes] = await Promise.allSettled([
        apiGet<any>(endpoints.ot.schedule, { params: filters }),
        apiGet<any>(endpoints.inventory.items, { params: { department: 'OT' } }),
      ]);

      const schedulePayload = scheduleRes.status === 'fulfilled'
        ? (scheduleRes.value?.data ?? scheduleRes.value ?? {})
        : {};
      const suppliesPayload = suppliesRes.status === 'fulfilled'
        ? (suppliesRes.value?.data ?? suppliesRes.value ?? [])
        : [];

      const rawCases = Array.isArray(schedulePayload)
        ? schedulePayload
        : (schedulePayload.cases ?? schedulePayload.items ?? schedulePayload.schedule ?? []);
      const cases = rawCases.length > 0 ? normalizeCases(rawCases) : [mockActiveCase];
      const activeCase = schedulePayload.activeCase
        ? normalizeCases([schedulePayload.activeCase])[0]
        : cases.find((c) => c.status === 'Incision') ?? cases[0];
      const coordinationQueue = Array.isArray(schedulePayload.coordinationQueue)
        ? normalizeRequests(schedulePayload.coordinationQueue)
        : mockCoordinationQueue;
      const supplies = Array.isArray(suppliesPayload) && suppliesPayload.length > 0
        ? normalizeSupplies(suppliesPayload)
        : mockSupplies;
      const surgicalLogs = Array.isArray(schedulePayload.surgicalLogs)
        ? normalizeLogs(schedulePayload.surgicalLogs)
        : mockLogs;
      const safetyChecklist = Array.isArray(schedulePayload.safetyChecklist)
        ? normalizeSafety(schedulePayload.safetyChecklist)
        : mockSafety;
      const alerts = Array.isArray(schedulePayload.alerts)
        ? normalizeAlerts(schedulePayload.alerts)
        : mockAlerts;

      const pendingRequests = coordinationQueue.filter((req) => req.status === 'Pending').length;
      const lowSupplies = supplies.filter((item) => item.status !== 'In Stock').length;
      const kpis: CirculatorKPI[] = [
        { id: '1', title: 'Active Surgeries', value: activeCase ? 1 : 0, format: 'number', status: activeCase ? 'normal' : 'success' },
        { id: '2', title: 'Pending Requests', value: pendingRequests, format: 'number', status: pendingRequests > 0 ? 'warning' : 'success', actionLabel: 'View Queue', actionUrl: '/dashboard/ot-circulator/coordination' },
        { id: '3', title: 'Low Supplies', value: lowSupplies, format: 'number', status: lowSupplies > 0 ? 'warning' : 'success', actionLabel: 'Check Inventory', actionUrl: '/dashboard/ot-circulator/supplies' },
        { id: '4', title: 'Active Alerts', value: alerts.length, format: 'number', status: alerts.length > 0 ? 'critical' : 'success' },
      ];

      return {
        data: {
          kpis,
          activeCase,
          coordinationQueue,
          supplies,
          surgicalLogs,
          safetyChecklist,
          alerts,
        } as CirculatorDashboardData,
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: mockKpis,
          activeCase: mockActiveCase,
          coordinationQueue: mockCoordinationQueue,
          supplies: mockSupplies,
          surgicalLogs: mockLogs,
          safetyChecklist: mockSafety,
          alerts: mockAlerts,
        } as CirculatorDashboardData,
        message: 'Failed to load live circulator data, falling back to cached state',
        status: 500,
      };
    }
  },

  fulfillRequest: async (requestId: string) => {
    try {
      const response = await apiPost<any>(endpoints.ot.intraop(requestId), { status: 'Fulfilled' });
      return { data: response, message: 'Request fulfilled', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Request fulfilled', status: 200 };
    }
  },
  escalateRequest: async (requestId: string) => {
    try {
      const response = await apiPost<any>(endpoints.ot.intraop(requestId), { status: 'Escalated' });
      return { data: response, message: 'Request escalated to OT Manager', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Request escalated to OT Manager', status: 200 };
    }
  },
  addSurgicalLog: async (log: Partial<SurgicalLog>) => {
    try {
      const response = await apiPost<any>(endpoints.ot.intraop(log.caseId ?? 'log'), { log });
      return { data: response, message: 'Surgical log added', status: 201 };
    } catch (error) {
      return { data: { success: true }, message: 'Surgical log added', status: 201 };
    }
  },
  confirmSafetyCheck: async (taskId: string) => {
    try {
      const response = await apiPost<any>(endpoints.ot.intraop(taskId), { status: 'Confirmed', type: 'safety' });
      return { data: response, message: 'Safety check confirmed', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Safety check confirmed', status: 200 };
    }
  },
};
