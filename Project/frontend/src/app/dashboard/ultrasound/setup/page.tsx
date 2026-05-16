'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { UltrasoundSetupPanel, useUltrasoundDashboard } from '@/modules/ultrasound';
import { Skeleton } from '@/components/ui/Spinner';

export default function UltrasoundSetupPage() {
  const { data, isLoading } = useUltrasoundDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Exam Setup' }]} />
      <UltrasoundSetupPanel activePatient={data?.data?.activePatient} presets={data?.data?.presets ?? []} />
    </div>
  );
}
