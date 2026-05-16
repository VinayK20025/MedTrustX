import { apiGet, apiPost } from '@/services/api';
import type { WorkflowDashboardData, WorkflowDefinition, WorkflowTask } from '../types/workflow.types';

const t = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString();
const f = (minsAway: number) => new Date(Date.now() + minsAway * 60000).toISOString();

const mockDefinitions: WorkflowDefinition[] = [
  { id: 'PROC-101', name: 'Patient Admission Flow', version: 'v2.4.0', status: 'Active', category: 'Clinical', activeInstances: 142, lastModified: t(500) },
  { id: 'PROC-102', name: 'High-Value Invoice Approval', version: 'v1.1.2', status: 'Active', category: 'Billing', activeInstances: 8, lastModified: t(2000) },
  { id: 'PROC-103', name: 'ER Escalation Protocol', version: 'v3.0.1', status: 'Active', category: 'Clinical', activeInstances: 4, lastModified: t(100) },
];

const mockTasks: WorkflowTask[] = [
  { id: 'TSK-501', instanceId: 'INST-9921', processName: 'Patient Admission Flow', taskName: 'Verify Insurance Eligibility', assignee: 'Jane Clerk', status: 'In Progress', priority: 'High', dueDate: f(30), createdDate: t(45) },
  { id: 'TSK-502', instanceId: 'INST-9945', processName: 'ER Escalation Protocol', taskName: 'Notify On-Call Specialist', status: 'Pending', priority: 'Critical', dueDate: f(5), createdDate: t(2) },
  { id: 'TSK-503', instanceId: 'INST-9910', processName: 'High-Value Invoice Approval', taskName: 'CFO Review', assignee: 'Marcus Webb', status: 'Claimed', priority: 'Medium', dueDate: f(1440), createdDate: t(120) },
];

const mockData: WorkflowDashboardData = {
  metrics: {
    totalActiveInstances: 284,
    pendingTasksCount: 18,
    averageCompletionTimeMinutes: 42.5,
    automationSuccessRatePercent: 99.8,
    escalatedTasksCount: 2
  },
  definitions: mockDefinitions,
  activeTasks: mockTasks,
  recentAutomations: [
    { id: 'AUTO-01', name: 'Auto-Assign Lab Review', trigger: 'Lab Result Ready', action: 'Assign to Ordering Physician', status: 'Enabled', executionCount: 1240 },
    { id: 'AUTO-02', name: 'VIP Alert', trigger: 'Patient Admission', action: 'Notify Concierge Team', status: 'Enabled', executionCount: 45 }
  ]
};

export const workflowApi = {
  getDashboardData: async (): Promise<{ data: WorkflowDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: WorkflowDashboardData }>('/api/v1/workflow/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  claimTask: async (taskId: string) => {
    try {
      return await apiPost(`/api/v1/workflow/tasks/${taskId}/claim`, {});
    } catch {
      return { data: { success: true }, message: 'Task claimed (Mock)', status: 200 };
    }
  }
};
