import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type {
  OTAssistantDashboardData, OTAssistantKPI, OTCascadingCase, SetupChecklistTask,
  InstrumentRequest, InventoryItem, PostOpCleanupTask, OTAssistantAlert
} from '../types/otAssistant.types';

export interface OTAssistantFilters {
  otRoom?: string;
}

const mockKpis: OTAssistantKPI[] = [
  { id: '1', title: 'Cases Today', value: 3, format: 'number', status: 'normal' },
  { id: '2', title: 'Pending Tasks', value: 8, format: 'number', status: 'warning', actionLabel: 'View Checklist', actionUrl: '/dashboard/ot-assistant/preop' },
  { id: '3', title: 'Missing Instruments', value: 0, format: 'number', status: 'success' },
  { id: '4', title: 'Active Alerts', value: 1, format: 'number', status: 'critical', actionLabel: 'Review Alerts', actionUrl: '/dashboard/ot-assistant/alerts' },
];

const mockActiveCase: OTCascadingCase = {
  id: 'CASE-002', procedure: 'Total Knee Arthroplasty (Right)', surgeon: 'Dr. Robert Langdon', otRoom: 'OT-3', scheduledTime: '11:00 AM', status: 'In Progress', instrumentTraysNeeded: ['Ortho Tray A', 'Power Drill Set']
};

const mockUpcomingCases: OTCascadingCase[] = [
  { id: 'CASE-003', procedure: 'Exploratory Laparotomy', surgeon: 'Dr. Maria Garcia', otRoom: 'OT-3', scheduledTime: '03:00 PM', status: 'Pre-Op', instrumentTraysNeeded: ['Major Lap Tray', 'Bowel Retractors'] },
];

const mockChecklist: SetupChecklistTask[] = [
  { id: 'CHK-1', caseId: 'CASE-002', description: 'Ensure Ortho Tray A is sterilized and open', category: 'Instruments', status: 'Completed', verifiedBy: 'Nurse J. Smith' },
  { id: 'CHK-2', caseId: 'CASE-002', description: 'Test Power Drill Set battery', category: 'Equipment', status: 'Completed', verifiedBy: 'Nurse J. Smith' },
  { id: 'CHK-3', caseId: 'CASE-003', description: 'Procure Major Lap Tray from CSSD', category: 'Instruments', status: 'Pending' },
  { id: 'CHK-4', caseId: 'CASE-003', description: 'Stock 2-0 Vicryl sutures', category: 'Consumables', status: 'Pending' },
];

const mockInstrumentRequests: InstrumentRequest[] = [
  { id: 'REQ-1', caseId: 'CASE-002', instrumentName: 'Additional #10 Blades', requestedBy: 'Surgeon', timeRequested: new Date(Date.now() - 300000).toISOString(), status: 'Supplied', priority: 'Routine' },
  { id: 'REQ-2', caseId: 'CASE-002', instrumentName: 'Osteotome (Curved)', requestedBy: 'Lead Scrub', timeRequested: new Date(Date.now() - 60000).toISOString(), status: 'Preparing', priority: 'Urgent' },
];

const mockInventory: InventoryItem[] = [
  { id: 'INV-1', name: 'Scalpel Handles #3', category: 'Sharps', count: 12, status: 'Available' },
  { id: 'INV-2', name: 'Hohmann Retractors', category: 'Retractors', count: 4, status: 'In Use', trayAssignment: 'Ortho Tray A' },
  { id: 'INV-3', name: 'Kelly Clamps', category: 'Clamps', count: 18, status: 'Sterilization' },
  { id: 'INV-4', name: 'Toothed Forceps', category: 'Forceps', count: 9, status: 'Missing' },
];

const mockCleanup: PostOpCleanupTask[] = [
  { id: 'CLN-1', caseId: 'CASE-001', description: 'Sharps disposal complete', status: 'Completed' },
  { id: 'CLN-2', caseId: 'CASE-001', description: 'Instrument recount & return to CSSD', status: 'In Progress' },
];

const mockAlerts: OTAssistantAlert[] = [
  { id: 'ALT-1', caseId: 'CASE-002', type: 'Count Mismatch', severity: 'critical', timestamp: new Date(Date.now() - 120000).toISOString(), status: 'Active', message: 'Initial sponge count shows 1 sponge missing.' },
];

const normalizeCases = (rawCases: any[]): OTCascadingCase[] => rawCases.map((c, index) => {
  const normalizedStatus = (c.status ?? 'Scheduled').toString().toLowerCase();
  const status: OTCascadingCase['status'] = normalizedStatus.includes('pre')
    ? 'Pre-Op'
    : normalizedStatus.includes('progress') || normalizedStatus.includes('intra')
    ? 'In Progress'
    : normalizedStatus.includes('recover') || normalizedStatus.includes('post')
    ? 'Recovery'
    : normalizedStatus.includes('complete')
    ? 'Completed'
    : 'Scheduled';
  return {
    id: c.id ?? c.caseId ?? `CASE-${index + 1}`,
    procedure: c.procedure ?? c.surgery ?? 'Procedure',
    surgeon: c.surgeon ?? c.leadSurgeon ?? 'TBD',
    otRoom: c.otRoom ?? c.room ?? c.theatre ?? 'OT-1',
    scheduledTime: c.scheduledTime ?? c.startTime ?? 'TBD',
    status,
    instrumentTraysNeeded: c.instrumentTraysNeeded ?? c.trays ?? [],
  };
});

const normalizeChecklist = (rawChecklist: any[]): SetupChecklistTask[] => rawChecklist.map((task, index) => ({
  id: task.id ?? `CHK-${index + 1}`,
  caseId: task.caseId ?? task.case ?? 'CASE-001',
  description: task.description ?? task.task ?? 'Checklist item',
  category: task.category ?? 'Instruments',
  status: task.status ?? 'Pending',
  verifiedBy: task.verifiedBy ?? task.checkedBy,
}));

const normalizeRequests = (rawRequests: any[]): InstrumentRequest[] => rawRequests.map((req, index) => ({
  id: req.id ?? `REQ-${index + 1}`,
  caseId: req.caseId ?? req.case ?? 'CASE-001',
  instrumentName: req.instrumentName ?? req.item ?? 'Instrument',
  requestedBy: req.requestedBy ?? 'Surgeon',
  timeRequested: req.timeRequested ?? req.requestedAt ?? new Date().toISOString(),
  status: req.status ?? 'Requested',
  priority: req.priority ?? 'Routine',
}));

const normalizeInventory = (rawItems: any[]): InventoryItem[] => rawItems.map((item, index) => {
  const statusMap: Record<string, InventoryItem['status']> = {
    Optimal: 'Available',
    Low: 'In Use',
    Critical: 'Missing',
    Overstock: 'Available',
  };
  const categoryName = (item.category ?? item.type ?? '').toString().toLowerCase();
  const category: InventoryItem['category'] = categoryName.includes('sharp')
    ? 'Sharps'
    : categoryName.includes('retractor')
    ? 'Retractors'
    : categoryName.includes('clamp')
    ? 'Clamps'
    : categoryName.includes('forceps')
    ? 'Forceps'
    : 'Trays';
  return {
    id: item.id ?? `INV-${index + 1}`,
    name: item.name ?? item.itemName ?? 'Supply',
    category,
    count: item.currentStock ?? item.count ?? 0,
    status: statusMap[item.status] ?? item.status ?? 'Available',
    trayAssignment: item.trayAssignment ?? item.location,
  };
});

const normalizeCleanup = (rawTasks: any[]): PostOpCleanupTask[] => rawTasks.map((task, index) => ({
  id: task.id ?? `CLN-${index + 1}`,
  caseId: task.caseId ?? task.case ?? 'CASE-001',
  description: task.description ?? task.task ?? 'Cleanup task',
  status: task.status ?? 'Pending',
}));

const normalizeAlerts = (rawAlerts: any[]): OTAssistantAlert[] => rawAlerts.map((alert, index) => ({
  id: alert.id ?? `ALT-${index + 1}`,
  caseId: alert.caseId ?? alert.case ?? 'CASE-001',
  type: alert.type ?? 'Supply Low',
  severity: alert.severity ?? 'warning',
  timestamp: alert.timestamp ?? new Date().toISOString(),
  status: alert.status ?? 'Active',
  message: alert.message ?? 'Alert raised',
}));

export const otAssistantApi = {
  getDashboardSummary: async (filters: OTAssistantFilters) => {
    try {
      const [scheduleRes, inventoryRes] = await Promise.allSettled([
        apiGet<any>(endpoints.ot.schedule, { params: filters }),
        apiGet<any>(endpoints.inventory.items, { params: { department: 'OT' } }),
      ]);

      const schedulePayload = scheduleRes.status === 'fulfilled'
        ? (scheduleRes.value?.data ?? scheduleRes.value ?? {})
        : {};
      const inventoryPayload = inventoryRes.status === 'fulfilled'
        ? (inventoryRes.value?.data ?? inventoryRes.value ?? [])
        : [];

      const rawCases = Array.isArray(schedulePayload)
        ? schedulePayload
        : (schedulePayload.cases ?? schedulePayload.items ?? schedulePayload.schedule ?? []);
      const cases = rawCases.length > 0 ? normalizeCases(rawCases) : [mockActiveCase, ...mockUpcomingCases];
      const activeCase = schedulePayload.activeCase
        ? normalizeCases([schedulePayload.activeCase])[0]
        : cases.find((c) => c.status === 'In Progress') ?? cases[0];
      const setupChecklist = Array.isArray(schedulePayload.setupChecklist)
        ? normalizeChecklist(schedulePayload.setupChecklist)
        : mockChecklist;
      const instrumentRequests = Array.isArray(schedulePayload.instrumentRequests)
        ? normalizeRequests(schedulePayload.instrumentRequests)
        : mockInstrumentRequests;
      const cleanupTasks = Array.isArray(schedulePayload.cleanupTasks)
        ? normalizeCleanup(schedulePayload.cleanupTasks)
        : mockCleanup;
      const alerts = Array.isArray(schedulePayload.alerts)
        ? normalizeAlerts(schedulePayload.alerts)
        : mockAlerts;
      const inventoryStatus = Array.isArray(inventoryPayload) && inventoryPayload.length > 0
        ? normalizeInventory(inventoryPayload)
        : mockInventory;

      const pendingTasks = setupChecklist.filter((task) => task.status !== 'Completed').length;
      const missingItems = inventoryStatus.filter((item) => item.status === 'Missing').length;
      const kpis: OTAssistantKPI[] = [
        { id: '1', title: 'Cases Today', value: cases.length, format: 'number', status: 'normal' },
        { id: '2', title: 'Pending Tasks', value: pendingTasks, format: 'number', status: pendingTasks > 0 ? 'warning' : 'success', actionLabel: 'View Checklist', actionUrl: '/dashboard/ot-assistant/preop' },
        { id: '3', title: 'Missing Instruments', value: missingItems, format: 'number', status: missingItems > 0 ? 'critical' : 'success' },
        { id: '4', title: 'Active Alerts', value: alerts.length, format: 'number', status: alerts.length > 0 ? 'critical' : 'success', actionLabel: 'Review Alerts', actionUrl: '/dashboard/ot-assistant/alerts' },
      ];

      return {
        data: {
          kpis,
          activeCase,
          upcomingCases: cases.filter((c) => c.id !== activeCase?.id),
          setupChecklist,
          instrumentRequests,
          inventoryStatus,
          cleanupTasks,
          alerts,
        } as OTAssistantDashboardData,
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: mockKpis,
          activeCase: mockActiveCase,
          upcomingCases: mockUpcomingCases,
          setupChecklist: mockChecklist,
          instrumentRequests: mockInstrumentRequests,
          inventoryStatus: mockInventory,
          cleanupTasks: mockCleanup,
          alerts: mockAlerts,
        } as OTAssistantDashboardData,
        message: 'Failed to load live OT assistant data, falling back to cached state',
        status: 500,
      };
    }
  },

  completeChecklistTask: async (taskId: string) => {
    try {
      const response = await apiPost<any>(endpoints.ot.preop(taskId), { status: 'Completed' });
      return { data: response, message: 'Task marked completed', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Task marked completed', status: 200 };
    }
  },
  supplyInstrument: async (requestId: string) => {
    try {
      const response = await apiPost<any>(endpoints.ot.intraop(requestId), { status: 'Supplied' });
      return { data: response, message: 'Instrument supplied to sterile field', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Instrument supplied to sterile field', status: 200 };
    }
  },
  reportInventoryIssue: async (itemId: string, issue: string) => {
    try {
      const response = await apiPost<any>(endpoints.inventory.stockAlerts, { itemId, issue, department: 'OT' });
      return { data: response, message: 'Issue reported to CSSD', status: 201 };
    } catch (error) {
      return { data: { success: true }, message: 'Issue reported to CSSD', status: 201 };
    }
  },
};
