import type { SurveillanceDashboardData } from '../types/cctv.types';

export interface CctvFilters { zone?: string; status?: string; }

const mockData: SurveillanceDashboardData = {
  kpis: [
    { id: '1', label: 'Active Alerts', value: 3, status: 'critical' },
    { id: '2', label: 'Cameras Online', value: 18, status: 'success' },
    { id: '3', label: 'Offline Cameras', value: 2, status: 'warning' },
    { id: '4', label: 'Incidents Today', value: 7, status: 'normal' },
  ],
  cameras: [
    { id: 'CAM-01', name: 'ICU Entrance', zone: 'ICU', status: 'Alert', resolution: '4K', gradientClass: 'from-red-950 to-red-900' },
    { id: 'CAM-02', name: 'OT Corridor', zone: 'OT', status: 'Online', resolution: '1080p', gradientClass: 'from-slate-900 to-slate-800' },
    { id: 'CAM-03', name: 'ER Triage Bay', zone: 'ER', status: 'Alert', resolution: '4K', gradientClass: 'from-orange-950 to-orange-900' },
    { id: 'CAM-04', name: 'Main Gate A', zone: 'Main Gate', status: 'Online', resolution: '4K', gradientClass: 'from-zinc-900 to-zinc-800' },
    { id: 'CAM-05', name: 'Pharmacy Vault', zone: 'Pharmacy', status: 'Offline', resolution: '1080p', gradientClass: 'from-black to-gray-900' },
    { id: 'CAM-06', name: 'Server Room', zone: 'IT', status: 'Online', resolution: '1080p', gradientClass: 'from-blue-950 to-blue-900' },
    { id: 'CAM-07', name: 'OPD Waiting', zone: 'OPD', status: 'Online', resolution: '1080p', gradientClass: 'from-gray-900 to-gray-800' },
    { id: 'CAM-08', name: 'Parking Lot', zone: 'Exterior', status: 'Online', resolution: '720p', gradientClass: 'from-stone-900 to-stone-800' },
    { id: 'CAM-09', name: 'Blood Bank', zone: 'Lab', status: 'Online', resolution: '1080p', gradientClass: 'from-neutral-900 to-neutral-800' },
    { id: 'CAM-10', name: 'ICU Monitor B', zone: 'ICU', status: 'Online', resolution: '4K', gradientClass: 'from-slate-950 to-slate-900' },
    { id: 'CAM-11', name: 'Roof Access', zone: 'Exterior', status: 'Offline', resolution: '720p', gradientClass: 'from-black to-gray-900' },
    { id: 'CAM-12', name: 'Staircase Wing C', zone: 'Internal', status: 'Online', resolution: '1080p', gradientClass: 'from-gray-800 to-gray-900' },
  ],
  alerts: [
    { id: 'ALT-501', cameraId: 'CAM-01', cameraName: 'ICU Entrance', zone: 'ICU', type: 'Unauthorized Access', severity: 'High', detectedAt: new Date(Date.now() - 300000).toISOString(), status: 'Active', description: 'Unidentified individual attempted forced entry at ICU biometric door.' },
    { id: 'ALT-502', cameraId: 'CAM-03', cameraName: 'ER Triage Bay', zone: 'ER', type: 'Crowd Density', severity: 'Medium', detectedAt: new Date(Date.now() - 900000).toISOString(), status: 'Acknowledged', description: 'ER triage crowd density exceeded safe threshold. Multiple individuals queued beyond barrier.' },
    { id: 'ALT-503', cameraId: 'CAM-05', cameraName: 'Pharmacy Vault', zone: 'Pharmacy', type: 'Offline Camera', severity: 'High', detectedAt: new Date(Date.now() - 1800000).toISOString(), status: 'Active', description: 'Camera offline — surveillance blind spot in pharmaceutical storage zone.' },
  ],
};

export const cctvApi = {
  getDashboardSummary: async (filters: CctvFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
  dispatchGuard: async (alertId: string) => ({ data: { success: true }, message: 'Guard dispatched to camera zone', status: 200 }),
  tagIncident: async (cameraId: string, type: string, description: string) => ({ data: { success: true }, message: 'Incident tagged and logged', status: 200 }),
  escalateAlert: async (alertId: string) => ({ data: { success: true }, message: 'Escalated to Security Manager', status: 200 }),
};
