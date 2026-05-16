'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'locum'} , {label:'Task Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Task Management" 
        description="Track and complete blood cultures, ABG reviews, and pending lab results."
      />
    </div>
  );
}
