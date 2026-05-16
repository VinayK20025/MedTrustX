'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'it-ops'} , {label:'Executive Reports'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Executive Reports" 
        description="Monthly SLA compliance and incident summaries for leadership."
      />
    </div>
  );
}
