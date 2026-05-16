import { apiGet, apiPost } from '@/services/api';
import type { BiomedDashboardDataFixed, MedicalEquipment, MaintenanceJob } from '../types/biomed.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockEquipment: MedicalEquipment[] = [
  { id: 'EQ-881', name: 'Ventilator V12', model: 'Puritan Bennett 980', manufacturer: 'Medtronic', serialNumber: 'PB-980-X12', department: 'ICU', status: 'In Use', lastServiceDate: t(45), nextServiceDate: f(15) },
  { id: 'EQ-882', name: 'MRI System', model: 'Magnetom Aera', manufacturer: 'Siemens', serialNumber: 'S-MAG-991', department: 'Radiology', status: 'Maintenance', lastServiceDate: t(90), nextServiceDate: t(-1) },
  { id: 'EQ-883', name: 'Infusion Pump', model: 'Alaris 8015', manufacturer: 'BD', serialNumber: 'BD-AL-552', department: 'Emergency', status: 'Operational', lastServiceDate: t(10), nextServiceDate: f(170) },
];

const mockJobs: MaintenanceJob[] = [
  { id: 'JOB-501', equipmentId: 'EQ-882', equipmentName: 'MRI System', jobType: 'Corrective', priority: 'Urgent', status: 'In Progress', technicianName: 'Alex Mercer', requestDate: t(1) },
  { id: 'JOB-502', equipmentId: 'EQ-104', equipmentName: 'Defibrillator', jobType: 'Calibration', priority: 'Critical', status: 'Open', requestDate: t(0.5) },
];

const mockData: BiomedDashboardDataFixed = {
  metrics: {
    totalEquipmentCount: 1450,
    operationalUptimePercent: 97.4,
    pendingWorkOrdersCount: 24,
    calibrationCompliancePercent: 99.1,
    criticalEquipmentDownCount: 2
  },
  criticalEquipment: mockEquipment,
  activeJobs: mockJobs,
  lowStockParts: [
    { id: 'PRT-01', partName: 'Ventilator Filter', partNumber: 'PB-FIL-09', stockLevel: 4, minStockLevel: 10, unit: 'pcs' },
    { id: 'PRT-02', partName: 'MRI Cooling Fluid', partNumber: 'C-FL-SI', stockLevel: 2, minStockLevel: 5, unit: 'L' }
  ]
};

export const biomedApi = {
  getDashboardData: async (): Promise<{ data: BiomedDashboardDataFixed; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: BiomedDashboardDataFixed }>('/api/v1/biomed/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateJobStatus: async (jobId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/biomed/jobs/${jobId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Job updated (Mock)', status: 200 };
    }
  }
};
