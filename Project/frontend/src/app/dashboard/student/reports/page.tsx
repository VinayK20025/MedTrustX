'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'student'} , {label:'Learning Reports'}]} />
      <GenericDataTable 
        endpointKey="management" 
        title="Learning Reports" 
        description="Generate a comprehensive summary of your case observations and academic progress."
      />
    </div>
  );
}
