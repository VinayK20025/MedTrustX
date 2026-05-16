'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useCareCoordinatorDashboard } from '@/modules/care-coordinator';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { cn } from '@/utils/cn';

export default function CareCoordinatorCommunicationPage() {
  const { data, isLoading } = useCareCoordinatorDashboard({});

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  const alerts = data?.data?.alerts ?? [];
  const tasks = data?.data?.pendingTasks ?? [];
  const messages = [
    ...alerts.map((alert) => ({
      id: alert.id,
      type: 'Alert',
      title: alert.type,
      body: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp,
      patientId: alert.patientId,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      type: 'Task',
      title: task.title,
      body: `Assigned to ${task.assignedTeam}`,
      severity: task.priority === 'Urgent' || task.priority === 'STAT' ? 'critical' : 'warning',
      timestamp: task.dueDate,
      patientId: task.patientId,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Care Coordination' }, { label: 'Team Communication' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader className="border-b border-white/[0.04] px-5 py-4">
            <div>
              <p className="text-[13px] font-bold text-white">Care Team Updates</p>
              <p className="text-[11px] text-gray-400">Latest coordination signals and action requests</p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-[12px] text-gray-500 font-bold">No active updates.</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-[9px] uppercase font-bold px-2 py-0.5 rounded',
                          msg.type === 'Alert' ? 'bg-emergency/20 text-emergency-light' : 'bg-indigo-500/20 text-indigo-300'
                        )}>
                          {msg.type}
                        </span>
                        <p className="text-[13px] font-bold text-white">{msg.title}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{msg.body}</p>
                      <p className="text-[10px] text-gray-500 mt-2 font-mono">Patient: {msg.patientId}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'text-[9px] uppercase font-bold px-2 py-0.5 rounded',
                        msg.severity === 'critical' ? 'bg-emergency/20 text-emergency-light' : 'bg-warning/20 text-warning-light'
                      )}>
                        {msg.severity}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2 font-mono">
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
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
