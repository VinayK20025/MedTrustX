'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AiGovernanceDashboard } from '@/modules/ai-governance';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function AiGovernanceRoute() {
  return (
    <RoleGuard roles={['ai-governance-officer', 'ai-governance', 'ai-ethics-specialist', 'super_admin']} requireAll={false}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'AI Governance & Explainability' }]} />
        <AiGovernanceDashboard />
      </div>
    </RoleGuard>
  );
}
