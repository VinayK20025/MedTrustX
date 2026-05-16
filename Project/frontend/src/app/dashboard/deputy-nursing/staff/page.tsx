'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'deputy-nursing'} , {label:'Available Reserve Staff'}]} />
      <GenericDataTable 
        endpointKey="nursing" 
        title="Available Reserve Staff" 
        description="View and assign nurses currently marked as free or on standby."
      />
    </div>
  );
}
