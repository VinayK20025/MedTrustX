'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MroRecordList, useMroDashboard } from '@/modules/mro';
import { Skeleton } from '@/components/ui/Spinner';

export default function MroRecordsPage() {
  const { data, isLoading } = useMroDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Health Information Management' }, { label: 'Patient Records' }]} />
      <MroRecordList records={data?.data?.records ?? []} />
    </div>
  );
}
