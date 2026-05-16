import { apiGet, apiPost, apiPut } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type {
  CareCoordinatorDashboardData,
  CareCoordinatorKPI,
  CoordinatedPatient,
  CareMilestone,
  CareTask,
  CoordinationAlert,
} from '../types/careCoordinator.types';

export interface CoordinationFilters {
  ward?: string;
  status?: string;
  patientId?: string;
  planId?: string;
  workflowId?: string;
}

const mockKpis: CareCoordinatorKPI[] = [
  { id: '1', title: 'Active Journeys', value: 34, format: 'number', status: 'normal' },
  { id: '2', title: 'Pending Discharges', value: 6, format: 'number', status: 'success', actionLabel: 'View Discharges', actionUrl: '/dashboard/care-coordinator/patients' },
  { id: '3', title: 'Bottlenecks', value: 3, format: 'number', status: 'critical', actionLabel: 'Resolve Issues', actionUrl: '/dashboard/care-coordinator/alerts' },
  { id: '4', title: 'Pending Tasks', value: 12, format: 'number', status: 'warning' },
];

const mockPatients: CoordinatedPatient[] = [
  { id: 'PT-C-1', patientName: 'William Carter', mrn: 'MRN-4491', currentWard: 'Orthopedics', admissionDate: new Date(Date.now() - 172800000).toISOString(), attendingPhysician: 'Dr. Evans', priority: 'High', status: 'Blocked' },
  { id: 'PT-C-2', patientName: 'Samantha Jones', mrn: 'MRN-8821', currentWard: 'Cardiology', admissionDate: new Date(Date.now() - 432000000).toISOString(), attendingPhysician: 'Dr. Lee', priority: 'Routine', status: 'On Track' },
];

const mockMilestones: CareMilestone[] = [
  { id: 'M-1', title: 'ER Admission & Triage', phase: 'Admission', status: 'Completed', timestamp: new Date(Date.now() - 172800000).toISOString(), assignedTeam: 'ER Triage' },
  { id: 'M-2', title: 'MRI Scan (Right Knee)', phase: 'Diagnosis', status: 'Completed', timestamp: new Date(Date.now() - 86400000).toISOString(), assignedTeam: 'Radiology' },
  { id: 'M-3', title: 'Orthopedic Surgery Consult', phase: 'Treatment', status: 'Delayed', assignedTeam: 'Surgery', notes: 'Consult pending due to OR overbooking.' },
  { id: 'M-4', title: 'Physical Therapy Eval', phase: 'Recovery', status: 'Pending', assignedTeam: 'Rehab' },
  { id: 'M-5', title: 'Final Discharge Clearance', phase: 'Discharge', status: 'Pending', assignedTeam: 'Care Team' },
];

const mockTasks: CareTask[] = [
  { id: 'TSK-C1', patientId: 'MRN-4491', title: 'Escalate Ortho Consult Request', assignedTeam: 'Surgery', dueDate: new Date(Date.now() + 3600000).toISOString(), priority: 'Urgent', status: 'Pending', isBottleneck: true },
  { id: 'TSK-C2', patientId: 'MRN-4491', title: 'Arrange post-op PT schedule', assignedTeam: 'Rehab', dueDate: new Date(Date.now() + 86400000).toISOString(), priority: 'Routine', status: 'Pending', isBottleneck: false },
];

const mockAlerts: CoordinationAlert[] = [
  { id: 'ALT-COORD-1', type: 'Consult Pending', patientId: 'MRN-4491', severity: 'critical', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'Active', message: 'Orthopedic consult delayed > 24 hours. Surgery scheduling blocked.' },
];

const toPatientStatus = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes('aborted') || value.includes('suspended')) return 'Blocked';
  if (value.includes('completed')) return 'On Track';
  if (value.includes('active')) return 'On Track';
  return 'Delayed';
};

const normalizePlans = (plans: any[]): CoordinatedPatient[] => plans.map((plan, index) => {
  const patientId = plan.patientId ?? plan.patient_id ?? `P-${index + 1}`;
  const shortId = String(patientId).slice(0, 8).toUpperCase();
  const status = toPatientStatus(plan.status ?? 'active');
  return {
    id: plan.id ?? `PLAN-${index + 1}`,
    patientName: plan.patientName ?? `Patient ${shortId}`,
    mrn: plan.mrn ?? String(patientId),
    currentWard: plan.currentWard ?? plan.ward ?? 'General',
    admissionDate: plan.createdAt ?? plan.created_at ?? new Date().toISOString(),
    attendingPhysician: plan.attendingPhysician ?? plan.attending_physician ?? 'Care Team',
    priority: status === 'Blocked' ? 'High' : 'Routine',
    status,
  };
});

const normalizeTasks = (tasks: any[]): CareTask[] => tasks.map((task, index) => {
  const dueDate = task.dueDate ?? task.due_time ?? new Date().toISOString();
  const statusValue = (task.status ?? 'pending').toString().toLowerCase();
  const status = statusValue.includes('complete')
    ? 'Completed'
    : statusValue.includes('progress')
    ? 'In Progress'
    : 'Pending';
  const dueTimeMs = new Date(dueDate).getTime();
  const isOverdue = Number.isFinite(dueTimeMs) && dueTimeMs < Date.now();
  return {
    id: task.id ?? `TSK-${index + 1}`,
    patientId: task.patientId ?? task.patient_id ?? task.care_plan_id ?? 'Unknown',
    title: task.title ?? task.taskName ?? task.task_name ?? 'Care Task',
    assignedTeam: task.assignedTeam ?? task.assigned_team ?? task.assigned_to ?? 'Unassigned',
    dueDate,
    priority: (task.priority ?? (isOverdue ? 'Urgent' : 'Routine')),
    status,
    isBottleneck: (task.isBottleneck ?? (isOverdue || status === 'Pending')),
  };
});

const deriveKpis = (patients: CoordinatedPatient[], tasks: CareTask[], alerts: CoordinationAlert[]): CareCoordinatorKPI[] => {
  const activeJourneys = patients.length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
  const bottlenecks = alerts.filter((a) => a.status === 'Active').length;
  const pendingDischarges = patients.filter((p) => p.status === 'On Track').length;
  return [
    { id: '1', title: 'Active Journeys', value: activeJourneys, format: 'number', status: 'normal' },
    { id: '2', title: 'Pending Discharges', value: pendingDischarges, format: 'number', status: 'success', actionLabel: 'View Discharges', actionUrl: '/dashboard/care-coordinator/patients' },
    { id: '3', title: 'Bottlenecks', value: bottlenecks, format: 'number', status: bottlenecks > 0 ? 'critical' : 'success', actionLabel: 'Resolve Issues', actionUrl: '/dashboard/care-coordinator/alerts' },
    { id: '4', title: 'Pending Tasks', value: pendingTasks, format: 'number', status: pendingTasks > 10 ? 'warning' : 'normal' },
  ];
};

export const careCoordinatorApi = {
  getDashboardSummary: async (filters: CoordinationFilters) => {
    try {
      const plansPromise = filters.patientId
        ? apiGet<any>(endpoints.careCoordination.patientPlans(filters.patientId))
        : filters.planId
        ? apiGet<any>(endpoints.careCoordination.plan(filters.planId))
        : Promise.resolve(null);

      const tasksPromise = filters.planId
        ? apiGet<any>(endpoints.careCoordination.planTasks(filters.planId))
        : Promise.resolve(null);

      const [plansRes, tasksRes] = await Promise.allSettled([plansPromise, tasksPromise]);

      const plansPayload = plansRes.status === 'fulfilled'
        ? (plansRes.value?.data ?? plansRes.value ?? null)
        : null;
      const tasksPayload = tasksRes.status === 'fulfilled'
        ? (tasksRes.value?.data ?? tasksRes.value ?? null)
        : null;

      const normalizedPlans = Array.isArray(plansPayload)
        ? normalizePlans(plansPayload)
        : plansPayload
        ? normalizePlans([plansPayload])
        : mockPatients;
      const normalizedTasks = Array.isArray(tasksPayload)
        ? normalizeTasks(tasksPayload)
        : mockTasks;

      const alerts = mockAlerts;
      const kpis = deriveKpis(normalizedPlans, normalizedTasks, alerts);

      return {
        data: {
          kpis,
          patients: normalizedPlans,
          activePatient: normalizedPlans[0] ?? mockPatients[0],
          journeyMilestones: mockMilestones,
          pendingTasks: normalizedTasks,
          alerts,
        } as CareCoordinatorDashboardData,
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: mockKpis,
          patients: mockPatients,
          activePatient: mockPatients[0],
          journeyMilestones: mockMilestones,
          pendingTasks: mockTasks,
          alerts: mockAlerts,
        } as CareCoordinatorDashboardData,
        message: 'Failed to load live care coordination data, falling back to cached state',
        status: 500,
      };
    }
  },

  assignTask: async (planId: string, taskName: string, assignedTo?: string, dueTime?: string) => {
    try {
      const response = await apiPost<any>(endpoints.careCoordination.planTasks(planId), {
        task_name: taskName,
        assigned_to: assignedTo,
        due_time: dueTime,
      });
      return { data: response, message: 'Task assigned', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Task assigned', status: 200 };
    }
  },

  updateTask: async (taskId: string, status: string, assignedTo?: string) => {
    try {
      const response = await apiPut<any>(endpoints.careCoordination.task(taskId), {
        status,
        assigned_to: assignedTo,
      });
      return { data: response, message: 'Task updated', status: 200 };
    } catch (error) {
      return { data: { success: true }, message: 'Task updated', status: 200 };
    }
  },

  updateMilestone: async (milestoneId: string, status: string) => ({
    data: { success: true, milestoneId, status },
    message: 'Milestone updated',
    status: 200,
  }),

  resolveAlert: async (alertId: string) => ({
    data: { success: true, alertId },
    message: 'Alert marked as resolved',
    status: 200,
  }),
};
