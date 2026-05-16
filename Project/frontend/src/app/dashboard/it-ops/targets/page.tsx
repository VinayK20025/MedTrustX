'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'it-ops'} , {label:'SLA Governance'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="SLA Governance" 
        description="Define and monitor Service Level Agreements across platforms."
      />
    </div>
  );
}
