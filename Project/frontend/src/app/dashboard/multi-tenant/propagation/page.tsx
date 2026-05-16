'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ContextPropagationPanel } from '@/modules/multi-tenant';

export default function TenantPropagationRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Multi-Tenant Isolation' }, { label: 'Context Propagation' }]} />
      <ContextPropagationPanel />
    </div>
  );
}
