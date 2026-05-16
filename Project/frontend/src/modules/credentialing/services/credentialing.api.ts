import { apiGet, apiPost } from '@/services/api';
import type { CredentialingDashboardData, MedicalStaffMember } from '../types/credentialing.types';

const t = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockStaff: MedicalStaffMember[] = [
  { 
    id: 'MS-102', 
    name: 'Dr. Sarah Chen', 
    specialty: 'Internal Medicine', 
    npi: '1982736450', 
    status: 'Credentialed', 
    credentials: [
      { id: 'C-01', type: 'State License', number: 'ML-88231', issuer: 'Medical Board of California', issueDate: '2020-01-15', expiryDate: t(400), status: 'Active', lastVerified: t(-10), verificationMethod: 'Primary Source' },
      { id: 'C-02', type: 'DEA Registration', number: 'BC1234567', issuer: 'DEA', issueDate: '2022-05-20', expiryDate: t(15), status: 'Active', lastVerified: t(-10), verificationMethod: 'Primary Source' }
    ],
    privileges: ['Admit Patients', 'Prescribe Scheduled Drugs', 'Endoscopy'],
    recredentialingDate: t(730)
  },
  { 
    id: 'MS-205', 
    name: 'Dr. James Okafor', 
    specialty: 'Orthopedic Surgery', 
    npi: '1029384756', 
    status: 'Provisional', 
    credentials: [
      { id: 'C-03', type: 'State License', number: 'ML-99100', issuer: 'New York Medical Board', issueDate: '2023-06-01', expiryDate: t(600), status: 'Active', lastVerified: t(-2), verificationMethod: 'Primary Source' }
    ],
    privileges: ['Major Surgery', 'Outpatient Clinic'],
    recredentialingDate: t(90)
  }
];

const mockData: CredentialingDashboardData = {
  metrics: {
    totalCredentialedStaff: 1240,
    pendingApplications: 18,
    expiringWithin30Days: 4,
    verificationSuccessRate: 99.8,
    averageProcessingDays: 42
  },
  recentStaff: mockStaff,
  expiringCredentials: [
    { staffName: 'Dr. Sarah Chen', type: 'DEA Registration', expiryDate: t(15) },
    { staffName: 'Dr. Elena Rostova', type: 'Board Certification', expiryDate: t(28) }
  ]
};

export const credentialingApi = {
  getDashboardData: async (): Promise<{ data: CredentialingDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: CredentialingDashboardData }>('/api/v1/credentialing/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  verifyCredential: async (credentialId: string) => {
    try {
      return await apiPost(`/api/v1/credentialing/verify/${credentialId}`, {});
    } catch {
      return { data: { success: true }, message: 'Verification request sent (Mock)', status: 200 };
    }
  }
};
