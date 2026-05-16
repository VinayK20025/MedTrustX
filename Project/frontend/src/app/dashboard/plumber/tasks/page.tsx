'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function PlumberTasksPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Facility' }, { label: 'Plumbing Tasks' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Plumbing Maintenance Tasks</p>
          <p className="text-sm">Manage critical leaks, pipe bursts, and drainage clearances.</p>
        </CardBody>
      </Card>
    </div>
  );
}
