'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NutritionIntakePanel, useNutritionDashboard } from '@/modules/nutrition';
import { Skeleton } from '@/components/ui/Spinner';

export default function NutritionIntakePage() {
  const { data, isLoading } = useNutritionDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Nutrition' }, { label: 'Intake Tracking' }]} />
      <NutritionIntakePanel logs={data?.data?.intakeLogs ?? []} />
    </div>
  );
}
