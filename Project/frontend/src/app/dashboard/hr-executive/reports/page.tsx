'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useHrExecDashboard } from '@/modules/hr-executive';

const HR_EXEC_ROLES = ['hr_executive', 'super_admin', 'hospital_admin', 'hr_manager'];

export default function HrExecReportsPage() {
  const { data, isLoading } = useHrExecDashboard({});
  const d = data?.data;

  return (
    <RoleGuard roles={HR_EXEC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1200px]">
        <Breadcrumbs items={[{ label: 'HR Operations' }, { label: 'Daily HR Logs' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="HR Executive Reports" subtitle="Operational rollups from tasks, attendance, leaves, and documents" />
          <CardBody>
            {isLoading || !d ? (
              <p className="text-gray-500">Loading reports...</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {d.kpis.map((kpi) => (
                    <div key={kpi.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">{kpi.title}</p>
                      <p className="text-lg font-bold text-white mt-1">{kpi.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-gray-400 uppercase tracking-wider text-[10px]">Pending Tasks</p>
                    <p className="text-white font-bold text-lg">{d.tasks.filter((task) => task.status !== 'Completed').length}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-gray-400 uppercase tracking-wider text-[10px]">Pending Leaves</p>
                    <p className="text-white font-bold text-lg">{d.leaveRequests.filter((leave) => leave.status === 'Pending').length}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-gray-400 uppercase tracking-wider text-[10px]">Documents Pending</p>
                    <p className="text-white font-bold text-lg">{d.documents.filter((doc) => doc.status === 'Pending').length}</p>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
