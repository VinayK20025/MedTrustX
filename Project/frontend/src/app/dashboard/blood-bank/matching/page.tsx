'use client';
import React, { useEffect } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';
import { BloodBankWorkspace, useBloodBankDashboard } from '@/modules/blood-bank';
import { useUIStore } from '@/store/ui.store';

export default function BloodBankMatchingPage() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);
  const { data, isLoading } = useBloodBankDashboard({});

  useEffect(() => {
    setPageMeta('Blood Bank Matching', 'Crossmatch requests and compatibility checks');
  }, [setPageMeta]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  const units = data?.data?.units ?? [];
  const crossmatches = data?.data?.crossmatches ?? [];

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Blood Bank' }, { label: 'Matching' }]} />
        <BloodBankWorkspace units={units} crossmatches={crossmatches} defaultTab="crossmatch" />
      </div>
    </RoleGuard>
  );
}
