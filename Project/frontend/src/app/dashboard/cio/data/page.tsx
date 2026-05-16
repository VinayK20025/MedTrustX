'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cio'} , {label:'Data Pipelines'}]} />
      <GenericDataTable 
        endpointKey="dataFabricIntegrationHub" 
        title="Data Pipelines" 
        description="Manage ETL workflows, HL7 ingestion, and batch data synchronizations."
      />
    </div>
  );
}
