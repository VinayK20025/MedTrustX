'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SessionStorePanel } from '@/modules/redis';

export default function RedisSessionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redis Cache' }, { label: 'Active Sessions' }]} />
      <SessionStorePanel />
    </div>
  );
}
