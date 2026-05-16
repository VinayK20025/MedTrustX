'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalPharmacyMonitoringPanel } from '@/modules/clinical-pharmacy';

export default function ClinicalPharmacyMonitoringPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Pharmacy' }, { label: 'Patient Monitoring' }]} />
      <ClinicalPharmacyMonitoringPanel />
    </div>
  );
}
