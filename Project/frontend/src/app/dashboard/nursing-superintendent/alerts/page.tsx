'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'nursing-superintendent'} , {label:'Workforce Alerts'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Workforce Alerts" 
        description="Respond immediately to critical staffing shortages or severe care delays."
      />
    </div>
  );
}
