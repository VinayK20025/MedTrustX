import { autoEndpoints } from '@/services/api';
import type {
  AuditDashboardData,
  AuditFilters,
  AuditKPI,
  AuditControl,
  Audit,
  StandardMapping,
  AuditFinding,
  CapaAction,
} from '../types/audit.types';

const d = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString();

const mockData: AuditDashboardData = {
  kpis: [
    { label: 'Audits Completed', value: 12, status: 'healthy', trend: 'up', changePercent: 8 },
    { label: 'Open Findings', value: 8, status: 'critical', trend: 'down', changePercent: -12 },
    { label: 'CAPA Completion', value: '80%', status: 'healthy', trend: 'up', changePercent: 15 },
    { label: 'Compliance Score', value: '87%', status: 'healthy', trend: 'stable', changePercent: 0 },
  ],
  controls: [
    {
      id: 'CTL-001',
      title: 'User Access Control',
      domain: 'IT',
      description: 'Ensures role-based access to all hospital systems is reviewed quarterly.',
      status: 'Active',
      lastTested: d(-30),
      effectiveness: 'Effective',
      mappedStandards: ['ISO 27001', 'NABH'],
      frequency: 'Quarterly',
      owner: 'IT Security',
    },
    {
      id: 'CTL-002',
      title: 'Medication Reconciliation Review',
      domain: 'Clinical',
      description: 'Validates that medication reconciliation is performed at every care transition.',
      status: 'Active',
      lastTested: d(-15),
      effectiveness: 'Partially Effective',
      mappedStandards: ['NABH', 'JCI'],
      frequency: 'Monthly',
      owner: 'CNO Office',
    },
    {
      id: 'CTL-003',
      title: 'Financial Approval Segregation',
      domain: 'Financial',
      description: 'Ensures no single staff member can approve and process payments above ₹50,000.',
      status: 'Active',
      lastTested: d(-45),
      effectiveness: 'Effective',
      mappedStandards: ['Internal Policy'],
      frequency: 'Continuous',
      owner: 'Finance',
    },
    {
      id: 'CTL-004',
      title: 'Backup & Recovery Testing',
      domain: 'IT',
      description: 'Monthly disaster recovery drill and data backup verification.',
      status: 'Under Review',
      lastTested: d(-90),
      effectiveness: 'Ineffective',
      mappedStandards: ['ISO 27001'],
      frequency: 'Monthly',
      owner: 'Infrastructure',
    },
    {
      id: 'CTL-005',
      title: 'Infection Control Audit',
      domain: 'Clinical',
      description: 'Checks compliance with hand hygiene, PPE, and sterilization protocols.',
      status: 'Active',
      lastTested: d(-7),
      effectiveness: 'Effective',
      mappedStandards: ['NABH', 'JCI'],
      frequency: 'Weekly',
      owner: 'Infection Control',
    },
    {
      id: 'CTL-006',
      title: 'Payroll Audit Controls',
      domain: 'HR',
      description: 'Validates accuracy of payroll processing and exception handling.',
      status: 'Active',
      lastTested: d(-60),
      effectiveness: 'Partially Effective',
      mappedStandards: ['Internal Policy'],
      frequency: 'Bi-weekly',
      owner: 'HR',
    },
    {
      id: 'CTL-007',
      title: 'Patient Safety Incident Reporting',
      domain: 'Clinical',
      description: 'Ensures all adverse events are reported and tracked in centralized system.',
      status: 'Active',
      lastTested: d(-5),
      effectiveness: 'Effective',
      mappedStandards: ['JCI', 'NABH'],
      frequency: 'Daily',
      owner: 'Quality Office',
    },
    {
      id: 'CTL-008',
      title: 'Supply Chain & Vendor Management',
      domain: 'Operations',
      description: 'Verifies vendor credentials, contracts, and compliance with hospital standards.',
      status: 'Active',
      lastTested: d(-75),
      effectiveness: 'Partially Effective',
      mappedStandards: ['NABH'],
      frequency: 'Quarterly',
      owner: 'Procurement',
    },
  ],
  audits: [
    {
      id: 'AUD-101',
      title: 'Q1 IT Controls Review',
      scope: 'Access management, patching, backup',
      domain: 'IT',
      status: 'Completed',
      startDate: d(-60),
      endDate: d(-45),
      auditor: 'Ramesh Nair',
      findingsCount: 4,
      type: 'Internal',
      schedule: 'Scheduled',
    },
    {
      id: 'AUD-102',
      title: 'Clinical Process Compliance',
      scope: 'Medication reconciliation, discharge protocols',
      domain: 'Clinical',
      status: 'In Progress',
      startDate: d(-10),
      auditor: 'Priya Thomas',
      findingsCount: 2,
      type: 'Internal',
      schedule: 'Scheduled',
    },
    {
      id: 'AUD-103',
      title: 'Finance Controls Q2',
      scope: 'Vendor payments, procurement segregation',
      domain: 'Financial',
      status: 'Planned',
      startDate: d(7),
      auditor: 'Suresh Kumar',
      findingsCount: 0,
      type: 'Internal',
      schedule: 'Scheduled',
    },
    {
      id: 'AUD-104',
      title: 'HR & Payroll Audit',
      scope: 'Payroll processing, new hire controls',
      domain: 'HR',
      status: 'Overdue',
      startDate: d(-90),
      auditor: 'Anita Rao',
      findingsCount: 2,
      type: 'Internal',
      schedule: 'Scheduled',
    },
    {
      id: 'AUD-105',
      title: 'NABH Compliance Assessment',
      scope: 'Full accreditation readiness review',
      domain: 'Operations',
      status: 'In Progress',
      startDate: d(-25),
      auditor: 'External Audit Team',
      findingsCount: 5,
      type: 'External',
      schedule: 'Scheduled',
    },
  ],
  mappings: [
    {
      controlId: 'CTL-001',
      controlTitle: 'User Access Control',
      standard: 'ISO 27001',
      clause: 'A.9.2.3',
      status: 'Compliant',
      lastVerified: d(-30),
    },
    {
      controlId: 'CTL-001',
      controlTitle: 'User Access Control',
      standard: 'NABH',
      clause: 'HIC.3',
      status: 'Compliant',
      lastVerified: d(-30),
    },
    {
      controlId: 'CTL-002',
      controlTitle: 'Medication Reconciliation Review',
      standard: 'NABH',
      clause: 'MOM.5',
      status: 'Partial',
      lastVerified: d(-15),
    },
    {
      controlId: 'CTL-002',
      controlTitle: 'Medication Reconciliation Review',
      standard: 'JCI',
      clause: 'IPSG.3',
      status: 'Non-Compliant',
      lastVerified: d(-15),
    },
    {
      controlId: 'CTL-004',
      controlTitle: 'Backup & Recovery Testing',
      standard: 'ISO 27001',
      clause: 'A.12.3.1',
      status: 'Non-Compliant',
      lastVerified: d(-90),
    },
    {
      controlId: 'CTL-005',
      controlTitle: 'Infection Control Audit',
      standard: 'JCI',
      clause: 'IPSG.6',
      status: 'Compliant',
      lastVerified: d(-7),
    },
  ],
  findings: [
    {
      id: 'FND-001',
      auditId: 'AUD-101',
      title: 'Stale privileged accounts not deprovisioned',
      description: '14 ex-employee accounts found still active in Active Directory with elevated privileges.',
      domain: 'IT',
      severity: 'Critical',
      status: 'In Remediation',
      controlRef: 'CTL-001',
      dateRaised: d(-45),
      owner: 'IT Admin',
      rootCause: 'Lack of automated IAM deprovisioning tied to HR exits',
    },
    {
      id: 'FND-002',
      auditId: 'AUD-101',
      title: 'Backup restoration untested for 3 months',
      description: 'DR backup restoration not tested since last quarter despite monthly SLA requirement.',
      domain: 'IT',
      severity: 'High',
      status: 'Open',
      controlRef: 'CTL-004',
      dateRaised: d(-44),
      owner: 'Infrastructure Team',
      rootCause: 'No automated DR testing schedule in monitoring calendar',
    },
    {
      id: 'FND-003',
      auditId: 'AUD-102',
      title: 'Medication reconciliation skipped for 3 transfers',
      description: 'Manual audit of ward transfers found 3 patients without documented medication reconciliation.',
      domain: 'Clinical',
      severity: 'High',
      status: 'Open',
      controlRef: 'CTL-002',
      dateRaised: d(-8),
      owner: 'CNO Office',
      rootCause: 'Insufficient training and system usability issues',
    },
    {
      id: 'FND-004',
      auditId: 'AUD-104',
      title: 'Overtime payments approved by direct managers',
      description: 'Overtime above ₹10,000 approved without second-level HR validation, violating segregation policy.',
      domain: 'HR',
      severity: 'Medium',
      status: 'Open',
      controlRef: 'CTL-006',
      dateRaised: d(-85),
      owner: 'HR Manager',
      rootCause: 'Inadequate access controls in payroll system',
    },
    {
      id: 'FND-005',
      auditId: 'AUD-101',
      title: 'Patch management cycle delayed by 6 weeks',
      description: 'Critical OS patches deployed 6 weeks past the approved SLA window.',
      domain: 'IT',
      severity: 'Critical',
      status: 'Open',
      controlRef: 'CTL-004',
      dateRaised: d(-46),
      owner: 'IT Ops',
      rootCause: 'Lack of patch management automation and monitoring',
    },
  ],
  capas: {
    'FND-001': [
      {
        id: 'CAPA-001',
        findingId: 'FND-001',
        action: 'Disable all ex-employee accounts via automated offboarding script',
        rootCause: 'Lack of automated IAM deprovisioning tied to HR exits',
        owner: 'IT Admin',
        dueDate: d(7),
        status: 'In Progress',
      },
      {
        id: 'CAPA-002',
        findingId: 'FND-001',
        action: 'Implement quarterly privileged access review process',
        rootCause: 'No periodic access review policy enforced',
        owner: 'CISO',
        dueDate: d(21),
        status: 'Open',
      },
    ],
    'FND-002': [
      {
        id: 'CAPA-003',
        findingId: 'FND-002',
        action: 'Schedule and complete full DR restoration drill within 14 days',
        rootCause: 'No automated DR testing schedule in monitoring calendar',
        owner: 'Infrastructure Team',
        dueDate: d(14),
        status: 'Open',
      },
    ],
    'FND-003': [
      {
        id: 'CAPA-004',
        findingId: 'FND-003',
        action: 'Conduct medication reconciliation training for all ward staff',
        rootCause: 'Insufficient training and system usability issues',
        owner: 'CNO Office',
        dueDate: d(30),
        status: 'In Progress',
      },
    ],
  },
  summary: {
    totalControls: 8,
    activeAudits: 2,
    openFindings: 8,
    overallScore: 87,
  },
};

export const auditApi = {
  getDashboardData: async (filters?: AuditFilters) => {
    try {
      const response = await autoEndpoints('/api/v1/audit', 'GET');
      return { data: response?.data || mockData, message: 'Success', status: 200 };
    } catch {
      return { data: mockData, message: 'Using mock data', status: 200 };
    }
  },

  createAudit: async (payload: AuditMutationPayload) => {
    try {
      const response = await autoEndpoints('/api/v1/audit/audits', 'POST', payload);
      return { data: response?.data, message: 'Audit created', status: 201 };
    } catch (error) {
      return { data: null, message: 'Failed to create audit', status: 500 };
    }
  },

  updateAudit: async (id: string, payload: AuditMutationPayload) => {
    try {
      const response = await autoEndpoints(`/api/v1/audit/audits/${id}`, 'PUT', payload);
      return { data: response?.data, message: 'Audit updated', status: 200 };
    } catch (error) {
      return { data: null, message: 'Failed to update audit', status: 500 };
    }
  },

  reportFinding: async (payload: AuditMutationPayload) => {
    try {
      const response = await autoEndpoints('/api/v1/audit/findings', 'POST', payload);
      return { data: response?.data, message: 'Finding reported', status: 201 };
    } catch (error) {
      return { data: null, message: 'Failed to report finding', status: 500 };
    }
  },

  updateFinding: async (id: string, status: string) => {
    try {
      const response = await autoEndpoints(`/api/v1/audit/findings/${id}`, 'PUT', { status });
      return { data: response?.data, message: 'Finding updated', status: 200 };
    } catch (error) {
      return { data: null, message: 'Failed to update finding', status: 500 };
    }
  },

  createCapaAction: async (payload: AuditMutationPayload) => {
    try {
      const response = await autoEndpoints('/api/v1/audit/capas', 'POST', payload);
      return { data: response?.data, message: 'CAPA created', status: 201 };
    } catch (error) {
      return { data: null, message: 'Failed to create CAPA', status: 500 };
    }
  },

  closeCapaAction: async (id: string) => {
    try {
      const response = await autoEndpoints(`/api/v1/audit/capas/${id}`, 'PUT', { status: 'Closed' });
      return { data: response?.data, message: 'CAPA closed', status: 200 };
    } catch (error) {
      return { data: null, message: 'Failed to close CAPA', status: 500 };
    }
  },

  exportAuditReport: async (filters?: AuditFilters) => {
    try {
      const response = await autoEndpoints('/api/v1/audit/export', 'POST', filters || {});
      return { data: response?.data, message: 'Report exported', status: 200 };
    } catch (error) {
      return { data: null, message: 'Failed to export report', status: 500 };
    }
  },
};

interface AuditMutationPayload {
  [key: string]: unknown;
}
