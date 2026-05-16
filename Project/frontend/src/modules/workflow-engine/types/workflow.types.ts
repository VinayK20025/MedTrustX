/**
 * MedTrustX — Workflow Engine Service Types
 */

export type ProcessStatus = 'Active' | 'Paused' | 'Completed' | 'Suspended' | 'Draft';
export type TaskStatus = 'Pending' | 'Claimed' | 'In Progress' | 'Completed' | 'Escalated';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  status: ProcessStatus;
  category: 'Clinical' | 'Admin' | 'Billing' | 'System';
  activeInstances: number;
  lastModified: string;
}

export interface WorkflowTask {
  id: string;
  instanceId: string;
  processName: string;
  taskName: string;
  assignee?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdDate: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'Enabled' | 'Disabled';
  executionCount: number;
}

export interface WorkflowMetrics {
  totalActiveInstances: number;
  pendingTasksCount: number;
  averageCompletionTimeMinutes: number;
  automationSuccessRatePercent: number;
  escalatedTasksCount: number;
}

export interface WorkflowDashboardData {
  metrics: WorkflowMetrics;
  definitions: WorkflowDefinition[];
  activeTasks: WorkflowTask[];
  recentAutomations: AutomationRule[];
}
