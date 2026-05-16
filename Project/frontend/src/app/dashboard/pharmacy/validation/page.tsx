'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyValidationPanel } from '@/modules/pharmacy';

export default function PharmacyValidationPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy' }, { label: 'Clinical Validation' }]} />
      <PharmacyValidationPanel />
    </div>
  );
}
