'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useHrDashboard } from '@/modules/hr';

const HR_ADMIN_ROLES = ['hospital_admin', 'super_admin', 'hr_manager', 'hr_executive'];

export default function AdminHrPage() {
  const { data, isLoading } = useHrDashboard({});
  const d = data?.data;

  return (
    <RoleGuard roles={HR_ADMIN_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1800px]">
        <Breadcrumbs items={[{ label: 'Executive' }, { label: 'HR & Staffing Overview' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[500px]">
          <CardHeader title="Staffing Overview" subtitle="Executive staffing snapshot across departments" />
          <CardBody>
            {isLoading || !d ? (
              <p className="text-gray-500">Loading staffing overview...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {d.departmentStaffing.map((dept) => (
                  <div key={dept.department} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-white font-semibold">{dept.department}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Staff: {dept.totalStaff}</p>
                    <p className="text-xs text-gray-400">On Duty: {dept.onDuty}</p>
                    <p className="text-xs text-gray-400">Required: {dept.required}</p>
                    <p className="text-xs font-semibold mt-1">Status: {dept.status}</p>
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
