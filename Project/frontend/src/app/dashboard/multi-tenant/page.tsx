'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MultiTenantDashboard } from '@/modules/multi-tenant';

export default function MultiTenantRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Multi-Tenant Isolation' }]} />
      <MultiTenantDashboard />
    </div>
  );
}
