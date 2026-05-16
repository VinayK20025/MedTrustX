'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'jr'} , {label:'Assigned Tasks'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Assigned Tasks" 
        description="List of tasks assigned to you by senior residents or consultants."
      />
    </div>
  );
}
