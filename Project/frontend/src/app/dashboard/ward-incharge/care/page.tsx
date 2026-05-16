'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'ward-incharge'} , {label:'Care Management'}]} />
      <GenericDataTable 
        endpointKey="careCoordination" 
        title="Care Management" 
        description="Oversee medication administration schedules and clinical procedures."
      />
    </div>
  );
}
