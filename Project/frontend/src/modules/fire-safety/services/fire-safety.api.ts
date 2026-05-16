import type { FireSafetyDashboardData } from '../types/fire-safety.types';

export interface FireSafetyFilters { zone?: string; status?: string; }

const mockData: FireSafetyDashboardData = {
  kpis: [
    { id: '1', label: 'Active Fire Alerts', value: 1, status: 'critical' },
    { id: '2', label: 'Equipment Faults', value: 2, status: 'warning' },
    { id: '3', label: 'Compliance Score', value: '84%', status: 'warning' },
    { id: '4', label: 'Last Drill', value: '3 days ago', status: 'normal' },
  ],
  zones: [
    { id: 'FZ-ICU', name: 'ICU', floor: '2nd Floor', status: 'Fire Alert', lastCheckedAt: new Date(Date.now() - 60000).toISOString(), detectorCount: 8 },
    { id: 'FZ-OT', name: 'Operation Theatre', floor: '3rd Floor', status: 'Safe', lastCheckedAt: new Date(Date.now() - 120000).toISOString(), detectorCount: 6 },
    { id: 'FZ-WARD', name: 'Ward A', floor: '1st Floor', status: 'Smoke Detected', lastCheckedAt: new Date(Date.now() - 180000).toISOString(), detectorCount: 12 },
    { id: 'FZ-ER', name: 'Emergency', floor: 'Ground', status: 'Safe', lastCheckedAt: new Date(Date.now() - 90000).toISOString(), detectorCount: 10 },
    { id: 'FZ-PHAR', name: 'Pharmacy', floor: 'Ground', status: 'Safe', lastCheckedAt: new Date(Date.now() - 240000).toISOString(), detectorCount: 4 },
    { id: 'FZ-GEN', name: 'Generator Room', floor: 'Basement', status: 'Evacuating', lastCheckedAt: new Date(Date.now() - 300000).toISOString(), detectorCount: 5 },
    { id: 'FZ-KIT', name: 'Hospital Kitchen', floor: 'Ground', status: 'Safe', lastCheckedAt: new Date(Date.now() - 360000).toISOString(), detectorCount: 6 },
    { id: 'FZ-SERV', name: 'Server Room', floor: 'Basement', status: 'Safe', lastCheckedAt: new Date(Date.now() - 420000).toISOString(), detectorCount: 4 },
  ],
  equipment: [
    { id: 'EQ-001', type: 'Sprinkler', location: 'ICU Ceiling Grid', zone: 'ICU', status: 'Fault', lastInspectedAt: new Date(Date.now() - 86400000 * 30).toISOString(), nextDueAt: new Date(Date.now() + 86400000 * 15).toISOString() },
    { id: 'EQ-002', type: 'Extinguisher', location: 'ICU Corridor', zone: 'ICU', status: 'OK', lastInspectedAt: new Date(Date.now() - 86400000 * 10).toISOString(), nextDueAt: new Date(Date.now() + 86400000 * 80).toISOString() },
    { id: 'EQ-003', type: 'Smoke Detector', location: 'Ward A Bay 3', zone: 'Ward A', status: 'OK', lastInspectedAt: new Date(Date.now() - 86400000 * 5).toISOString(), nextDueAt: new Date(Date.now() + 86400000 * 90).toISOString() },
    { id: 'EQ-004', type: 'Emergency Exit', location: 'OT Stairwell', zone: 'OT', status: 'OK', lastInspectedAt: new Date(Date.now() - 86400000 * 2).toISOString(), nextDueAt: new Date(Date.now() + 86400000 * 28).toISOString() },
    { id: 'EQ-005', type: 'Extinguisher', location: 'Generator Room', zone: 'Generator Room', status: 'Expired', lastInspectedAt: new Date(Date.now() - 86400000 * 95).toISOString(), nextDueAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  ],
  incidents: [
    {
      id: 'FI-301', type: 'Fire', zone: 'ICU', severity: 'Critical', status: 'Responding',
      detectedAt: new Date(Date.now() - 420000).toISOString(),
      description: 'Fire alarm triggered in ICU electrical panel. Possible short circuit. Sprinkler system showing fault.',
      responseSteps: [
        { step: 1, label: 'Confirm alarm via CCTV', done: true },
        { step: 2, label: 'Activate suppression / manual hose reel', done: true },
        { step: 3, label: 'Initiate ICU patient evacuation', done: false },
        { step: 4, label: 'Notify Fire Department (101)', done: false },
        { step: 5, label: 'Isolate electrical panel', done: false },
      ],
    },
    {
      id: 'FI-302', type: 'Smoke', zone: 'Ward A', severity: 'High', status: 'Detected',
      detectedAt: new Date(Date.now() - 120000).toISOString(),
      description: 'Smoke detector triggered in Ward A Bay 3. Source under investigation.',
      responseSteps: [
        { step: 1, label: 'Confirm via detector sensor data', done: false },
        { step: 2, label: 'Send staff to investigate', done: false },
        { step: 3, label: 'Prepare for controlled evacuation', done: false },
      ],
    },
  ],
  compliance: [
    { id: 'C-01', area: 'ICU', type: 'Inspection', status: 'Overdue', dueDate: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'C-02', area: 'All Floors', type: 'Drill', status: 'Pending', dueDate: new Date(Date.now() + 86400000 * 7).toISOString() },
    { id: 'C-03', area: 'Pharmacy', type: 'Audit', status: 'Passed', dueDate: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 'C-04', area: 'Generator Room', type: 'Inspection', status: 'Failed', dueDate: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
};

export const fireSafetyApi = {
  getDashboardSummary: async (f: FireSafetyFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  triggerAlarm: async (zoneId: string) => ({ data: { success: true }, message: 'Alarm triggered. All safety teams notified.', status: 200 }),
  evacuateZone: async (zoneId: string) => ({ data: { success: true }, message: 'Evacuation protocol activated.', status: 200 }),
  notifyFireDept: async (incidentId: string) => ({ data: { success: true }, message: 'Fire Department notified. ETA 6 minutes.', status: 200 }),
  completeResponseStep: async (incidentId: string, step: number) => ({ data: { success: true }, message: 'Step completed.', status: 200 }),
  raiseEquipmentFault: async (eqId: string) => ({ data: { success: true }, message: 'Maintenance work order raised.', status: 200 }),
};
