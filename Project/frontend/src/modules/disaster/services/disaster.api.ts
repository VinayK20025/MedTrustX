import type { DisasterDashboardData, ActiveIncident } from '../types/disaster.types';

export interface DisasterFilters { phase?: string; }

const mockActiveIncident: ActiveIncident = {
  id: 'INC-MASS-001',
  title: 'Mass Casualty Event — Highway Collision',
  type: 'Mass Casualty',
  code: 'Code Black',
  severity: 'Critical',
  phase: 'Response',
  activatedAt: new Date(Date.now() - 1800000).toISOString(),
  commander: 'Dr. Verma (Disaster Management Officer)',
  affectedZones: ['ER', 'ICU', 'OT', 'OPD'],
  patientCount: 47,
  description: 'Major highway collision involving multiple vehicles. 47 casualties reported. ER at full capacity. ICU surge protocol activated.',
};

const mockData: DisasterDashboardData = {
  kpis: [
    { id: '1', label: 'Incoming Patients', value: 47, subLabel: '+12 en route', status: 'critical' },
    { id: '2', label: 'ICU Beds Free', value: 3, subLabel: 'of 30 total', status: 'critical' },
    { id: '3', label: 'Staff Deployed', value: '68%', subLabel: '40 on-call alerted', status: 'warning' },
    { id: '4', label: 'Active Alerts', value: 12, subLabel: '3 critical', status: 'warning' },
  ],
  activeIncident: mockActiveIncident,
  zoneStates: [
    { id: 'Z-ICU', zone: 'ICU', status: 'Full', occupancyPercent: 100, availableBeds: 0 },
    { id: 'Z-ER', zone: 'Emergency', status: 'Overload', occupancyPercent: 135, availableBeds: -7 },
    { id: 'Z-OT', zone: 'Operation Theatre', status: 'Full', occupancyPercent: 100, availableBeds: 0 },
    { id: 'Z-OPD', zone: 'OPD', status: 'Closed', occupancyPercent: 0, availableBeds: 0 },
    { id: 'Z-W1', zone: 'Ward A', status: 'Overload', occupancyPercent: 90, availableBeds: 4 },
    { id: 'Z-W2', zone: 'Ward B', status: 'Available', occupancyPercent: 55, availableBeds: 22 },
    { id: 'Z-MAT', zone: 'Maternity', status: 'Available', occupancyPercent: 40, availableBeds: 15 },
    { id: 'Z-PED', zone: 'Paediatrics', status: 'Available', occupancyPercent: 35, availableBeds: 18 },
  ],
  resources: [
    { id: 'R-BEDS', name: 'General Beds', available: 59, total: 200, unit: 'beds', status: 'Low' },
    { id: 'R-VENT', name: 'Ventilators', available: 5, total: 40, unit: 'units', status: 'Critical' },
    { id: 'R-BLOOD', name: 'Blood Units (O-)', available: 8, total: 50, unit: 'units', status: 'Critical' },
    { id: 'R-SURG', name: 'Surgical Kits', available: 12, total: 30, unit: 'kits', status: 'Low' },
    { id: 'R-AMB', name: 'Ambulances', available: 3, total: 8, unit: 'vehicles', status: 'Low' },
  ],
  tasks: [
    { id: 'T-01', title: 'Activate Triage Team — ER Bay', team: 'Clinical', status: 'Done', priority: 'Immediate' },
    { id: 'T-02', title: 'ICU Surge Expansion — Ward B Conversion', team: 'Operations', status: 'Active', priority: 'Immediate' },
    { id: 'T-03', title: 'Request Blood Units from Blood Bank Network', team: 'Logistics', status: 'Active', priority: 'Urgent' },
    { id: 'T-04', title: 'Notify On-Call Surgeons (6 required)', team: 'HR / Scheduling', status: 'Done', priority: 'Immediate' },
    { id: 'T-05', title: 'Coordinate with Police — Patient ID', team: 'Admin', status: 'Pending', priority: 'Urgent' },
    { id: 'T-06', title: 'Media Blackout & Family Communication Zone', team: 'Admin', status: 'Pending', priority: 'Normal' },
  ],
};

export const disasterApi = {
  getDashboardSummary: async (filters: DisasterFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  activateProtocol: async (code: string) => ({ data: { success: true }, message: `${code} activated — all teams notified`, status: 200 }),
  broadcastAlert: async (message: string, channels: string[]) => ({ data: { success: true }, message: 'Alert broadcast to all channels', status: 200 }),
  updateTaskStatus: async (taskId: string, status: string) => ({ data: { success: true }, message: 'Task updated', status: 200 }),
  reallocateResource: async (resourceId: string, qty: number) => ({ data: { success: true }, message: 'Reallocation request sent', status: 200 }),
  escalateIncident: async (incidentId: string) => ({ data: { success: true }, message: 'Incident escalated to Board & External Agencies', status: 200 }),
  closeIncident: async (incidentId: string) => ({ data: { success: true }, message: 'Incident closed — recovery phase begun', status: 200 }),
};
