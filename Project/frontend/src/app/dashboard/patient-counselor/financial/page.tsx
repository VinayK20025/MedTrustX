'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CounselorCostPanel, usePatientCounselorDashboard } from '@/modules/patient-counselor';
import { Skeleton } from '@/components/ui/Spinner';

export default function PatientCounselorFinancialPage() {
  const { data, isLoading } = usePatientCounselorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Patient Counseling' }, { label: 'Cost Estimation' }]} />
      <CounselorCostPanel estimate={data?.data?.activeEstimate} />
    </div>
  );
}
