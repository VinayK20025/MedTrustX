'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cio'} , {label:'Microservices Health'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Microservices Health" 
        description="Detailed latency, error rate, and SLI tracking for all running microservices."
      />
    </div>
  );
}
