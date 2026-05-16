'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RateLimitsPanel } from '@/modules/redis';

export default function RedisRateLimitsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redis Cache' }, { label: 'API Rate Limits' }]} />
      <RateLimitsPanel />
    </div>
  );
}
