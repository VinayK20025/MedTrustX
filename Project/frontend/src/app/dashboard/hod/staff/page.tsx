'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'hod'} , {label:'Staff Management'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Staff Management" 
        description="Doctor workload distribution, case assignments, and availability management."
      />
    </div>
  );
}
