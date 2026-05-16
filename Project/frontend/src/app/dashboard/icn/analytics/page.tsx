'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'icn'} , {label:'Infection Trends'}]} />
      <GenericDataTable 
        endpointKey="analytics" 
        title="Infection Trends" 
        description="Analyze infection rates over time and identify hospital hotspots."
      />
    </div>
  );
}
