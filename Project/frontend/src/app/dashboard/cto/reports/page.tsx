'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cto'} , {label:'Engineering Reports'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Engineering Reports" 
        description="Sprint velocity, deployment frequency, MTTR/MTTD, and engineering efficiency metrics."
      />
    </div>
  );
}
