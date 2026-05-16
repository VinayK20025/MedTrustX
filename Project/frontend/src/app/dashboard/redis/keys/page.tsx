'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CacheKeysPanel } from '@/modules/redis';

export default function RedisKeysRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redis Cache' }, { label: 'Cache Registry' }]} />
      <CacheKeysPanel />
    </div>
  );
}
