'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function EhrValidationPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Clinical Admin' }, { label: 'Data Checks' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Validation Rules & Warnings</p>
          <p className="text-sm">Manage required fields, detect missing diagnoses, and ensure ICD-10 compliance.</p>
        </CardBody>
      </Card>
    </div>
  );
}
