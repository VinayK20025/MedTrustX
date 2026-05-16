'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'jr'} , {label:'Supervisor Alerts'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Supervisor Alerts" 
        description="Direct notes and urgent instructions from your supervising doctors."
      />
    </div>
  );
}
