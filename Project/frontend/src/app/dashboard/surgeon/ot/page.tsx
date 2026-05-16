'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'surgeon'} , {label:'OT Scheduling'}]} />
      <GenericDataTable 
        endpointKey="ot" 
        title="OT Scheduling" 
        description="Manage operation theatre slots, team assignments, and block times."
      />
    </div>
  );
}
