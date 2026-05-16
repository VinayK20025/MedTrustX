import { apiGet, apiPost } from '@/services/api';
import { autoEndpoints } from '@/services/autoEndpoints';
import type { DpoData, ConsentRecord } from '../types/dpo.types';

export interface DpoFilters { status?: string; type?: string; }

const now = Date.now();
const d = (offsetDays: number) => new Date(now + offsetDays * 86400000).toISOString();

const mockData: DpoData = {
  metrics: {
    activeRequests: 7,
    openBreaches: 1,
    complianceScore: 95,
    avgResponseTimeDays: 12,
    pendingDpias: 3,
  },
  processingActivities: [
    { id: 'PA-001', system: 'Epic EHR', purpose: 'Patient Treatment', dataType: 'PHI', legalBasis: 'Vital Interest', dataSubjects: 'Inpatients, Outpatients', retentionPeriod: '10 years', transfers: false, riskLevel: 'High' },
    { id: 'PA-002', system: 'Billing System', purpose: 'Financial Processing & Claims', dataType: 'Financial', legalBasis: 'Legal Obligation', dataSubjects: 'All Patients', retentionPeriod: '7 years', transfers: true, riskLevel: 'Medium' },
    { id: 'PA-003', system: 'Patient Portal', purpose: 'Online Appointment & Records Access', dataType: 'PII', legalBasis: 'Consent', dataSubjects: 'Registered Portal Users', retentionPeriod: '5 years', transfers: false, riskLevel: 'Medium' },
    { id: 'PA-004', system: 'HR & Payroll', purpose: 'Employee Management', dataType: 'PII', legalBasis: 'Legal Obligation', dataSubjects: 'All Staff', retentionPeriod: '6 years', transfers: false, riskLevel: 'Low' },
    { id: 'PA-005', system: 'CCTV Network', purpose: 'Hospital Security', dataType: 'Operational', legalBasis: 'Legitimate Interest', dataSubjects: 'Visitors, Staff, Patients', retentionPeriod: '30 days', transfers: false, riskLevel: 'Low' },
  ],
  consentRecords: [
    { id: 'CON-001', patientName: 'Priya Sharma', mrn: 'MRN-44211', subjectType: 'Patient', category: 'Data Sharing (B2B)', purpose: 'Anonymized Research', scope: 'Treatment data sharing with referring specialists', status: 'Active', version: 'v2.1', consentDate: d(-90), expiryDate: d(275) },
    { id: 'CON-002', patientName: 'Arun Kumar', mrn: 'MRN-55381', subjectType: 'Patient', category: 'Marketing', purpose: 'Promotional Newsletters', scope: 'Research participation – Oncology Study', status: 'Withdrawn', version: 'v1.0', consentDate: d(-30) },
    { id: 'CON-003', patientName: 'Meena Patel', mrn: 'MRN-62910', subjectType: 'Employee', category: 'Biometric Processing', purpose: 'Physical Access Control', scope: 'Marketing communications & health tips', status: 'Active', version: 'v3.0', consentDate: d(-180), expiryDate: d(-15) },
    { id: 'CON-004', patientName: 'John Davis', mrn: 'MRN-71004', subjectType: 'Patient', category: 'Third-Party Analytics', purpose: 'EHR Usage Telemetry', scope: 'Telemedicine consultation recordings', status: 'Expired', version: 'v1.1', consentDate: d(-400), expiryDate: d(-35) },
  ],
  requests: [
    { id: 'DSR-001', type: 'Access', subjectName: 'Kavitha Nair', submittedDate: d(-5), dueDate: d(25), status: 'Under Review', assignedTo: 'DPO Team', notes: 'Requesting full medical history records.' },
    { id: 'DSR-002', type: 'Deletion', subjectName: 'Ravi Krishnan', submittedDate: d(-10), dueDate: d(20), status: 'Pending', assignedTo: 'MRO', notes: 'Right to erasure — no longer a patient.' },
    { id: 'DSR-003', type: 'Correction', subjectName: 'Sunita Verma', submittedDate: d(-2), dueDate: d(28), status: 'Pending', assignedTo: 'DPO Team' },
    { id: 'DSR-004', type: 'Portability', subjectName: 'Michael Chang', submittedDate: d(-20), dueDate: d(10), status: 'Completed', assignedTo: 'IT Admin' },
    { id: 'DSR-005', type: 'Restriction', subjectName: 'Ananya Bose', submittedDate: d(-18), dueDate: d(12), status: 'Under Review', assignedTo: 'Legal' },
  ],
  breaches: [
    {
      id: 'BR-001', title: 'Unauthorized email disclosure of patient records',
      severity: 'High', status: 'Investigating', dateDetected: d(-3),
      reportedToAuthority: false, affectedRecords: 43,
      affectedSystems: ['Internal Email Server', 'Epic EHR'],
      description: 'A ward administrator inadvertently emailed a spreadsheet containing patient names, MRNs, and diagnoses to an external unverified address. Discovered by the IT security monitoring system.',
    },
    {
      id: 'BR-002', title: 'Lost unencrypted USB drive — staff member',
      severity: 'Medium', status: 'Closed', dateDetected: d(-45),
      reportedToAuthority: true, affectedRecords: 12,
      affectedSystems: ['Offline Clinical Records'],
      description: 'A clinical staff member reported losing a USB drive containing 12 patient appointment records. Data was unencrypted. DPIA completed; authority notified within 72 hours.',
    },
  ],
  dpias: [
    { id: 'DPIA-001', projectName: 'AI-Assisted Diagnostic Tool Integration', description: 'Assessing privacy risks of deploying ML model using historical patient imaging data.', riskLevel: 'High', status: 'Under Review', startDate: d(-10), dpoReviewer: 'Dr. Kavya Menon' },
    { id: 'DPIA-002', projectName: 'Patient Mobile App Launch', description: 'New mobile app enabling patients to view records and book appointments.', riskLevel: 'Medium', status: 'Draft', startDate: d(-5), dpoReviewer: 'Unassigned' },
    { id: 'DPIA-003', projectName: 'Third-Party Lab Results API', description: 'External lab provider integration transmitting results via REST API.', riskLevel: 'Medium', status: 'Approved', startDate: d(-60), dpoReviewer: 'DPO Team' },
  ],
};

export const dpoApi = {
  getDashboardData: async (f: DpoFilters) => {
    try {
      return await apiGet<{ data: DpoData; message: string; status: number }>('/api/v1/dpo', { params: f });
    } catch (e) {
      console.warn('Fallback to mock DPO data due to API error:', e);
      return { data: mockData, message: 'Success (Mock)', status: 200 };
    }
  },
  updateRequestStatus: async (id: string, status: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(`/api/v1/dpo/requests/${id}`, { status });
    } catch (e) {
      return { data: { success: true }, message: 'Request updated (Mock)', status: 200 };
    }
  },
  updateBreachStatus: async (id: string, status: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(`/api/v1/dpo/breaches/${id}`, { status });
    } catch (e) {
      return { data: { success: true }, message: 'Breach status updated (Mock)', status: 200 };
    }
  },
  updateConsentStatus: async (id: string, status: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(`/api/v1/dpo/consents/${id}`, { type: 'consent', status });
    } catch (e) {
      return { data: { success: true }, message: 'Consent updated (Mock)', status: 200 };
    }
  },
};
