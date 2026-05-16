'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sre'} , {label:'Uptime Reports'}]} />
      <GenericDataTable 
        endpointKey="accessReview" 
        title="Uptime Reports" 
        description="Monthly reliability and availability metrics for stakeholders."
      />
    </div>
  );
}
