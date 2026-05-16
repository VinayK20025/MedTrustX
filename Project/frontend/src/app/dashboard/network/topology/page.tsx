'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Card, CardBody } from '@/components/ui/Card';

export default function NetworkTopologyPage() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'IT Administration' }, { label: 'Network Map' }]} />
      <Card className="border-white/[0.06] shadow-glass bg-surface-light min-h-[400px] flex items-center justify-center">
        <CardBody className="text-gray-500 text-center">
          <p className="text-lg">Network Topology & Devices</p>
          <p className="text-sm">Visualize hospital routers, switches, edge firewalls, and wireless APs.</p>
        </CardBody>
      </Card>
    </div>
  );
}
