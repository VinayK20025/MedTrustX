'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'incident-responder'} , {label:'containment'}]} />
      <GenericDataTable 
        endpointKey="ai" 
        title="containment Management" 
        description="Auto-generated production-grade data table powered by useAutoApi."
      />
    </div>
  );
}
