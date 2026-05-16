'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function HimAuditsPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Data Governance' }, { label: 'Documentation Audits' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light h-full min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Audit Logs</p>
          <p className="text-sm">Randomly sample EHRs to verify documentation accuracy by department.</p>
        </CardBody>
      </Card>
    </div>
  );
}
