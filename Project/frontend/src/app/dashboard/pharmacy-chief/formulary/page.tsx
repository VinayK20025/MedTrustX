'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyFormularyPanel } from '@/modules/pharmacy-chief';

export default function PharmacyChiefFormularyPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy' }, { label: 'Formulary' }]} />
      <PharmacyFormularyPanel />
    </div>
  );
}
