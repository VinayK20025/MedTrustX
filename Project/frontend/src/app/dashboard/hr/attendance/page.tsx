'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useApproveLeave, useHrDashboard } from '@/modules/hr';

const HR_ROLES = ['hr_manager', 'super_admin', 'hospital_admin', 'hr_executive'];

export default function HrAttendancePage() {
  const { data, isLoading } = useHrDashboard({});
  const approveLeave = useApproveLeave();
  const staff = data?.data?.staffDirectory || [];
  const onLeave = staff.filter((s) => s.status === 'On Leave');
  const absent = staff.filter((s) => s.status === 'Absent');

  return (
    <RoleGuard roles={HR_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1200px]">
        <Breadcrumbs items={[{ label: 'HR' }, { label: 'Attendance & Leave' }]} />
        <Card className="border-white/[0.06] shadow-glass bg-surface-light">
          <CardHeader title="Attendance and Leave Control" subtitle="Real-time status snapshot and leave approvals" />
          <CardBody>
            {isLoading ? (
              <p className="text-gray-500">Loading attendance data...</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"><p className="text-xs text-gray-400">On Duty</p><p className="text-lg font-bold text-white">{staff.filter((s) => s.status === 'On Duty').length}</p></div>
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"><p className="text-xs text-gray-400">Off Duty</p><p className="text-lg font-bold text-white">{staff.filter((s) => s.status === 'Off Duty').length}</p></div>
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3"><p className="text-xs text-gray-400">On Leave</p><p className="text-lg font-bold text-white">{onLeave.length}</p></div>
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3"><p className="text-xs text-gray-400">Absent</p><p className="text-lg font-bold text-white">{absent.length}</p></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">Pending Leave Approvals</p>
                  {onLeave.length === 0 ? (
                    <p className="text-gray-500 text-sm">No pending leave approvals</p>
                  ) : (
                    onLeave.map((member) => (
                      <div key={member.id} className="rounded-lg border border-white/[0.08] bg-surface-dark p-3 flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.role} | {member.department}</p>
                        </div>
                        <button
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
                          onClick={() => approveLeave.mutate(member.id)}
                          disabled={approveLeave.isPending}
                        >
                          Approve Leave
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </RoleGuard>
  );
}
