'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function CctvReportsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Security' }, { label: 'Surveillance Reports' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Surveillance Analytics</p>
          <p className="text-sm">Analyze alert trends, peak activity zones, response times, and camera uptime.</p>
        </CardBody>
      </Card>
    </div>
  );
}
