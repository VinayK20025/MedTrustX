'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MetCalibrationPanel, useMetDashboard } from '@/modules/met';
import { Skeleton } from '@/components/ui/Spinner';

export default function MetCalibrationPage() {
  const { data, isLoading } = useMetDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Facility Management' }, { label: 'Calibration & Testing' }]} />
      <MetCalibrationPanel records={data?.data?.calibrations ?? []} />
    </div>
  );
}
