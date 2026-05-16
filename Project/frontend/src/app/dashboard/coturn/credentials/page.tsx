'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TurnCredentialsPanel } from '@/modules/coturn';

export default function CoturnCredentialsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Coturn Relay' }, { label: 'TURN Credentials' }]} />
      <TurnCredentialsPanel />
    </div>
  );
}
