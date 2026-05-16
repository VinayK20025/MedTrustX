'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'assistant'} , {label:'Patient Calls'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Patient Calls" 
        description="Respond to nurse calls or assistance requests from beds."
      />
    </div>
  );
}
