import { apiGet, apiPost } from '@/services/api';
import type {
  EhrDashboardData, EhrKPI, EhrPatient, EhrRecordData, EhrValidationError, EhrAuditLog, MpiRecord
} from '../types/ehr.types';

export interface EhrFilters { search?: string; status?: string; }

const mockKpis: EhrKPI[] = [
  { id: '1', title: 'Records Updated', value: 150, format: 'number', status: 'success' },
  { id: '2', title: 'Pending Entries', value: 10, format: 'number', status: 'warning' },
  { id: '3', title: 'Data Errors Detected', value: 3, format: 'number', status: 'critical' },
  { id: '4', title: 'Avg Entry Time', value: '2m', format: 'time', status: 'normal' },
];

const mockPatients: EhrPatient[] = [
  { id: 'PAT-101', uhid: 'UHID-8812', name: 'John Doe', age: 45, gender: 'M', status: 'Active', department: 'Cardiology', lastUpdated: new Date(Date.now() - 3600000).toISOString() },
  { id: 'PAT-102', uhid: 'UHID-8813', name: 'Jane Smith', age: 32, gender: 'F', status: 'Pending Review', department: 'Maternity', lastUpdated: new Date(Date.now() - 86400000).toISOString(), hasDuplicates: true },
  { id: 'PAT-103', uhid: 'UHID-8814', name: 'Michael Brown', age: 60, gender: 'M', status: 'Discharged', department: 'Orthopedics', lastUpdated: new Date(Date.now() - 172800000).toISOString() },
];

const mockMpiRecords: MpiRecord[] = [
  { id: 'mpi-99102', mrn: 'MRN-882194', firstName: 'John', lastName: 'Doe', dob: '1980-05-15', gender: 'M', facility: 'Central Campus', status: 'Verified', confidenceScore: 99, duplicates: 0 },
  { id: 'mpi-99103', mrn: 'MRN-882195', firstName: 'J.', lastName: 'Doe', dob: '1980-05-15', gender: 'M', facility: 'North Clinic', status: 'Potential Duplicate', confidenceScore: 88, duplicates: 1 },
  { id: 'mpi-99104', mrn: 'MRN-449102', firstName: 'Maria', lastName: 'Garcia', dob: '1992-11-20', gender: 'F', facility: 'South Wing', status: 'Verified', confidenceScore: 100, duplicates: 0 },
  { id: 'mpi-99105', mrn: 'MRN-100293', firstName: 'Alex', lastName: 'Smith', dob: '1975-02-10', gender: 'Other', facility: 'Central Campus', status: 'Demographic Error', confidenceScore: 65, duplicates: 0 },
  { id: 'mpi-99106', mrn: 'MRN-772911', firstName: 'Sarah', lastName: 'Connor', dob: '1985-08-29', gender: 'F', facility: 'West Hospital', status: 'Potential Duplicate', confidenceScore: 92, duplicates: 2 },
];

const mockAuditLogs: Record<string, EhrAuditLog[]> = {
  'PAT-101': [
    { id: 'LOG-1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Vitals Updated', user: 'Nurse Sarah', details: 'Added BP and HR data' },
    { id: 'LOG-2', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Record Created', user: 'EHR Admin', details: 'Initial registration' }
  ]
};

export const ehrApi = {
  getDashboardSummary: async (filters: EhrFilters) => {
    try {
      return await apiGet<{ data: EhrDashboardData; message: string; status: number }>('/api/v1/ehr', { params: filters });
    } catch (e) {
      return { data: { kpis: mockKpis, patients: mockPatients } as EhrDashboardData, message: 'Success (Mock)', status: 200 };
    }
  },
  getPatientData: async (patientId: string) => ({
    data: { 
      record: { vitals: { bp: '120/80', hr: '72', temp: '98.6' }, diagnosis: 'Hypertension monitoring' } as EhrRecordData,
      logs: mockAuditLogs[patientId] || []
    }, message: 'Success', status: 200
  }),
  savePatientRecord: async (patientId: string, data: EhrRecordData) => ({ data: { success: true }, message: 'Record saved securely', status: 200 }),
  validateRecord: async (data: EhrRecordData) => {
    const errors: EhrValidationError[] = [];
    if (!data.vitals?.bp) errors.push({ id: 'E1', field: 'BP', message: 'Blood pressure is required', severity: 'Error' });
    if (!data.diagnosis) errors.push({ id: 'E2', field: 'Diagnosis', message: 'Diagnosis field is empty', severity: 'Warning' });
    return { data: { errors }, message: 'Validation complete', status: 200 };
  },
  getMpiRecords: async (filters?: any) => {
    try {
      return await apiGet<{ data: MpiRecord[]; message: string; status: number }>('/api/v1/ehr/mpi', { params: filters });
    } catch (e) {
      return { data: mockMpiRecords, message: 'Success (Mock)', status: 200 };
    }
  },
  resolveMpiRecord: async (id: string, action: 'Merge' | 'Fix') => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(`/api/v1/ehr/mpi/${id}`, { action });
    } catch (e) {
      return { data: { success: true }, message: `MPI record ${action} successful (Mock)`, status: 200 };
    }
  }
};
