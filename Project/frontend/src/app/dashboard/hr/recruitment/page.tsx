'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useHrDashboard } from '@/modules/hr';

const HR_ROLES = ['hr_manager', 'super_admin', 'hospital_admin', 'hr_executive'];

export default function HrRecruitmentPage() {
  const { data, isLoading } = useHrDashboard({});
  const shifts = data?.data?.shiftOverview || [];
  const requisitions = shifts
    .filter((s) => s.assigned < s.required)
    .map((s) => ({
      id: s.id,
      department: s.department,
      shift: s.shift,
      gap: s.required - s.assigned,
      severity: s.status,
    }));

  return (
    <RoleGuard roles={HR_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1200px]">
        <Breadcrumbs items={[{ label: 'HR' }, { label: 'Recruitment Pipeline' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Open Requisitions" subtitle="Derived from understaffed and critical shift gaps" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading recruitment demand...</p>
            ) : requisitions.length === 0 ? (
              <p className="text-gray-500">No active requisitions. Staffing levels are healthy.</p>
            ) : (
              <div className="space-y-2">
                {requisitions.map((req) => (
                  <div key={req.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3">
                    <p className="text-white font-semibold">{req.department} - {req.shift} Shift</p>
                    <p className="text-xs text-gray-400">Open positions: {req.gap} | Severity: {req.severity}</p>
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
