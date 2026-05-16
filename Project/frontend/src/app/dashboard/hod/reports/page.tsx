'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'hod'} , {label:'Department Reports'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Department Reports" 
        description="Generate performance summaries, outcome reports, and staff productivity analytics."
      />
    </div>
  );
}
