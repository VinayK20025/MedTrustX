'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalPharmacyCommunicationPanel } from '@/modules/clinical-pharmacy';

export default function ClinicalPharmacyCommunicationPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Pharmacy' }, { label: 'Physician Communication' }]} />
      <ClinicalPharmacyCommunicationPanel />
    </div>
  );
}
