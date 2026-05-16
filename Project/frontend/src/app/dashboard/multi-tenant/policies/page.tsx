'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IsolationPoliciesPanel } from '@/modules/multi-tenant';

export default function TenantPoliciesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Multi-Tenant Isolation' }, { label: 'Isolation Policies' }]} />
      <IsolationPoliciesPanel />
    </div>
  );
}
