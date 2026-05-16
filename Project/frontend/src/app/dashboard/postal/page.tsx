'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PostalDashboard } from '@/modules/postal';

export default function PostalRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Communication Services' }, { label: 'Postal Mail' }]} />
      <PostalDashboard />
    </div>
  );
}
