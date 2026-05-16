'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'ward-incharge'} , {label:'Staff Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Staff Management" 
        description="Manage nursing assignments, balance workloads, and track staff breaks."
      />
    </div>
  );
}
