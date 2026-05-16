'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RadiologyAnnotationPanel, useRadiologyDashboard } from '@/modules/radiology';
import { Skeleton } from '@/components/ui/Spinner';

export default function RadiologyAnnotationsPage() {
  const { data, isLoading } = useRadiologyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Image Markups' }]} />
      <RadiologyAnnotationPanel annotations={data?.data?.annotations ?? []} />
    </div>
  );
}
