'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ZeroTrustNetworkDashboard } from '@/modules/zero-trust-network';

export default function ZeroTrustNetworkRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Security' }, { label: 'Zero Trust Network Control' }]} />
      <ZeroTrustNetworkDashboard />
    </div>
  );
}
