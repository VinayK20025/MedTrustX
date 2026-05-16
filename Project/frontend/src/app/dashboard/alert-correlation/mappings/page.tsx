'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AlertMappingsPanel } from '@/modules/alert-correlation';

export default function AlertMappingsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Alert Correlation Engine' }, { label: 'AI Alert Mappings' }]} />
      <AlertMappingsPanel />
    </div>
  );
}
