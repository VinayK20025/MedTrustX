'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalPharmacyTherapyPanel } from '@/modules/clinical-pharmacy';

export default function ClinicalPharmacyTherapyPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Pharmacy' }, { label: 'Therapy Optimization' }]} />
      <ClinicalPharmacyTherapyPanel />
    </div>
  );
}
