'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cto'} , {label:'Service Architecture Map'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Service Architecture Map" 
        description="Interactive microservice dependency graph with health overlays and traffic flow visualization."
      />
    </div>
  );
}
