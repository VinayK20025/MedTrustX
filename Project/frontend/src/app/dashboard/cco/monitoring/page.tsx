'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cco'} , {label:'Compliance Risk Monitoring'}]} />
      <GenericDataTable 
        endpointKey="prometheusMonitoring" 
        title="Compliance Risk Monitoring" 
        description="Department-level risk heat maps, compliance trend analysis, and proactive alert configuration."
      />
    </div>
  );
}
