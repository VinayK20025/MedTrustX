'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Spinner';
import { useHrExecDashboard } from '@/modules/hr-executive';

const HR_EXEC_ROLES = ['hr_executive', 'super_admin', 'hospital_admin', 'hr_manager'];

export default function HrExecEmployeesPage() {
  const { data, isLoading } = useHrExecDashboard({});
  const attendance = data?.data?.attendance || [];
  const leaves = data?.data?.leaveRequests || [];
  const documents = data?.data?.documents || [];

  const staffNames = Array.from(new Set([
    ...attendance.map((entry) => entry.staffName),
    ...leaves.map((entry) => entry.staffName),
    ...documents.map((entry) => entry.staffName),
  ])).sort();

  const getDept = (name: string) => attendance.find((entry) => entry.staffName === name)?.department || leaves.find((entry) => entry.staffName === name)?.department || 'N/A';
  const getAttendance = (name: string) => attendance.find((entry) => entry.staffName === name)?.status || '—';
  const getLeave = (name: string) => leaves.find((entry) => entry.staffName === name)?.status || '—';
  const getDoc = (name: string) => documents.find((entry) => entry.staffName === name)?.status || '—';

  return (
    <RoleGuard roles={HR_EXEC_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1000px]">
        <Breadcrumbs items={[{ label: 'HR Operations' }, { label: 'Employee Records' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Employee Directory" subtitle="Consolidated HR visibility across attendance, leaves, and documents" />
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-[420px] w-full rounded-xl" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-2 py-2 text-gray-400">Staff</th>
                      <th className="text-left px-2 py-2 text-gray-400">Department</th>
                      <th className="text-left px-2 py-2 text-gray-400">Attendance</th>
                      <th className="text-left px-2 py-2 text-gray-400">Leave</th>
                      <th className="text-left px-2 py-2 text-gray-400">Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffNames.map((name) => (
                      <tr key={name} className="border-b border-white/[0.04]">
                        <td className="px-2 py-2 text-white">{name}</td>
                        <td className="px-2 py-2">{getDept(name)}</td>
                        <td className="px-2 py-2">{getAttendance(name)}</td>
                        <td className="px-2 py-2">{getLeave(name)}</td>
                        <td className="px-2 py-2">{getDoc(name)}</td>
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
