'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { UltrasoundMeasurementPanel, useUltrasoundDashboard } from '@/modules/ultrasound';
import { Skeleton } from '@/components/ui/Spinner';

export default function UltrasoundMeasurementsPage() {
  const { data, isLoading } = useUltrasoundDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Measurements' }]} />
      <UltrasoundMeasurementPanel measurements={data?.data?.measurements ?? []} />
    </div>
  );
}
