'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyReportsPanel } from '@/modules/pharmacy';

export default function PharmacyTechReportsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Tech' }, { label: 'Tech Logs' }]} />
      <PharmacyReportsPanel roleLabel="Pharmacy Tech" />
    </div>
  );
}
