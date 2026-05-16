'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'it-ops'} , {label:'Incident Coordination'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Incident Coordination" 
        description="War room view for active high-severity incidents."
      />
    </div>
  );
}
