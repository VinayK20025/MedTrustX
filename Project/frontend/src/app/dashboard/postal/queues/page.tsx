'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmailQueuesPanel } from '@/modules/postal';

export default function PostalQueuesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Postal Mail' }, { label: 'Retry Queues' }]} />
      <EmailQueuesPanel />
    </div>
  );
}
