'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sr'} , {label:'Critical Escalations'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Critical Escalations" 
        description="Manage escalations from junior staff and escalate to consultants if necessary."
      />
    </div>
  );
}
