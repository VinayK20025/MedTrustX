'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sre'} , {label:'Active Incidents'}]} />
      <GenericDataTable 
        endpointKey="accessReview" 
        title="Active Incidents" 
        description="Ongoing outages and degradation events."
      />
    </div>
  );
}
