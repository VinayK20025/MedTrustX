'use client';

import React from 'react';
import { ClinicalRecordsWorkspace } from '../components/ClinicalRecordsWorkspace';

export function ClinicalDashboard({ roleTitle }: { roleTitle?: string }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <ClinicalRecordsWorkspace roleTitle={roleTitle} />
    </div>
  );
}
