'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'it-ops'} , {label:'Engineering Teams'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Engineering Teams" 
        description="On-call schedules and platform team assignments."
      />
    </div>
  );
}
