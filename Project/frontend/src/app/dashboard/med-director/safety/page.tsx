'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'med-director'} , {label:'Patient Safety & Incident Management'}]} />
      <GenericDataTable 
        endpointKey="fireSafetySystems" 
        title="Patient Safety & Incident Management" 
        description="Full incident lifecycle: reporting → investigation → root cause analysis → corrective action → closure."
      />
    </div>
  );
}
