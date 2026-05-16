'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'ward-incharge'} , {label:'Ward Reports'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Ward Reports" 
        description="Generate end-of-shift reports detailing care delivery metrics and handovers."
      />
    </div>
  );
}
