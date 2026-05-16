'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RedisDashboard } from '@/modules/redis';

export default function RedisRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Data Services' }, { label: 'Redis Cache' }]} />
      <RedisDashboard />
    </div>
  );
}
