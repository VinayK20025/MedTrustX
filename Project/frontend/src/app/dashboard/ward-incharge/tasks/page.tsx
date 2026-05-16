'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'ward-incharge'} , {label:'Nursing Task Board'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Nursing Task Board" 
        description="Kanban view of all pending, active, and completed nursing tasks for the ward."
      />
    </div>
  );
}
