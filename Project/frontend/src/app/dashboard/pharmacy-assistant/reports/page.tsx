'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyReportsPanel } from '@/modules/pharmacy';

export default function PharmacyAssistantReportsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Front Desk' }, { label: 'Shift Logs' }]} />
      <PharmacyReportsPanel roleLabel="Front Desk" />
    </div>
  );
}
