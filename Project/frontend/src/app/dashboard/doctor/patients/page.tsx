'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GenericDataTable } from '@/components/ui/GenericDataTable';

export default function Page() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{label:'Dashboard'}, {label:'doctor'} , {label:'My Patients (OPD/IPD)'}]} />
      <GenericDataTable 
        endpointKey="patient" 
        title="My Patients (OPD/IPD)" 
        description="Full roster of assigned patients with diagnosis, status, and pending actions."
      />
    </div>
  );
}
