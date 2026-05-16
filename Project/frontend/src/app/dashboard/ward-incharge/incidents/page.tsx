'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'ward-incharge'} , {label:'Incident Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Incident Management" 
        description="Log and review ward-level incidents, near-misses, or equipment issues."
      />
    </div>
  );
}
