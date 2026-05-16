'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function DischargeDocumentsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Patient Flow' }, { label: 'Discharge Documents' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Document Preparation</p>
          <p className="text-sm">Generate discharge summaries, prescriptions, and follow-up instructions.</p>
        </CardBody>
      </Card>
    </div>
  );
}
