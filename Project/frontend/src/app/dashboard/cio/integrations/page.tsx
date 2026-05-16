'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cio'} , {label:'External Integrations'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="External Integrations" 
        description="Monitor webhook health, vendor APIs, and third-party system connections."
      />
    </div>
  );
}
