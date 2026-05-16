'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyTechLabelingPanel } from '@/modules/pharmacy-tech';

export default function PharmacyTechLabelingPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Tech' }, { label: 'Label Printing' }]} />
      <PharmacyTechLabelingPanel />
    </div>
  );
}
