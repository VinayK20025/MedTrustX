'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function CctvLivePage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Security' }, { label: 'Live Grid View' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Full-Screen Live View</p>
          <p className="text-sm">4/9/16 camera grid with zone filtering and AI-assisted motion overlays.</p>
        </CardBody>
      </Card>
    </div>
  );
}
