'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'unit-head'} , {label:'Live Patient Grid'}]} />
      <GenericDataTable 
        endpointKey="patient" 
        title="Live Patient Grid" 
        description="Full bed grid with real-time vitals streaming, severity coding, and intervention triggers."
      />
    </div>
  );
}
