'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sre'} , {label:'Observability Metrics'}]} />
      <GenericDataTable 
        endpointKey="accessReview" 
        title="Observability Metrics" 
        description="CPU, Memory, Latency, and Throughput graphs."
      />
    </div>
  );
}
