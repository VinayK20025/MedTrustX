'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function GuardPatrolPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[900px]">
      <Breadcrumbs items={[{ label: 'Security Guard' }, { label: 'Patrol Routes' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Patrol Routes & Checkpoints</p>
          <p className="text-sm">Check in at assigned patrol points and log zone inspections.</p>
        </CardBody>
      </Card>
    </div>
  );
}
