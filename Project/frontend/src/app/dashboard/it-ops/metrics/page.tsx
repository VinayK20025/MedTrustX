'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'it-ops'} , {label:'Global Performance'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Global Performance" 
        description="Aggregated latency and throughput metrics across the network."
      />
    </div>
  );
}
