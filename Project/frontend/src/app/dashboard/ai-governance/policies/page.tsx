'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GovernancePoliciesPanel } from '@/modules/ai-governance';

export default function AiPoliciesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'AI Governance' }, { label: 'Governance Policies' }]} />
      <GovernancePoliciesPanel />
    </div>
  );
}
