'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PhlebotomyHandoverPanel, usePhlebotomyDashboard } from '@/modules/phlebotomy-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function PhlebotomyHandoverPage() {
  const { data, isLoading } = usePhlebotomyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Lab Handover' }]} />
      <PhlebotomyHandoverPanel batches={data?.data?.handoverBatches ?? []} />
    </div>
  );
}
