'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyTechPackingPanel } from '@/modules/pharmacy-tech';

export default function PharmacyTechPackingPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Tech' }, { label: 'Packing Workflow' }]} />
      <PharmacyTechPackingPanel />
    </div>
  );
}
