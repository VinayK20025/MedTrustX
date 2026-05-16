'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmailMessagesPanel } from '@/modules/postal';

export default function PostalMessagesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Postal Mail' }, { label: 'Outbound Messages' }]} />
      <EmailMessagesPanel />
    </div>
  );
}
