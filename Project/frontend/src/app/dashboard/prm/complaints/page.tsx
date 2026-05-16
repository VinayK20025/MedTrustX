'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PrmComplaintPanel, usePrmDashboard } from '@/modules/prm';
import { Skeleton } from '@/components/ui/Spinner';

export default function PrmComplaintsPage() {
  const { data, isLoading } = usePrmDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Patient Experience' }, { label: 'Complaint Resolution' }]} />
      <PrmComplaintPanel complaints={data?.data?.activeComplaints ?? []} />
    </div>
  );
}
