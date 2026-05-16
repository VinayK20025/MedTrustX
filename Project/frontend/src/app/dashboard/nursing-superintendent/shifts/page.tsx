'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'nursing-superintendent'} , {label:'Shift Scheduling'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Shift Scheduling" 
        description="Draft, assign, and publish shift rosters for upcoming weeks."
      />
    </div>
  );
}
