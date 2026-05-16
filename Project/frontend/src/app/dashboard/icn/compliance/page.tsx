'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'icn'} , {label:'Hygiene Audits'}]} />
      <GenericDataTable 
        endpointKey="compliance" 
        title="Hygiene Audits" 
        description="Monitor hand hygiene, sterilization, and PPE protocol adherence."
      />
    </div>
  );
}
