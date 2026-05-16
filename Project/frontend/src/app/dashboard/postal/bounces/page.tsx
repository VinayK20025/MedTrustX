'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmailBouncesPanel } from '@/modules/postal';

export default function PostalBouncesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Postal Mail' }, { label: 'Bounce Analytics' }]} />
      <EmailBouncesPanel />
    </div>
  );
}
