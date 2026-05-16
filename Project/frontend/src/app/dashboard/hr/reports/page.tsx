'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useHrDashboard } from '@/modules/hr';

const HR_ROLES = ['hr_manager', 'super_admin', 'hospital_admin', 'hr_executive'];

export default function HrReportsPage() {
  const { data, isLoading } = useHrDashboard({});
  const d = data?.data;

  return (
    <RoleGuard roles={HR_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1200px]">
        <Breadcrumbs items={[{ label: 'HR' }, { label: 'HR Analytics' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Workforce Analytics" subtitle="KPI rollups for staffing, attendance, and compliance" />
          <CardBody>
            {isLoading || !d ? (
              <p className="text-gray-500">Loading analytics...</p>
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
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        <th className="text-left px-2 py-2 text-gray-400">Department</th>
                        <th className="text-left px-2 py-2 text-gray-400">Total</th>
                        <th className="text-left px-2 py-2 text-gray-400">On Duty</th>
                        <th className="text-left px-2 py-2 text-gray-400">Required</th>
                        <th className="text-left px-2 py-2 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.departmentStaffing.map((dept) => (
                        <tr key={dept.department} className="border-b border-white/[0.04]">
                          <td className="px-2 py-2 text-white">{dept.department}</td>
                          <td className="px-2 py-2">{dept.totalStaff}</td>
                          <td className="px-2 py-2">{dept.onDuty}</td>
                          <td className="px-2 py-2">{dept.required}</td>
                          <td className="px-2 py-2">{dept.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
