'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CounselorSessionPanel, usePatientCounselorDashboard } from '@/modules/patient-counselor';
import { Skeleton } from '@/components/ui/Spinner';

export default function PatientCounselorSessionsPage() {
  const { data, isLoading } = usePatientCounselorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Patient Counseling' }, { label: 'Active Session' }]} />
      <CounselorSessionPanel session={data?.data?.activeSession} treatment={data?.data?.activeTreatment} />
    </div>
  );
}
