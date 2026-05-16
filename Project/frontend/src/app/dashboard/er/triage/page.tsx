'use client';
import React, { useMemo } from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { TriageQueue, useERDashboard } from '@/modules/er';

const ER_ROLES = ['er_physician', 'emergency_physician', 'hospital_admin', 'super_admin'];

export default function TriageQueuePage() {
  const { data, isLoading } = useERDashboard({ view: 'triage' });
  const queue = data?.data?.triageQueue ?? [];

  const summary = useMemo(() => ({
    critical: queue.filter((patient) => patient.priority === 'critical').length,
    urgent: queue.filter((patient) => patient.priority === 'urgent').length,
    stable: queue.filter((patient) => patient.priority === 'stable').length,
    waitingOver15: queue.filter((patient) => patient.waitingTime >= 15).length,
  }), [queue]);

  return (
    <RoleGuard roles={ER_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'ER Physician' }, { label: 'Triage Queue' }]} />
        {isLoading ? (
          <Skeleton className="h-[540px] w-full rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div className="xl:col-span-8 h-[540px]">
              <TriageQueue queue={queue} />
            </div>
            <div className="xl:col-span-4 flex flex-col gap-5">
              <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-wide">Triage Snapshot</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Live queue pressure and priority distribution</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-emergency/20 bg-emergency/5 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Critical</p>
                      <p className="text-xl font-bold text-emergency-light mt-1">{summary.critical}</p>
                    </div>
                    <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Urgent</p>
                      <p className="text-xl font-bold text-warning-light mt-1">{summary.urgent}</p>
                    </div>
                    <div className="rounded-lg border border-success/20 bg-success/5 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Stable</p>
                      <p className="text-xl font-bold text-success-light mt-1">{summary.stable}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Wait &gt; 15m</p>
                      <p className="text-xl font-bold text-white mt-1">{summary.waitingOver15}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card className="border-white/[0.06] shadow-glass bg-surface-light flex-1">
                <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-wide">Triage Guidance</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Operational expectations for the ER floor</p>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
                    <li>Prioritize critical arrivals within the first five minutes.</li>
                    <li>Reassess long-wait patients for escalation or redirection.</li>
                    <li>Coordinate bay assignment with active resuscitation capacity.</li>
                    <li>Update routing once provider disposition is confirmed.</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
