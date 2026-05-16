'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'deputy-nursing'} , {label:'Delayed Task Escalations'}]} />
      <GenericDataTable 
        endpointKey="nursing" 
        title="Delayed Task Escalations" 
        description="Manage escalated clinical tasks that have breached their SLA."
      />
    </div>
  );
}
