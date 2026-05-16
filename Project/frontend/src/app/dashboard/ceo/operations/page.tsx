'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OperationsCommandGrid } from '@/modules/ceo';

export default function OperationsCommandGridRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CEO View' }, { label: 'Operations Command Center' }]} />
      <OperationsCommandGrid />
    </div>
  );
}
