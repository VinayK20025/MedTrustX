'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'cno'} , {label:'Nursing Reports Dashboard'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Nursing Reports Dashboard" 
        description="Generate reports on staffing compliance, missed care trends, and shift performance."
      />
    </div>
  );
}
