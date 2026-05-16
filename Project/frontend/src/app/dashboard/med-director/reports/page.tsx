'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'med-director'} , {label:'Executive Clinical Reports'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Executive Clinical Reports" 
        description="Generate board-ready clinical governance reports, quality trend summaries, and safety performance documentation."
      />
    </div>
  );
}
