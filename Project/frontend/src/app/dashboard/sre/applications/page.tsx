'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'sre'} , {label:'Service Registry'}]} />
      <GenericDataTable 
        endpointKey="accessReview" 
        title="Service Registry" 
        description="List of all microservices and their current health status."
      />
    </div>
  );
}
