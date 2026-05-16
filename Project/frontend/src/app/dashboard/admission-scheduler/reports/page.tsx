'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function AdmissionReportsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Admissions' }, { label: 'Admission Logs' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Admission & Scheduling Reports</p>
          <p className="text-sm">Daily admission volume, slot utilization, and bed turnover logs.</p>
        </CardBody>
      </Card>
    </div>
  );
}
