'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'resident'} , {label:'Escalations'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Escalations" 
        description="Manage critical alerts from nursing staff and escalate to consultants if necessary."
      />
    </div>
  );
}
