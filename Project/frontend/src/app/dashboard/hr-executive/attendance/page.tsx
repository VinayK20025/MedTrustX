'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useHrExecDashboard } from '@/modules/hr-executive';
import { Skeleton } from '@/components/ui/Spinner';
import type { AttendanceEntry } from '@/modules/hr-executive/types/hrExec.types';
import { cn } from '@/utils/cn';

const statusColor: Record<AttendanceEntry['status'], string> = {
  Present: 'text-success-light', Late: 'text-warning-light', Absent: 'text-emergency-light', 'Half Day': 'text-blue-300',
};

export default function HrExecAttendancePage() {
  const { data, isLoading } = useHrExecDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  const att = data?.data?.attendance ?? [];
  return (
    <div className="space-y-5 animate-fade-in max-w-[1000px]">
      <Breadcrumbs items={[{ label: 'HR Operations' }, { label: 'Attendance Logs' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light">
        <CardHeader className="px-5 py-4 border-b border-white/[0.04]"><h3 className="text-[14px] font-bold text-white">Today's Attendance</h3></CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-black/20 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
              <tr><th className="px-5 py-3">Staff</th><th className="px-5 py-3">Dept</th><th className="px-5 py-3">Check-In</th><th className="px-5 py-3">Check-Out</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {att.map(a => (
                <tr key={a.id} className={cn("hover:bg-white/[0.02]", a.needsCorrection && "bg-warning/[0.03]")}>
                  <td className="px-5 py-3 font-bold text-white">{a.staffName}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono">{a.department}</td>
                  <td className="px-5 py-3 text-gray-300 font-mono">{a.checkIn}</td>
                  <td className="px-5 py-3 text-gray-300 font-mono">{a.checkOut || '—'}</td>
                  <td className={cn("px-5 py-3 font-bold font-mono", statusColor[a.status])}>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
