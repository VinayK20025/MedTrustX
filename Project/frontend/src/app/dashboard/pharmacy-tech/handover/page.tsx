'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyTechHandoverPanel } from '@/modules/pharmacy-tech';

export default function PharmacyTechHandoverPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Tech' }, { label: 'Pharmacist Handover' }]} />
      <PharmacyTechHandoverPanel />
    </div>
  );
}
