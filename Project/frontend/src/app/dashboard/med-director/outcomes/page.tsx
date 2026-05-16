'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'med-director'} , {label:'Quality Outcomes & Clinical KPIs'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Quality Outcomes & Clinical KPIs" 
        description="Mortality, HAI, SSI, CLABSI, falls tracking against NABH/JCI benchmarks with trend analysis."
      />
    </div>
  );
}
