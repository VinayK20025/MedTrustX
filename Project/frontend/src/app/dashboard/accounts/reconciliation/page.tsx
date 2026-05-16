'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AccountsInsightPanel, useAccountsDashboard } from '@/modules/accounts';
import { Skeleton } from '@/components/ui/Spinner';

export default function AccountsReconciliationPage() {
  const { data, isLoading } = useAccountsDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Finance' }, { label: 'Bank Reconciliation' }]} />
      <div className="h-[700px]"><AccountsInsightPanel reconciliation={data?.data?.reconciliation ?? []} auditLogs={data?.data?.auditLogs ?? []} /></div>
    </div>
  );
}
