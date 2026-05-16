'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyCompliancePanel } from '@/modules/pharmacy-chief';

export default function PharmacyChiefCompliancePage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy' }, { label: 'Compliance Audit' }]} />
      <PharmacyCompliancePanel />
    </div>
  );
}
