'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LocumDashboard, useLocumDashboard } from '@/modules/locum';

const LOCUM_ROLES = ['locum', 'doctor', 'hospital_admin', 'super_admin'];

export default function LocumOrders() {
  const { data } = useLocumDashboard({ view: 'all' });
  const d = data?.data;

  return (
    <RoleGuard roles={LOCUM_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Locum Doctor' }, { label: 'Orders & Prescriptions' }]} />
        {d ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {d.kpis.map((kpi) => (
                <Card key={kpi.id} className="border-white/[0.06] shadow-glass bg-surface-light">
                  <CardBody className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">{kpi.title}</p>
                    <p className="text-3xl font-black text-white mt-2">{kpi.value}</p>
                    {kpi.delta && <p className="text-xs text-gray-500 mt-1">{kpi.delta}</p>}
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <div className="xl:col-span-8">
                <LocumDashboard />
              </div>
              <div className="xl:col-span-4 flex flex-col gap-5">
                <Card className="border-white/[0.06] shadow-glass bg-surface-light">
                  <CardHeader className="border-b border-white/[0.04] px-5 py-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white tracking-wide">Orders Context</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Use the current handover to guide prescriptions and investigations</p>
                    </div>
                  </CardHeader>
                  <CardBody className="p-4 space-y-3 text-sm text-gray-300">
                    <p>{d.handover.incomingNotes}</p>
                    <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Critical patient</p>
                      <p className="text-white font-semibold mt-1">{d.activeSnapshot.patientName}</p>
                      <p className="text-xs text-gray-500 mt-1">{d.activeSnapshot.primaryDiagnosis}</p>
                    </div>
                    <div className="space-y-2">
                      {d.handover.pendingTasks.map((task) => (
                        <div key={task.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                          <p className="text-white font-semibold">{task.task}</p>
                          <p className="text-xs text-gray-500 mt-1">{task.patientName} · {task.priority}</p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500 py-20 text-center">No data available</div>
        )}
      </div>
    </RoleGuard>
  );
}
