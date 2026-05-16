'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function CctvPlaybackPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <Breadcrumbs items={[{ label: 'Security' }, { label: 'Playback' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Recorded Footage Playback</p>
          <p className="text-sm">Scrub timelines, export evidence clips, and verify logged incidents.</p>
        </CardBody>
      </Card>
    </div>
  );
}
