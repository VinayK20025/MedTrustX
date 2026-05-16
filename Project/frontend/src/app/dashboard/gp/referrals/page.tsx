'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'gp'} , {label:'Specialist Referrals'}]} />
      <GenericDataTable 
        endpointKey="er" 
        title="Specialist Referrals" 
        description="Route complex cases to Cardiology, Orthopedics, Neurology, etc."
      />
    </div>
  );
}
