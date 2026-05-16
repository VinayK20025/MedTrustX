'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sr'} , {label:'Shift Reports'}]} />
      <GenericDataTable 
        endpointKey="accessReview" 
        title="Shift Reports" 
        description="Generate end-of-shift reports summarizing ward status and team performance."
      />
    </div>
  );
}
