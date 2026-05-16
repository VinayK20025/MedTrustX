'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'deputy-nursing'} , {label:'Shift Execution Reports'}]} />
      <GenericDataTable 
        endpointKey="nursing" 
        title="Shift Execution Reports" 
        description="Export logs on shift adherence, coverage gaps, and resolution times."
      />
    </div>
  );
}
