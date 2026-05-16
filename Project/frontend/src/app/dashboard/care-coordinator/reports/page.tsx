'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useCareCoordinatorDashboard } from '@/modules/care-coordinator';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { cn } from '@/utils/cn';

export default function CareCoordinatorReportsPage() {
  const { data, isLoading } = useCareCoordinatorDashboard({});

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  const kpis = data?.data?.kpis ?? [];
  const patients = data?.data?.patients ?? [];
  const tasks = data?.data?.pendingTasks ?? [];
  const alerts = data?.data?.alerts ?? [];

  const blockedJourneys = patients.filter((p) => p.status === 'Blocked').length;
  const delayedJourneys = patients.filter((p) => p.status === 'Delayed').length;
  const onTrackJourneys = patients.filter((p) => p.status === 'On Track').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'Urgent' || t.priority === 'STAT').length;
  const activeAlerts = alerts.filter((a) => a.status === 'Active').length;

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Care Coordination' }, { label: 'Care Reports' }]} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody className="p-5">
              <p className="text-[11px] text-gray-400 font-bold">Journeys On Track</p>
              <p className="text-3xl font-black text-success-light mt-2">{onTrackJourneys}</p>
              <p className="text-[10px] text-gray-500 mt-1">Active care journeys</p>
            </CardBody>
          </Card>
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody className="p-5">
              <p className="text-[11px] text-gray-400 font-bold">Delayed Journeys</p>
              <p className="text-3xl font-black text-warning-light mt-2">{delayedJourneys}</p>
              <p className="text-[10px] text-gray-500 mt-1">Requires coordination</p>
            </CardBody>
          </Card>
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardBody className="p-5">
              <p className="text-[11px] text-gray-400 font-bold">Blocked Journeys</p>
              <p className="text-3xl font-black text-emergency-light mt-2">{blockedJourneys}</p>
              <p className="text-[10px] text-gray-500 mt-1">Requires escalation</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <p className="text-[13px] font-bold text-white">KPI Snapshot</p>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-white/[0.04]">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] text-gray-400 font-bold">{kpi.title}</p>
                      {kpi.actionLabel && (
                        <p className="text-[10px] text-gray-500">{kpi.actionLabel}</p>
                      )}
                    </div>
                    <span className={cn(
                      'text-[12px] font-bold px-2 py-1 rounded',
                      kpi.status === 'critical'
                        ? 'bg-emergency/20 text-emergency-light'
                        : kpi.status === 'warning'
                        ? 'bg-warning/20 text-warning-light'
                        : kpi.status === 'success'
                        ? 'bg-success/20 text-success-light'
                        : 'bg-white/10 text-gray-300'
                    )}>
                      {kpi.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="border-white/[0.06] shadow-glass bg-surface-light">
            <CardHeader className="border-b border-white/[0.04] px-5 py-4">
              <p className="text-[13px] font-bold text-white">Workload Summary</p>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Urgent Tasks</span>
                <span className="text-[12px] font-bold text-warning-light">{urgentTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Active Alerts</span>
                <span className="text-[12px] font-bold text-emergency-light">{activeAlerts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Total Journeys</span>
                <span className="text-[12px] font-bold text-white">{patients.length}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
