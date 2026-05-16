'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useHrExecDashboard, useCompleteTask } from '@/modules/hr-executive';

const HR_EXEC_ROLES = ['hr_executive', 'super_admin', 'hospital_admin', 'hr_manager'];

export default function HrExecRecruitmentPage() {
  const { data, isLoading } = useHrExecDashboard({});
  const completeTask = useCompleteTask();
  const recruitmentTasks = (data?.data?.tasks || []).filter((task) => task.category === 'Recruitment');

  return (
    <RoleGuard roles={HR_EXEC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1000px]">
        <Breadcrumbs items={[{ label: 'HR Operations' }, { label: 'Recruitment Support' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Recruitment Pipeline" subtitle="Task-driven hiring support and interview scheduling" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading recruitment tasks...</p>
            ) : recruitmentTasks.length === 0 ? (
              <p className="text-gray-500">No active recruitment tasks</p>
            ) : (
              <div className="space-y-2">
                {recruitmentTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">{task.title}</p>
                      <p className="text-xs text-gray-400">Priority: {task.priority} | Status: {task.status} | Assigned: {new Date(task.assignedAt).toLocaleString()}</p>
                    </div>
                    <button
                      className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold disabled:opacity-50"
                      disabled={task.status === 'Completed' || completeTask.isPending}
                      onClick={() => completeTask.mutate(task.id)}
                    >
                      Complete Task
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
