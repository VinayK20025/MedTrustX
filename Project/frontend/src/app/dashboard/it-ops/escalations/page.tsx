'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'it-ops'} , {label:'Escalation Pathways'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Escalation Pathways" 
        description="Track incidents escalated to Level 3 support or vendors."
      />
    </div>
  );
}
