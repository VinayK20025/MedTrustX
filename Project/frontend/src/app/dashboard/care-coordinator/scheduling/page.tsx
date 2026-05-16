'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useCareCoordinatorDashboard } from '@/modules/care-coordinator';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { cn } from '@/utils/cn';

export default function CareCoordinatorSchedulingPage() {
  const { data, isLoading } = useCareCoordinatorDashboard({});

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  const tasks = (data?.data?.pendingTasks ?? []).slice().sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const milestones = (data?.data?.journeyMilestones ?? []).filter((m) => m.status !== 'Completed');

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Care Coordination' }, { label: 'Central Scheduling' }]} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <p className="text-[13px] font-bold text-white">Upcoming Tasks</p>
            </CardHeader>
            <CardBody className="p-0">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-gray-500 font-bold">No scheduled tasks.</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-bold text-white">{task.title}</p>
                        <p className="text-[10px] text-gray-500">{task.assignedTeam} • Patient {task.patientId}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          'text-[9px] uppercase font-bold px-2 py-0.5 rounded',
                          task.priority === 'Urgent' || task.priority === 'STAT'
                            ? 'bg-emergency/20 text-emergency-light'
                            : 'bg-white/10 text-gray-300'
                        )}>
                          {task.priority}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-2 font-mono">
                          {new Date(task.dueDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <p className="text-[13px] font-bold text-white">Pending Milestones</p>
            </CardHeader>
            <CardBody className="p-0">
              {milestones.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-gray-500 font-bold">No pending milestones.</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-bold text-white">{milestone.title}</p>
                        <p className="text-[10px] text-gray-500">{milestone.phase} • {milestone.assignedTeam}</p>
                      </div>
                      <span className={cn(
                        'text-[9px] uppercase font-bold px-2 py-0.5 rounded',
                        milestone.status === 'Delayed'
                          ? 'bg-emergency/20 text-emergency-light'
                          : milestone.status === 'In Progress'
                          ? 'bg-warning/20 text-warning-light'
                          : 'bg-white/10 text-gray-300'
                      )}>
                        {milestone.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
