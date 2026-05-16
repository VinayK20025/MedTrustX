import type { EmergencyCoordinatorData } from '../types/emergency-coord.types';

export interface EcFilters { priority?: string; status?: string; }

const mockData: EmergencyCoordinatorData = {
  kpis: [
    { id: '1', label: 'Incoming Patients', value: 25, subLabel: '+8 en route', status: 'critical' },
    { id: '2', label: 'Waiting Triage', value: 10, subLabel: '3 Red priority', status: 'warning' },
    { id: '3', label: 'Critical Cases', value: 5, subLabel: 'Immediate action', status: 'critical' },
    { id: '4', label: 'Avg Triage Time', value: '28s', subLabel: 'Target: <30s', status: 'success' },
  ],
  patients: [
    { id: 'EC-P001', tag: 'P001', name: 'Unidentified Male', age: 42, priority: 'Red', status: 'Routing', from: 'Ambulance A1', routedTo: 'ICU', chiefComplaint: 'Severe chest trauma, BP dropping', arrivedAt: new Date(Date.now() - 120000).toISOString() },
    { id: 'EC-P002', tag: 'P002', name: 'Female, ~30', age: 30, priority: 'Red', status: 'Triaging', from: 'Ambulance A2', chiefComplaint: 'Head injury, unconscious', eta: 3 },
    { id: 'EC-P003', tag: 'P003', name: 'Rajan Kumar', age: 55, priority: 'Yellow', status: 'Allocated', from: 'Walk-in', routedTo: 'ER Bay 3', chiefComplaint: 'Fractured femur, pain 8/10', arrivedAt: new Date(Date.now() - 300000).toISOString() },
    { id: 'EC-P004', tag: 'P004', name: 'Sunita Devi', age: 28, priority: 'Yellow', status: 'Incoming', from: 'Ambulance A3', chiefComplaint: 'Abdominal trauma', eta: 7 },
    { id: 'EC-P005', tag: 'P005', name: 'Child, ~6', age: 6, priority: 'Red', status: 'Triaging', from: 'Ambulance A1', chiefComplaint: 'Respiratory distress, SpO2 82%', arrivedAt: new Date(Date.now() - 60000).toISOString() },
    { id: 'EC-P006', tag: 'P006', priority: 'Green', status: 'Allocated', from: 'Walk-in', routedTo: 'OPD Fast Track', chiefComplaint: 'Minor laceration, stable', arrivedAt: new Date(Date.now() - 480000).toISOString() },
    { id: 'EC-P007', tag: 'P007', priority: 'Black', status: 'Treated', from: 'Ambulance A2', chiefComplaint: 'No vitals on arrival', arrivedAt: new Date(Date.now() - 900000).toISOString() },
  ],
  ambulances: [
    { id: 'AMB-A1', callSign: 'Alpha-1', status: 'Transporting', patientLoad: 'Critical', etaMinutes: 2, patientCount: 2, currentLocation: 'NH-48, 3km from hospital' },
    { id: 'AMB-A2', callSign: 'Alpha-2', status: 'En Route', patientLoad: 'Critical', etaMinutes: 5, patientCount: 1, currentLocation: 'Highway Overpass' },
    { id: 'AMB-A3', callSign: 'Alpha-3', status: 'En Route', patientLoad: 'Stable', etaMinutes: 9, patientCount: 2, currentLocation: 'City bypass' },
    { id: 'AMB-A4', callSign: 'Alpha-4', status: 'Available', patientLoad: 'Empty', patientCount: 0, currentLocation: 'Base Station' },
  ],
  tasks: [
    { id: 'ECT-01', title: 'Clear ICU Bay 4 for P001 — Chest Trauma', owner: 'Charge Nurse (ICU)', department: 'ICU', status: 'In Progress', priority: 'Immediate' },
    { id: 'ECT-02', title: 'Activate Paediatric Crash Team — P005', owner: 'Dr. Mehta', department: 'Paediatrics', status: 'Pending', priority: 'Immediate' },
    { id: 'ECT-03', title: 'Request 2 Units O- Blood (P001)', owner: 'Blood Bank', department: 'Lab', status: 'In Progress', priority: 'Urgent' },
    { id: 'ECT-04', title: 'Brief OT Team for Ortho Case (P003)', owner: 'OT Coordinator', department: 'OT', status: 'Pending', priority: 'Urgent' },
    { id: 'ECT-05', title: 'Redirect Alpha-3 to West Entrance', owner: 'Ambulance Dispatcher', department: 'Transport', status: 'Done', priority: 'Normal' },
  ],
  resources: [
    { id: 'R-ICU', name: 'ICU Beds', available: 2, total: 30, unit: 'beds', status: 'Critical' },
    { id: 'R-ER', name: 'ER Bays', available: 5, total: 20, unit: 'bays', status: 'Low' },
    { id: 'R-VENT', name: 'Ventilators', available: 1, total: 40, unit: 'units', status: 'Critical' },
    { id: 'R-STAFF', name: 'ER Staff Available', available: 12, total: 30, unit: 'staff', status: 'Low' },
  ],
};

export const emergencyCoordApi = {
  getDashboardSummary: async (f: EcFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  assignTriage: async (patientId: string, priority: string, destination: string) => ({ data: { success: true }, message: `Patient routed to ${destination}`, status: 200 }),
  redirectAmbulance: async (ambId: string, instruction: string) => ({ data: { success: true }, message: 'Ambulance redirected', status: 200 }),
  updateTask: async (taskId: string, status: string) => ({ data: { success: true }, message: 'Task updated', status: 200 }),
  broadcastMessage: async (msg: string) => ({ data: { success: true }, message: 'Broadcast sent', status: 200 }),
  escalateToDisaster: async (reason: string) => ({ data: { success: true }, message: 'Escalated to Disaster Management Officer', status: 200 }),
};
