'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useHrDashboard } from '@/modules/hr';

const HR_ROLES = ['hr_manager', 'super_admin', 'hospital_admin', 'hr_executive'];

export default function HrPerformancePage() {
  const { data, isLoading } = useHrDashboard({});
  const staffing = data?.data?.departmentStaffing || [];

  return (
    <RoleGuard roles={HR_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1200px]">
        <Breadcrumbs items={[{ label: 'HR' }, { label: 'Performance Reviews' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Department Performance" subtitle="Coverage adequacy and staffing effectiveness by department" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading performance indicators...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-2 py-2 text-gray-400">Department</th>
                      <th className="text-left px-2 py-2 text-gray-400">Total Staff</th>
                      <th className="text-left px-2 py-2 text-gray-400">On Duty</th>
                      <th className="text-left px-2 py-2 text-gray-400">Required</th>
                      <th className="text-left px-2 py-2 text-gray-400">Coverage</th>
                      <th className="text-left px-2 py-2 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffing.map((dept) => {
                      const coverage = dept.required > 0 ? Math.round((dept.onDuty / dept.required) * 100) : 0;
                      return (
                        <tr key={dept.department} className="border-b border-white/[0.04]">
                          <td className="px-2 py-2 text-white">{dept.department}</td>
                          <td className="px-2 py-2">{dept.totalStaff}</td>
                          <td className="px-2 py-2">{dept.onDuty}</td>
                          <td className="px-2 py-2">{dept.required}</td>
                          <td className="px-2 py-2">{coverage}%</td>
                          <td className="px-2 py-2">{dept.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
