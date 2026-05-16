'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyReportsPanel } from '@/modules/pharmacy';

export default function ClinicalPharmacyReportsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Pharmacy' }, { label: 'Clinical Reports' }]} />
      <PharmacyReportsPanel roleLabel="Clinical Pharmacy" />
    </div>
  );
}
