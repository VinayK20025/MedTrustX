'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TenantsPanel } from '@/modules/multi-tenant';

export default function TenantRegistryRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Multi-Tenant Isolation' }, { label: 'Tenant Registry' }]} />
      <TenantsPanel />
    </div>
  );
}
