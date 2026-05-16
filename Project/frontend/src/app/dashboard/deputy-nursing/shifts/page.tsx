'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'deputy-nursing'} , {label:'Live Shift Execution'}]} />
      <GenericDataTable 
        endpointKey="nursing" 
        title="Live Shift Execution" 
        description="Track real-time shift assignments, extensions, and reallocations."
      />
    </div>
  );
}
