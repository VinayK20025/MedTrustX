'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HrExecLeavePanel, useHrExecDashboard } from '@/modules/hr-executive';
import { Skeleton } from '@/components/ui/Spinner';

export default function HrExecLeavesPage() {
  const { data, isLoading } = useHrExecDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[800px]">
      <Breadcrumbs items={[{ label: 'HR Operations' }, { label: 'Leave Requests' }]} />
      <div className="h-[700px]"><HrExecLeavePanel leaves={data?.data?.leaveRequests ?? []} /></div>
    </div>
  );
}
