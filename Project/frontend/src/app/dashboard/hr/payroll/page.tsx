'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useHrDashboard } from '@/modules/hr';

const HR_ROLES = ['hr_manager', 'super_admin', 'hospital_admin', 'hr_executive'];

export default function HrPayrollPage() {
  const { data, isLoading } = useHrDashboard({});
  const staff = data?.data?.staffDirectory || [];

  const payrollRows = staff.map((member) => {
    const base = member.role.toLowerCase().includes('doctor') ? 250000 : member.role.toLowerCase().includes('nurse') ? 85000 : 60000;
    const allowance = Math.round(base * 0.18);
    const deductions = Math.round(base * 0.1);
    const net = base + allowance - deductions;
    return { ...member, base, allowance, deductions, net };
  });

  return (
    <RoleGuard roles={HR_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1200px]">
        <Breadcrumbs items={[{ label: 'HR' }, { label: 'Payroll & Incentives' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Payroll Processing" subtitle="Computed salary components based on current staff roster" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading payroll data...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-2 py-2 text-gray-400">Name</th>
                      <th className="text-left px-2 py-2 text-gray-400">Role</th>
                      <th className="text-left px-2 py-2 text-gray-400">Base</th>
                      <th className="text-left px-2 py-2 text-gray-400">Allowance</th>
                      <th className="text-left px-2 py-2 text-gray-400">Deductions</th>
                      <th className="text-left px-2 py-2 text-gray-400">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRows.map((row) => (
                      <tr key={row.id} className="border-b border-white/[0.04]">
                        <td className="px-2 py-2 text-white">{row.name}</td>
                        <td className="px-2 py-2">{row.role}</td>
                        <td className="px-2 py-2">INR {row.base.toLocaleString()}</td>
                        <td className="px-2 py-2">INR {row.allowance.toLocaleString()}</td>
                        <td className="px-2 py-2">INR {row.deductions.toLocaleString()}</td>
                        <td className="px-2 py-2 font-semibold">INR {row.net.toLocaleString()}</td>
                      </tr>
                    ))}
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
